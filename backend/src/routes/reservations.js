import { Router } from 'express';
import { query, getClient } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.use(requireAuth);

// GET /api/reservations
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const clauses = [];
    const params = [];

    if (req.user.role === 'MEMBER') {
      params.push(req.user.id);
      clauses.push(`r.user_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      clauses.push(`r.status = $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT r.*, b.title AS book_title, b.author AS book_author, u.username
       FROM reservations r
       JOIN books b ON b.book_id = r.book_id
       JOIN users u ON u.user_id = r.user_id
       ${where}
       ORDER BY r.reserve_date DESC`,
      params,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/reservations { book_id }
router.post('/', async (req, res, next) => {
  const { book_id } = req.body;
  if (!book_id) {
    return res.status(400).json({ error: 'book_id is required' });
  }

  try {
    const { rows } = await query(
      `INSERT INTO reservations (user_id, book_id, status)
       VALUES ($1, $2, 'WAITING')
       RETURNING *`,
      [req.user.id, book_id],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/reservations/:id/cancel
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE reservations SET status = 'CANCELLED'
       WHERE reservation_id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id],
    );
    if (!rows.length) return res.status(404).json({ error: 'Reservation not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
