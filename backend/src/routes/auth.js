import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, getClient } from '../db.js';
import { signToken, requireAuth } from '../auth.js';

const router = Router();

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, member_id: u.member_id };
}

// POST /api/auth/register -> creates a member-role user (and a linked member record)
router.post('/register', async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');
    const hash = await bcrypt.hash(password, 10);

    const memberRes = await client.query(
      `INSERT INTO members (name, email, phone) VALUES ($1, $2, $3) RETURNING id`,
      [name, email, phone],
    );
    const memberId = memberRes.rows[0].id;

    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, member_id)
       VALUES ($1, $2, $3, 'member', $4)
       RETURNING id, name, email, role, member_id`,
      [name, email, hash, memberId],
    );

    await client.query('COMMIT');
    const user = userRes.rows[0];
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }
    next(err);
  } finally {
    client.release();
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      member_id: req.user.member_id,
    },
  });
});

export default router;
