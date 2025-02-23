const express = require('express');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // Save uploaded files to the "public/uploads" folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate a unique filename
  },
});

const upload = multer({ storage });

// Serve static files from the "public" folder
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./server/database.db');

// Create recipes table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      ingredients TEXT,
      instructions TEXT,
      image_url TEXT
    )
  `);
});

// Handle file uploads and add recipe
app.post('/api/recipes', upload.single('image'), (req, res) => {
  const { title, description, ingredients, instructions } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Get the uploaded file path

  db.run(
    'INSERT INTO recipes (title, description, ingredients, instructions, image_url) VALUES (?, ?, ?, ?, ?)',
    [title, description, ingredients, instructions, image_url],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});