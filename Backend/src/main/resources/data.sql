MERGE INTO USERS (USER_ID, USER_NAME, EMAIL, PASSWORD, PHONE_NUMBER, ROLE) KEY(USER_ID) VALUES
(1,  'Alice',   'alice@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 9876543210, 'Student'),
(2,  'Bob',     'bob@gmail.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 9876543211, 'Student'),
(3,  'Charlie', 'charlie@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 9876543212, 'Student'),
(4,  'David',   'david@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 9876543213, 'Student'),
(5,  'Eve',     'eve@gmail.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 9876543214, 'Student'),
(6,  'Frank',   'frank@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 9876543215, 'Librarian'),
(7,  'Grace',   'grace@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 9876543216, 'Student'),
(8,  'Hank',    'hank@gmail.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 9876543217, 'Student'),
(9,  'Ivy',     'ivy@gmail.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 9876543218, 'Student'),
(10, 'Jack',    'jack@gmail.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 9876543219, 'Student'),
(11, 'Priya',   'priya@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 0, 'Student'),
(12, 'Dhanu',   'dhamu@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 0, 'Student'),
(13, 'Surya',   'surya@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 0, 'Librarian'),
(14, 'Pravin',  'pravin@gmail.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh/a', 0, 'Student');

MERGE INTO BOOK (BOOK_ID, AUTHOR, AVAILABLE_COPIES, BOOK_NAME, IS_BORROWED, CATEGORY, IS_RETURNED, TOTAL_COPIES) KEY(BOOK_ID) VALUES
(300, 'Isaac Asimov',      5, 'I, Robot',              FALSE, 'Sci-Fi',     TRUE,  5),
(301, 'Andy Weir',         3, 'The Martian',            FALSE, 'Sci-Fi',     FALSE, 4),
(302, 'James Patterson',   2, 'Invisible',              FALSE, 'Thriller',   FALSE, 2),
(303, 'Victor Hugo',       4, 'Les Miserables',         FALSE, 'Classic',    FALSE, 4),
(304, 'Stephen King',      1, 'The Shining',            TRUE,  'Horror',     FALSE, 3),
(305, 'Yuval Noah Harari', 2, 'Homo Deus',              FALSE, 'History',    FALSE, 2),
(306, 'JK Rowling',        5, 'Fantastic Beasts',       FALSE, 'Fantasy',    FALSE, 6),
(307, 'Arthur Clarke',     3, '2001 A Space Odyssey',   FALSE, 'Sci-Fi',     FALSE, 3),
(308, 'Dan Ariely',        4, 'Predictably Irrational', FALSE, 'Psychology', FALSE, 4),
(309, 'Malcolm Gladwell',  2, 'Outliers',               FALSE, 'Self-help',  FALSE, 3);

MERGE INTO BORROW_RECORD (BORROW_ID, BORROW_DATE, FINE, OVER_DUE_DAYS, PAY, RETURN_DATE, BOOK_ID, USER_ID) KEY(BORROW_ID) VALUES
(800, '2025-11-17', 0.0,  0, TRUE,  '2025-11-17', 300, 1),
(801, '2025-11-17', 20.0, 2, FALSE, NULL,          301, 2),
(802, '2025-11-17', 0.0,  0, TRUE,  '2025-11-18', 302, 3),
(803, '2025-11-17', 50.0, 5, FALSE, NULL,          303, 4),
(804, '2025-11-17', 0.0,  0, TRUE,  '2025-11-17', 304, 5),
(805, '2025-11-17', 30.0, 3, TRUE,  '2025-11-18', 305, 6),
(806, '2025-11-17', 40.0, 4, FALSE, NULL,          306, 7),
(807, '2025-11-17', 0.0,  0, TRUE,  '2025-11-17', 307, 8),
(808, '2025-11-17', 70.0, 7, FALSE, NULL,          308, 9),
(809, '2025-11-17', 0.0,  0, TRUE,  '2025-11-18', 309, 10);