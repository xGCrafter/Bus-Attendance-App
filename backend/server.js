const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('bus_attendance.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS buses (
        busId TEXT PRIMARY KEY,
        password TEXT
    )`);

    db.get('SELECT COUNT(*) as count FROM buses', (err, row) => {
        if (row.count === 0) {
            const insert = 'INSERT INTO buses (busId, password) VALUES (?, ?)';
            db.run(insert, ['R-31', 'deens2025']);
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        busId TEXT,
        name TEXT,
        FOREIGN KEY(busId) REFERENCES buses(busId)
    )`);

    db.get('SELECT COUNT(*) as count FROM students WHERE busId = ?', ['R-31'], (err, row) => {
        if (row.count === 0) {
            const insert = 'INSERT INTO students (busId, name) VALUES (?, ?)';
            const students = [
                ['R-31', 'Student A'], ['R-31', 'Student B'], ['R-31', 'Student C'],
                ['R-31', 'Student D'], ['R-31', 'Student E'], ['R-31', 'Student F'],
                ['R-31', 'Student G'], ['R-31', 'Student H'], ['R-31', 'Student I'],
                ['R-31', 'Student J'], ['R-31', 'Student K']
            ];
            students.forEach(student => {
                db.run(insert, student);
            });
            // Temporary log to confirm seeding
            console.log('Seeded students:', students);
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        busId TEXT,
        date TEXT,
        studentId INTEGER,
        present INTEGER,
        FOREIGN KEY(busId) REFERENCES buses(busId),
        FOREIGN KEY(studentId) REFERENCES students(id)
    )`);
});

app.post('/api/login', (req, res) => {
    const { busId, password } = req.body;
    db.get('SELECT * FROM buses WHERE busId = ? AND password = ?', [busId, password], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Database error' });
        } else if (row) {
            res.json({ success: true, authToken: 'authenticated' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Bus ID or Password' });
        }
    });
});

app.post('/api/verify-auth', (req, res) => {
    const { busId, authToken } = req.body;
    if (!busId || !authToken) {
        return res.status(401).json({ isAuthenticated: false });
    }
    db.get('SELECT * FROM buses WHERE busId = ?', [busId], (err, row) => {
        if (err) {
            res.status(500).json({ isAuthenticated: false, message: 'Database error' });
        } else if (row && authToken === 'authenticated') {
            res.json({ isAuthenticated: true });
        } else {
            res.status(401).json({ isAuthenticated: false });
        }
    });
});

app.get('/api/students/:busId', (req, res) => {
    const { busId } = req.params;
    db.all('SELECT * FROM students WHERE busId = ?', [busId], (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Database error' });
        } else {
            // Temporary log to confirm API response
            console.log(`Fetched students for busId ${busId}:`, rows);
            res.json({ success: true, students: rows });
        }
    });
});

app.get('/api/attendance/:busId/:date', (req, res) => {
    const { busId, date } = req.params;
    db.all('SELECT * FROM attendance WHERE busId = ? AND date = ?', [busId, date], (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Database error' });
        } else {
            res.json({ success: true, attendance: rows });
        }
    });
});

app.post('/api/attendance', (req, res) => {
    const { busId, date, attendance } = req.body;
    const insert = 'INSERT INTO attendance (busId, date, studentId, present) VALUES (?, ?, ?, ?)';
    const update = 'UPDATE attendance SET present = ? WHERE busId = ? AND date = ? AND studentId = ?';
    attendance.forEach(record => {
        db.get('SELECT * FROM attendance WHERE busId = ? AND date = ? AND studentId = ?', [busId, date, record.studentId], (err, row) => {
            if (err) {
                return;
            }
            if (row) {
                db.run(update, [record.present ? 1 : 0, busId, date, record.studentId]);
            } else {
                db.run(insert, [busId, date, record.studentId, record.present ? 1 : 0]);
            }
        });
    });
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});