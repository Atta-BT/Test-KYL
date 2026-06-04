import { Router } from 'express';
import { query } from '../db.js';
import { requireRole } from '../auth.js';

const router = Router();

// All member management is restricted to librarians.
router.use(requireRole('librarian'));

// GET /api/members
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM members ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/members/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM members WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Member not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/members
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }
    const { rows } = await query(
      `INSERT INTO members (name, email, phone) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, phone],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A member with that email already exists' });
    }
    next(err);
  }
});

export default router;
