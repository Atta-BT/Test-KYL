-- Book Lending System - Simulated / seed data

INSERT INTO books (title, author, isbn, category, description, published_year, total_copies, available_copies, cover_url) VALUES
('Clean Code', 'Robert C. Martin', '9780132350884', 'Programming', 'A handbook of agile software craftsmanship.', 2008, 4, 4, 'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg'),
('The Pragmatic Programmer', 'Andrew Hunt, David Thomas', '9780201616224', 'Programming', 'Your journey to mastery in software development.', 1999, 3, 2, 'https://covers.openlibrary.org/b/isbn/9780201616224-M.jpg'),
('You Don''t Know JS', 'Kyle Simpson', '9781491924464', 'JavaScript', 'Deep dive into the core mechanisms of JavaScript.', 2015, 5, 5, 'https://covers.openlibrary.org/b/isbn/9781491924464-M.jpg'),
('Eloquent JavaScript', 'Marijn Haverbeke', '9781593279509', 'JavaScript', 'A modern introduction to programming with JavaScript.', 2018, 2, 1, 'https://covers.openlibrary.org/b/isbn/9781593279509-M.jpg'),
('Design Patterns', 'Erich Gamma et al.', '9780201633610', 'Software Engineering', 'Elements of reusable object-oriented software.', 1994, 3, 3, 'https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg'),
('Refactoring', 'Martin Fowler', '9780134757599', 'Software Engineering', 'Improving the design of existing code.', 2018, 2, 2, 'https://covers.openlibrary.org/b/isbn/9780134757599-M.jpg'),
('Introduction to Algorithms', 'Cormen, Leiserson, Rivest, Stein', '9780262033848', 'Computer Science', 'The classic comprehensive textbook on algorithms.', 2009, 4, 3, 'https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg'),
('The Mythical Man-Month', 'Frederick P. Brooks Jr.', '9780201835953', 'Software Engineering', 'Essays on software engineering and project management.', 1995, 2, 2, 'https://covers.openlibrary.org/b/isbn/9780201835953-M.jpg'),
('Database System Concepts', 'Silberschatz, Korth, Sudarshan', '9780078022159', 'Databases', 'A thorough introduction to database systems.', 2010, 3, 3, 'https://covers.openlibrary.org/b/isbn/9780078022159-M.jpg'),
('Designing Data-Intensive Applications', 'Martin Kleppmann', '9781449373320', 'Databases', 'The big ideas behind reliable, scalable, maintainable systems.', 2017, 5, 4, 'https://covers.openlibrary.org/b/isbn/9781449373320-M.jpg'),
('Sapiens', 'Yuval Noah Harari', '9780062316097', 'History', 'A brief history of humankind.', 2011, 3, 3, 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg'),
('The Lord of the Rings', 'J.R.R. Tolkien', '9780544003415', 'Fiction', 'An epic high-fantasy novel.', 1954, 4, 2, 'https://covers.openlibrary.org/b/isbn/9780544003415-M.jpg');

INSERT INTO members (name, email, phone, joined_at) VALUES
('Somchai Jaidee', 'somchai@example.com', '081-234-5678', '2024-01-15'),
('Suda Rakdee', 'suda@example.com', '082-345-6789', '2024-02-20'),
('Anan Wong', 'anan@example.com', '083-456-7890', '2024-03-05'),
('Malee Srisuk', 'malee@example.com', '084-567-8901', '2024-04-10'),
('John Carter', 'john@example.com', '085-678-9012', '2024-05-01');

-- Simulated loans. available_copies above already reflect these active borrows.
-- Active (borrowed) loans
INSERT INTO loans (book_id, member_id, borrowed_at, due_date, returned_at, status) VALUES
(2, 1, now() - interval '5 days',  (CURRENT_DATE + 9),  NULL, 'borrowed'),
(4, 2, now() - interval '20 days', (CURRENT_DATE - 6),  NULL, 'borrowed'), -- overdue
(7, 3, now() - interval '2 days',  (CURRENT_DATE + 12), NULL, 'borrowed'),
(10, 4, now() - interval '1 days', (CURRENT_DATE + 13), NULL, 'borrowed'),
(12, 5, now() - interval '8 days',  (CURRENT_DATE + 6),  NULL, 'borrowed'),
(12, 1, now() - interval '3 days',  (CURRENT_DATE + 11), NULL, 'borrowed');

-- Seed users for login. Password for all seed users is: password123
-- (bcrypt hash below). 'member' user is linked to member John Carter (id 5).
INSERT INTO users (name, email, password_hash, role, member_id) VALUES
('Library Admin', 'librarian@example.com', '$2b$10$S8TELDmsTT/0GWnIcUBijOIGHGBX5BzCXUGtlBahLLpw8Arl/BJJW', 'librarian', NULL),
('John Carter', 'john@example.com', '$2b$10$S8TELDmsTT/0GWnIcUBijOIGHGBX5BzCXUGtlBahLLpw8Arl/BJJW', 'member', 5);

-- Returned loans (history)
INSERT INTO loans (book_id, member_id, borrowed_at, due_date, returned_at, status) VALUES
(1, 2, now() - interval '40 days', (CURRENT_DATE - 26), now() - interval '28 days', 'returned'),
(3, 3, now() - interval '35 days', (CURRENT_DATE - 21), now() - interval '22 days', 'returned'),
(9, 5, now() - interval '30 days', (CURRENT_DATE - 16), now() - interval '18 days', 'returned');
