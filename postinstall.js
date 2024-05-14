const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '/backend/db.db');

// Open the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create the conversations table
db.run(`CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transcript TEXT
)`, (err) => {
    if (err) {
        console.error('Error creating conversations table:', err.message);
    } else {
        console.log('Conversations table created successfully.');
    }
});

// Create the messages table
db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT CHECK(role IN ('chatgpt', 'user')),
    body TEXT,
    conversation_id INTEGER,
    timestamp DATETIME,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
)`, (err) => {
    if (err) {
        console.error('Error creating messages table:', err.message);
    } else {
        console.log('Messages table created successfully.');
    }
});

// Close the database
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});