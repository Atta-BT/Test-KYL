import { Router } from 'express';
import { query } from '../db.js';
import { requireRole } from '../auth.js';

const router = Router();

// All member management is restricted to ADMIN.
router.use(requireRole('ADMIN'));

// GET /api/members
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT user_id, username, email, status FROM users WHERE role = 'MEMBER' ORDER BY username ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/members/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT user_id, username, email, status FROM users WHERE user_id = $1 AND role = 'MEMBER'`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Member not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
