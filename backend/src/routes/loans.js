import { Router } from 'express';
import { query, getClient } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

const LOAN_PERIOD_DAYS = 14;

// Every loan endpoint requires authentication.
router.use(requireAuth);

// GET /api/loans?status=&overdue=true
// Members only see their own borrowings; ADMIN sees all.
router.get('/', async (req, res, next) => {
  try {
    const { status, overdue } = req.query;
    const clauses = [];
    const params = [];

    if (req.user.role === 'MEMBER') {
      params.push(req.user.id);
      clauses.push(`b.user_id = $${params.length}`);
    }

    if (status) {
      if (status === 'borrowed') {
        clauses.push(`b.status IN ('PENDING', 'APPROVED')`);
      } else {
        params.push(status);
        clauses.push(`b.status = $${params.length}`);
      }
    }
    if (overdue === 'true') {
      clauses.push(`b.status = 'APPROVED' AND b.due_date < CURRENT_TIMESTAMP`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT b.transaction_id, b.user_id, b.copy_id, b.borrow_date, b.due_date, b.return_date, b.status,
              bk.book_id, bk.title AS book_title, bk.author AS book_author,
              u.username AS member_name, u.email AS member_email,
              (b.status = 'APPROVED' AND b.due_date < CURRENT_TIMESTAMP) AS is_overdue
       FROM borrowings b
       JOIN book_copies bc ON bc.copy_id = b.copy_id
       JOIN books bk ON bk.book_id = bc.book_id
       JOIN users u ON u.user_id = b.user_id
       ${where}
       ORDER BY b.borrow_date DESC`,
      params,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/loans  { book_id }  -> request to borrow a book
// Finds an available copy and creates a PENDING borrowing.
router.post('/', async (req, res, next) => {
  const { book_id } = req.body;
  if (!book_id) {
    return res.status(400).json({ error: 'book_id is required' });
  }

  const user_id = req.user.id;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Find an available copy
    const copyRes = await client.query(
      `SELECT copy_id FROM book_copies
       WHERE book_id = $1 AND status = 'AVAILABLE'
       LIMIT 1 FOR UPDATE`,
      [book_id],
    );
    if (!copyRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'No available copies for this book' });
    }
    const copy_id = copyRes.rows[0].copy_id;

    // Mark copy as borrowed
    await client.query(
      `UPDATE book_copies SET status = 'BORROWED' WHERE copy_id = $1`,
      [copy_id],
    );

    // Create borrowing record (PENDING status)
    const loanRes = await client.query(
      `INSERT INTO borrowings (user_id, copy_id, borrow_date, due_date, status)
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + ($3 || ' days')::interval, 'PENDING')
       RETURNING *`,
      [user_id, copy_id, LOAN_PERIOD_DAYS],
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
// Members may only return their own borrowings; ADMIN may return any.
router.post('/:id/return', async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const loanRes = await client.query(
      'SELECT * FROM borrowings WHERE transaction_id = $1 FOR UPDATE',
      [req.params.id],
    );
    if (!loanRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Borrowing not found' });
    }
    if (req.user.role === 'MEMBER' && loanRes.rows[0].user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'You can only return your own borrowings' });
    }
    if (loanRes.rows[0].status === 'RETURNED') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'This borrowing was already returned' });
    }

    const updated = await client.query(
      `UPDATE borrowings SET status = 'RETURNED', return_date = CURRENT_TIMESTAMP WHERE transaction_id = $1 RETURNING *`,
      [req.params.id],
    );

    // Mark the copy as available again
    await client.query(
      `UPDATE book_copies SET status = 'AVAILABLE' WHERE copy_id = $1`,
      [loanRes.rows[0].copy_id],
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
