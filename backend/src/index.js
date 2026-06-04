import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import booksRouter from './routes/books.js';
import membersRouter from './routes/members.js';
import loansRouter from './routes/loans.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'book-lending-api' });
});

app.use('/api/books', booksRouter);
app.use('/api/members', membersRouter);
app.use('/api/loans', loansRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Book lending API listening on port ${PORT}`);
});

export default app;
