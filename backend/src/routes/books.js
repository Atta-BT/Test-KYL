import { Router } from 'express';
import { query } from '../db.js';
import { requireRole } from '../auth.js';

const router = Router();

// GET /api/books?search=&category=
router.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const clauses = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      clauses.push(`(title ILIKE $${params.length} OR author ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      clauses.push(`category = $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT * FROM books ${where} ORDER BY title ASC`,
      params,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/books/categories - distinct categories
router.get('/categories', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT DISTINCT category FROM books WHERE category IS NOT NULL ORDER BY category`,
    );
    res.json(rows.map((r) => r.category));
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/books (librarian only)
router.post('/', requireRole('librarian'), async (req, res, next) => {
  try {
    const {
      title, author, isbn, category, description,
      published_year, total_copies = 1, cover_url,
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'title and author are required' });
    }

    const { rows } = await query(
      `INSERT INTO books (title, author, isbn, category, description, published_year, total_copies, available_copies, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)
       RETURNING *`,
      [title, author, isbn, category, description, published_year, total_copies, cover_url],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
