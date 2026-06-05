-- ========================================================
-- Book Lending System - Seed data (PostgreSQL) - FIXED VERSION
-- ========================================================

-- ล้างข้อมูลเก่าออกก่อน (ตามลำดับความสัมพันธ์ของ Foreign Key)
TRUNCATE TABLE reservations, borrowings, users, book_copies, books, categories RESTART IDENTITY CASCADE;

-- 1. Categories
INSERT INTO categories (name) VALUES
('Programming'),
('JavaScript'),
('Software Engineering'),
('Databases'),
('History'),
('Fiction');

-- 2. Books
INSERT INTO books (isbn, title, author, category_id, description) VALUES
('9780132350884', 'Clean Code', 'Robert C. Martin', 1, 'A handbook of agile software craftsmanship.'),
('9780201616224', 'The Pragmatic Programmer', 'Andrew Hunt, David Thomas', 1, 'Your journey to mastery in software development.'),
('9781491924464', 'You Don''t Know JS', 'Kyle Simpson', 2, 'Deep dive into the core mechanisms of JavaScript.'),
('9781593279509', 'Eloquent JavaScript', 'Marijn Haverbeke', 2, 'A modern introduction to programming with JavaScript.'),
('9780201633610', 'Design Patterns', 'Erich Gamma et al.', 3, 'Elements of reusable object-oriented software.'),
('9780134757599', 'Refactoring', 'Martin Fowler', 3, 'Improving the design of existing code.'),
('9780201835953', 'The Mythical Man-Month', 'Frederick P. Brooks Jr.', 3, 'Essays on software engineering and project management.'),
('9780262033848', 'Introduction to Algorithms', 'Cormen, Leiserson, Rivest, Stein', 1, 'The classic comprehensive textbook on algorithms.'),
('9780078022159', 'Database System Concepts', 'Silberschatz, Korth, Sudarshan', 4, 'A thorough introduction to database systems.'),
('9781449373320', 'Designing Data-Intensive Applications', 'Martin Kleppmann', 4, 'The big ideas behind reliable, scalable, maintainable systems.'),
('9780062316097', 'Sapiens', 'Yuval Noah Harari', 5, 'A brief history of humankind.'),
('9780544003415', 'The Lord of the Rings', 'J.R.R. Tolkien', 6, 'An epic high-fantasy novel.');

-- 3. Book Copies (สร้างทั้งหมด 40 เล่ม -> id จะรันตั้งแต่ 1 ถึง 40)
INSERT INTO book_copies (book_id, status, condition) VALUES
(1, 'AVAILABLE', 'GOOD'), (1, 'AVAILABLE', 'GOOD'), (1, 'AVAILABLE', 'FAIR'), (1, 'AVAILABLE', 'NEW'), -- id: 1-4
(2, 'AVAILABLE', 'GOOD'), (2, 'BORROWED', 'GOOD'), (2, 'AVAILABLE', 'FAIR'), -- id: 5-7
(3, 'AVAILABLE', 'NEW'), (3, 'AVAILABLE', 'GOOD'), (3, 'AVAILABLE', 'GOOD'), (3, 'AVAILABLE', 'GOOD'), (3, 'AVAILABLE', 'FAIR'), -- id: 8-12
(4, 'BORROWED', 'GOOD'), (4, 'AVAILABLE', 'POOR'), -- id: 13-14
(5, 'AVAILABLE', 'GOOD'), (5, 'AVAILABLE', 'GOOD'), (5, 'AVAILABLE', 'FAIR'), -- id: 15-17
(6, 'AVAILABLE', 'NEW'), (6, 'AVAILABLE', 'GOOD'), -- id: 18-19
(7, 'AVAILABLE', 'GOOD'), (7, 'BORROWED', 'FAIR'), (7, 'AVAILABLE', 'GOOD'), (7, 'AVAILABLE', 'GOOD'), -- id: 20-23
(8, 'AVAILABLE', 'GOOD'), (8, 'AVAILABLE', 'GOOD'), -- id: 24-25
(9, 'AVAILABLE', 'GOOD'), (9, 'AVAILABLE', 'NEW'), (9, 'AVAILABLE', 'FAIR'), -- id: 26-28
(10, 'AVAILABLE', 'GOOD'), (10, 'BORROWED', 'GOOD'), (10, 'AVAILABLE', 'NEW'), (10, 'AVAILABLE', 'FAIR'), (10, 'AVAILABLE', 'GOOD'), -- id: 29-33
(11, 'AVAILABLE', 'GOOD'), (11, 'AVAILABLE', 'GOOD'), (11, 'AVAILABLE', 'NEW'), -- id: 34-36
(12, 'BORROWED', 'GOOD'), (12, 'BORROWED', 'FAIR'), (12, 'AVAILABLE', 'GOOD'), (12, 'AVAILABLE', 'NEW'); -- id: 37-40

