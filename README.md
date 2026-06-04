# Test-KYL — Book Lending System

A simple book lending (library) web application built with the requested tech stack:

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Vue.js 3 + Vite + Vue Router + Axios |
| Backend   | Node.js + Express (REST API)        |
| Database  | PostgreSQL                          |
| Container | Docker + Docker Compose             |

## Features

- **Authentication & role-based access control (RBAC)** with 3 roles: Guest, Member, Librarian.
- Browse the book catalog with search (title/author) and category filtering (open to guests).
- See live availability (available / total copies) per book.
- Borrow a book (atomic transaction; decrements stock). Members borrow for themselves; librarians borrow on behalf of a member.
- View loans with filters: currently borrowed, returned, and **overdue**. Members see only their own loans; librarians see all.
- Return a borrowed book (restores stock). Members may only return their own loans.
- Manage members (list + add) — **librarian only**.
- Database is pre-populated with **simulated data** (books, members, users, active/returned/overdue loans).

### Roles & permissions

| Capability                         | Guest | Member | Librarian |
|------------------------------------|:-----:|:------:|:---------:|
| Browse / search books              |  ✓    |   ✓    |    ✓      |
| Borrow / return (own loans)        |       |   ✓    |    ✓      |
| View own loans                     |       |   ✓    |    ✓      |
| View all loans                     |       |        |    ✓      |
| Add books                          |       |        |    ✓      |
| Manage members                     |       |        |    ✓      |

### Demo accounts (password: `password123`)

| Role      | Email                    |
|-----------|--------------------------|
| Librarian | `librarian@example.com`  |
| Member    | `john@example.com`       |

New self-service registration creates a **Member** account.

## Project structure

```
.
├── docker-compose.yml          # Orchestrates db + backend + frontend
├── backend/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── index.js            # App entrypoint
│   │   ├── db.js               # PostgreSQL connection pool
│   │   ├── auth.js             # JWT sign/verify + RBAC middleware
│   │   ├── migrate.js          # Apply schema + seed
│   │   └── routes/             # auth, books, members, loans
│   └── db/
│       ├── schema.sql          # Tables: books, members, users, loans
│       └── seed.sql            # Simulated data (incl. demo users)
└── frontend/                   # Vue 3 + Vite SPA
    └── src/
        ├── views/              # Books, Loans, Members, Login, Register
        ├── components/         # BorrowModal
        ├── store/              # auth (token + user, reactive)
        ├── api/                # Axios API client (token interceptor)
        └── router/             # routes + auth guards
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

Auth is via JWT: send `Authorization: Bearer <token>` (obtained from login/register).

| Method | Endpoint                  | Access     | Description                          |
|--------|---------------------------|------------|--------------------------------------|
| GET    | `/api/health`             | public     | Health check                         |
| POST   | `/api/auth/register`      | public     | Register a member, returns `{token, user}` |
| POST   | `/api/auth/login`         | public     | Login, returns `{token, user}`       |
| GET    | `/api/auth/me`            | auth       | Current user                         |
| GET    | `/api/books`              | public     | List books (`?search=&category=`)    |
| GET    | `/api/books/categories`   | public     | Distinct categories                  |
| GET    | `/api/books/:id`          | public     | Get one book                         |
| POST   | `/api/books`              | librarian  | Create a book                        |
| GET    | `/api/members`            | librarian  | List members                         |
| POST   | `/api/members`            | librarian  | Create a member                      |
| GET    | `/api/loans`              | auth       | List loans (members see only their own) |
| POST   | `/api/loans`              | member/librarian | Borrow `{book_id}` (member) or `{book_id, member_id}` (librarian) |
| POST   | `/api/loans/:id/return`   | member/librarian | Return a borrowed book (members: own only) |
