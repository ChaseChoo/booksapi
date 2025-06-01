const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

app.use(express.json());

// Connect or create DB
const db = new sqlite3.Database('./books.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to the books database.');
});

// Create books table and insert data if not exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT,
            isbn TEXT
        )
    `);

    const insertStmt = db.prepare(`INSERT INTO books (title, author, isbn) VALUES (?, ?, ?)`);
    const books = [
        ['To Kill a Mockingbird', 'Harper Lee', '9780061120084'],
        ['1984', 'George Orwell', '9780451524935'],
        ['Pride and Prejudice', 'Jane Austen', '9781503290563'],
        ['The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565'],
        ['The Catcher in the Rye', 'J.D. Salinger', '9780316769488'],
        ['Moby-Dick', 'Herman Melville', '9781503280786'],
        ['Jane Eyre', 'Charlotte Brontë', '9780141441146'],
        ['Wuthering Heights', 'Emily Brontë', '9780141439556'],
        ['The Hobbit', 'J.R.R. Tolkien', '9780547928227'],
        ['Fahrenheit 451', 'Ray Bradbury', '9781451673319'],
        ['Brave New World', 'Aldous Huxley', '9780060850524'],
        ['The Book Thief', 'Markus Zusak', '9780375842207'],
        ['The Alchemist', 'Paulo Coelho', '9780061122415'],
        ['Crime and Punishment', 'Fyodor Dostoevsky', '9780486415871'],
        ['The Picture of Dorian Gray', 'Oscar Wilde', '9780141439570'],
        ['The Road', 'Cormac McCarthy', '9780307387899'],
        ['The Handmaid’s Tale', 'Margaret Atwood', '9780385490818'],
        ['A Tale of Two Cities', 'Charles Dickens', '9781503219700'],
        ['Little Women', 'Louisa May Alcott', '9780147514011'],
        ['Life of Pi', 'Yann Martel', '9780156027328'],
        ['The Kite Runner', 'Khaled Hosseini', '9781594631931'],
        ['The Hunger Games', 'Suzanne Collins', '9780439023528'],
        ['Harry Potter and the Sorcerer’s Stone', 'J.K. Rowling', '9780590353427'],
        ['The Giver', 'Lois Lowry', '9780544336261'],
        ['A Man Called Ove', 'Fredrik Backman', '9781476738024'],
        ['The Girl on the Train', 'Paula Hawkins', '9781594634024'],
        ['The Da Vinci Code', 'Dan Brown', '9780307474278'],
        ['The Fault in Our Stars', 'John Green', '9780525478812'],
        ['The Outsiders', 'S.E. Hinton', '9780142407332'],
        ['Slaughterhouse-Five', 'Kurt Vonnegut', '9780385333849'],
    ];
    books.forEach(book => {
        insertStmt.run(book);
    });
    insertStmt.finalize();
});

// Route: get all books
app.get('/books', (req, res) => {
    db.all('SELECT * FROM books', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Route: search books by partial title match
app.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing 'q' query parameter" });

    db.all(`SELECT * FROM books WHERE title LIKE ?`, [`%${query}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
