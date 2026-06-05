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
      clauses.push(`(b.title ILIKE $${params.length} OR b.author ILIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      clauses.push(`c.name = $${params.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT b.*, c.name AS category_name,
        COUNT(DISTINCT bc.copy_id) FILTER (WHERE bc.status = 'AVAILABLE') AS available_copies,
        COUNT(DISTINCT bc.copy_id) AS total_copies
       FROM books b
       LEFT JOIN categories c ON c.category_id = b.category_id
       LEFT JOIN book_copies bc ON bc.book_id = b.book_id
       ${where}
       GROUP BY b.book_id, c.name
       ORDER BY b.title ASC`,
      params,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/books/categories
router.get('/categories', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT category_id, name FROM categories ORDER BY name`,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT b.*, c.name AS category_name,
        COUNT(DISTINCT bc.copy_id) FILTER (WHERE bc.status = 'AVAILABLE') AS available_copies,
        COUNT(DISTINCT bc.copy_id) AS total_copies
       FROM books b
       LEFT JOIN categories c ON c.category_id = b.category_id
       LEFT JOIN book_copies bc ON bc.book_id = b.book_id
       WHERE b.book_id = $1
       GROUP BY b.book_id, c.name`,
      [req.params.id],
    );
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/books (ADMIN only)
router.post('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { title, author, isbn, category_id, description } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'title and author are required' });
    }

    const { rows } = await query(
      `INSERT INTO books (title, author, isbn, category_id, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, author, isbn, category_id || null, description],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
