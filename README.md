# Test-KYL — Book Lending System

A simple book lending (library) web application built with the requested tech stack:

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Vue.js 3 + Vite + Vue Router + Axios |
| Backend   | Node.js + Express (REST API)        |
| Database  | PostgreSQL                          |
| Container | Docker + Docker Compose             |

## Features

- Browse the book catalog with search (title/author) and category filtering.
- See live availability (available / total copies) per book.
- Borrow a book on behalf of a member (atomic transaction; decrements stock).
- View loans with filters: currently borrowed, returned, and **overdue**.
- Return a borrowed book (restores stock).
- Manage members (list + add new).
- Database is pre-populated with **simulated data** (books, members, active/returned/overdue loans).

## Project structure

```
.
├── docker-compose.yml          # Orchestrates db + backend + frontend
├── backend/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── index.js            # App entrypoint
│   │   ├── db.js               # PostgreSQL connection pool
│   │   ├── migrate.js          # Apply schema + seed
│   │   └── routes/             # books, members, loans
│   └── db/
│       ├── schema.sql          # Tables: books, members, loans
│       └── seed.sql            # Simulated data
└── frontend/                   # Vue 3 + Vite SPA
    └── src/
        ├── views/              # Books, Loans, Members
        ├── components/         # BorrowModal
        ├── api/                # Axios API client
        └── router/
```

## Quick start (Docker — recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api
- PostgreSQL: localhost:5432 (db `booklending`, user/pass `postgres`)

The database schema and simulated data are applied automatically on first start
via Postgres init scripts.

## Local development (without Docker)

Requires a running PostgreSQL instance.

```bash
# 1. Database (example using docker for just postgres)
docker run --name booklending-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=booklending -p 5432:5432 -d postgres:16-alpine

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run migrate     # applies schema.sql + seed.sql
npm run dev         # http://localhost:3000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev         # http://localhost:5173 (proxies /api -> :3000)
```

## API reference

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/api/health`             | Health check                         |
| GET    | `/api/books`              | List books (`?search=&category=`)    |
| GET    | `/api/books/categories`   | Distinct categories                  |
| GET    | `/api/books/:id`          | Get one book                         |
| POST   | `/api/books`              | Create a book                        |
| GET    | `/api/members`            | List members                         |
| POST   | `/api/members`            | Create a member                      |
| GET    | `/api/loans`              | List loans (`?status=&overdue=true`) |
| POST   | `/api/loans`              | Borrow a book `{book_id, member_id}` |
| POST   | `/api/loans/:id/return`   | Return a borrowed book               |
