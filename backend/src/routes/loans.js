import { Router } from 'express';
import { query, getClient } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

const LOAN_PERIOD_DAYS = 14;

// Every loan endpoint requires authentication.
router.use(requireAuth);

// GET /api/loans?status=borrowed|returned&overdue=true
// Members only see their own loans; librarians see all.
router.get('/', async (req, res, next) => {
  try {
    const { status, overdue } = req.query;
    const clauses = [];
    const params = [];

    if (req.user.role === 'member') {
      params.push(req.user.member_id);
      clauses.push(`l.member_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      clauses.push(`l.status = $${params.length}`);
    }
    if (overdue === 'true') {
      clauses.push(`l.status = 'borrowed' AND l.due_date < CURRENT_DATE`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT l.*, b.title AS book_title, b.author AS book_author,
              m.name AS member_name, m.email AS member_email,
              (l.status = 'borrowed' AND l.due_date < CURRENT_DATE) AS is_overdue
       FROM loans l
       JOIN books b ON b.id = l.book_id
       JOIN members m ON m.id = l.member_id
       ${where}
       ORDER BY l.borrowed_at DESC`,
      params,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/loans  { book_id, member_id? }  -> borrow a book
// Members borrow for themselves; librarians may borrow on behalf of a member.
router.post('/', async (req, res, next) => {
  const { book_id } = req.body;
  if (!book_id) {
    return res.status(400).json({ error: 'book_id is required' });
  }

  let member_id;
  if (req.user.role === 'member') {
    member_id = req.user.member_id;
    if (!member_id) {
      return res.status(400).json({ error: 'Your account is not linked to a library member' });
    }
  } else {
    member_id = req.body.member_id;
    if (!member_id) {
      return res.status(400).json({ error: 'member_id is required when borrowing on behalf of a member' });
    }
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const bookRes = await client.query(
      'SELECT * FROM books WHERE id = $1 FOR UPDATE',
      [book_id],
    );
    if (!bookRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Book not found' });
    }
    if (bookRes.rows[0].available_copies < 1) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'No available copies for this book' });
    }

    const memberRes = await client.query('SELECT id FROM members WHERE id = $1', [member_id]);
    if (!memberRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Member not found' });
    }

    await client.query(
      'UPDATE books SET available_copies = available_copies - 1 WHERE id = $1',
      [book_id],
    );

    const loanRes = await client.query(
      `INSERT INTO loans (book_id, member_id, due_date, status)
       VALUES ($1, $2, CURRENT_DATE + $3::int, 'borrowed')
       RETURNING *`,
      [book_id, member_id, LOAN_PERIOD_DAYS],
    );

    await client.query('COMMIT');
    res.status(201).json(loanRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// POST /api/loans/:id/return -> return a borrowed book
// Members may only return their own loans; librarians may return any.
router.post('/:id/return', async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const loanRes = await client.query(
      'SELECT * FROM loans WHERE id = $1 FOR UPDATE',
      [req.params.id],
    );
    if (!loanRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Loan not found' });
    }
    if (req.user.role === 'member' && loanRes.rows[0].member_id !== req.user.member_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'You can only return your own loans' });
    }
    if (loanRes.rows[0].status === 'returned') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'This loan was already returned' });
    }

    const updated = await client.query(
      `UPDATE loans SET status = 'returned', returned_at = now() WHERE id = $1 RETURNING *`,
      [req.params.id],
    );
    await client.query(
      'UPDATE books SET available_copies = available_copies + 1 WHERE id = $1',
      [loanRes.rows[0].book_id],
    );

    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

export default router;
