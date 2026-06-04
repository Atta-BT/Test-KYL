-- Book Lending System - Database schema (PostgreSQL)

DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS members CASCADE;

CREATE TABLE books (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    author          VARCHAR(255) NOT NULL,
    isbn            VARCHAR(20) UNIQUE,
    category        VARCHAR(100),
    description     TEXT,
    published_year  INTEGER,
    total_copies    INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
    cover_url       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_available_le_total CHECK (available_copies <= total_copies)
);

CREATE TABLE members (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    phone       VARCHAR(30),
    joined_at   DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE loans (
    id          SERIAL PRIMARY KEY,
    book_id     INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    member_id   INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_date    DATE NOT NULL,
    returned_at TIMESTAMPTZ,
    status      VARCHAR(20) NOT NULL DEFAULT 'borrowed'
                CHECK (status IN ('borrowed', 'returned'))
);

CREATE INDEX idx_loans_book_id ON loans(book_id);
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_books_category ON books(category);
