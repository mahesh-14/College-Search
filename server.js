const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database('college_list.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the colleges database.');
    }
});

const userDb = new sqlite3.Database('users.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the users database.');
        // Create the users table if it doesn't exist
        userDb.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT
            )
        `);
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'search.html')); 
});

app.get('/college-list', (req, res) => {
    const searchTerm = req.query.name;
    const query = `
    SELECT CollegeName, StateName, DistrictName
    FROM "college-list"
    WHERE CollegeName LIKE ?`;
    const searchValue = `%${searchTerm}%`;

    db.all(query, [searchValue], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json(rows);
        }
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).send('Username and password are required');
        return;
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Insert user into database
        userDb.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.send('<p style="color: green;">User registered successfully.</p>');
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Retrieve user from database
    userDb.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (!row) {
            res.send('<p style="color: red;">Login failed. Username or password is incorrect.</p>');
            return;
        }

        // Compare passwords
        bcrypt.compare(password, row.password, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (result) {
                // Successful login, redirect to another page
                res.redirect('/search'); // Change '/search' to the desired route
            } else {
                res.send('<p style="color: red;">Login failed. Username or password is incorrect.</p>');
            }
        });
    });
});

app.get('/', (req, res) => {
    res.send('Server is running. Use /college-list?name=<search-term> to search for colleges by name.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