-- 4. Users (password for all seed users is: password123)
-- bcrypt hash: $2b$10$S8TELDmsTT/0GWnIcUBijOIGHGBX5BzCXUGtlBahLLpw8Arl/BJJW
INSERT INTO users (username, password_hash, email, role, status) VALUES
('admin', '$2b$10$S8TELDmsTT/0GWnIcUBijOIGHGBX5BzCXUGtlBahLLpw8Arl/BJJW', 'admin@example.com', 'ADMIN', 'ACTIVE'),
('somchai', '$2b$10$S8TELDmsTT/0GWnIcUBijOIGHGBX5BzCXUGtlBahLLpw8Arl/BJJW', 'somchai@example.com', 'MEMBER', 'ACTIVE'),
('suda', '$2b$10$S8TELDmsTT/0GWnIcUBijOIGHGBX5BzCXUGtlBahLLpw8Arl/BJJW', 'suda@example.com', 'MEMBER', 'ACTIVE'),
('anan', '$2b$10$S8TELDmsTT/0GWnIcUBijOIGHGBX5BzCXUGtlBahLLpw8Arl/BJJW', 'anan@example.com', 'MEMBER', 'ACTIVE'),
('malee', '$2b$10$S8TELDmsTT/0GWnIcUBijOIGHGBX5BzCXUGtlBahLLpw8Arl/BJJW', 'malee@example.com', 'MEMBER', 'ACTIVE'),
('john', '$2b$10$S8TELDmsTT/0GWnIcUBijOIGHGBX5BzCXUGtlBahLLpw8Arl/BJJW', 'john@example.com', 'MEMBER', 'ACTIVE');

-- 5. Borrowings (active and history) - FIXED: ปรับค่า copy_id ไม่ให้เกิน 40
-- Active borrowings (PENDING / APPROVED)
INSERT INTO borrowings (user_id, copy_id, borrow_date, due_date, return_date, status, approved_by) VALUES
(2, 6,  now() - interval '5 days',  now() + interval '9 days',  NULL, 'APPROVED', 1),
(3, 14, now() - interval '20 days', now() - interval '6 days',  NULL, 'APPROVED', 1), -- overdue
(4, 30, now() - interval '2 days',  now() + interval '12 days', NULL, 'APPROVED', 1),
(5, 13, now() - interval '1 days',  now() + interval '13 days', NULL, 'PENDING', NULL),  -- แก้เป็น 13 (เล่มที่สถานะ BORROWED)
(6, 21, now() - interval '8 days',  now() + interval '6 days',  NULL, 'APPROVED', 1),   -- แก้เป็น 21 (เล่มที่สถานะ BORROWED)
(2, 37, now() - interval '3 days',  now() + interval '11 days', NULL, 'APPROVED', 1);   -- แก้เป็น 37 (เล่มที่สถานะ BORROWED)

-- Returned borrowings
INSERT INTO borrowings (user_id, copy_id, borrow_date, due_date, return_date, status, approved_by) VALUES
(3, 1,  now() - interval '40 days', now() - interval '26 days', now() - interval '28 days', 'RETURNED', 1),
(4, 19, now() - interval '35 days', now() - interval '21 days', now() - interval '22 days', 'RETURNED', 1),
(6, 38, now() - interval '30 days', now() - interval '16 days', now() - interval '18 days', 'RETURNED', 1); -- แก้เป็น 38 (เล่มที่เคยยืมแต่คืนแล้ว)

-- 6. Reservations
INSERT INTO reservations (user_id, book_id, reserve_date, status) VALUES
(2, 5, now() - interval '2 days', 'WAITING'),
(3, 10, now() - interval '1 days', 'WAITING'),
(4, 12, now() - interval '3 days', 'READY_TO_PICKUP');