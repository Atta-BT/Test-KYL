-- Book Lending System - Database schema (PostgreSQL)
-- Designed schema: users, categories, books, book_copies, borrowings, reservations

DROP TABLE IF EXISTS borrowings CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS book_copies CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. ตารางผู้ใช้และสิทธิ์ (Users & Roles)
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    role          VARCHAR(20) NOT NULL DEFAULT 'MEMBER'
                    CHECK (role IN ('MEMBER', 'ADMIN')),
    status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED'))
);

-- 2. ตารางหมวดหมู่ (Categories) - สำหรับ FK ของ books
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

-- 3. ข้อมูลหนังสือ (Book Metadata)
CREATE TABLE books (
    book_id     SERIAL PRIMARY KEY,
    isbn        VARCHAR(20) UNIQUE,
    title       VARCHAR(255) NOT NULL,
    author      VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
    description TEXT
);

-- 4. สำเนาหนังสือ/รายการ (Book Copies / Items)
CREATE TABLE book_copies (
    copy_id   SERIAL PRIMARY KEY,
    book_id   INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    status    VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
                CHECK (status IN ('AVAILABLE', 'BORROWED', 'LOST', 'MAINTENANCE')),
    condition VARCHAR(20) DEFAULT 'GOOD'
                CHECK (condition IN ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'))
);

-- 5. การทำรายการยืม-คืน (Borrowing Transactions)
CREATE TABLE borrowings (
    transaction_id SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    copy_id        INTEGER NOT NULL REFERENCES book_copies(copy_id) ON DELETE CASCADE,
    borrow_date    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date       TIMESTAMP NOT NULL,
    return_date    TIMESTAMP,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING', 'APPROVED', 'RETURNED', 'OVERDUE')),
    approved_by    INTEGER REFERENCES users(user_id) ON DELETE SET NULL
);

-- 6. การจองหนังสือ (Reservations)
CREATE TABLE reservations (
    reservation_id SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    book_id        INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    reserve_date   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status         VARCHAR(20) NOT NULL DEFAULT 'WAITING'
                       CHECK (status IN ('WAITING', 'READY_TO_PICKUP', 'COMPLETED', 'CANCELLED'))
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_book_copies_book_id ON book_copies(book_id);
CREATE INDEX idx_book_copies_status ON book_copies(status);
CREATE INDEX idx_borrowings_user_id ON borrowings(user_id);
CREATE INDEX idx_borrowings_copy_id ON borrowings(copy_id);
CREATE INDEX idx_borrowings_status ON borrowings(status);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_reservations_status ON reservations(status);
