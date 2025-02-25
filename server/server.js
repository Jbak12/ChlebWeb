require('dotenv').config(); // Load environment variables
const express = require('express');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');

const app = express();
const port = 3000;

// Environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Dupa'; // Fallback value
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Dupa'; // Fallback value

// Middleware to parse JSON request bodies
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: 'DupaDUpaDupa', // Change this to a secure random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

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
      instructions TEXT
    )
  `);
});

// Handle file uploads and add recipe
app.post('/api/recipes', upload.single('image'), (req, res) => {
  const { title, description, ingredients, instructions } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Get the uploaded file path

  db.run(
    'INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?, ?)',
    [title, description, ingredients, instructions],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID });
      }
    }
  );
});

app.post('/api/login', (req, res) => {
  console.log('Request Body:', req.body); 
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    console.log("Success"); // Log the request body

    req.session.isLoggedIn = true; // Set session flag
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Logout failed' });
    } else {
      res.status(200).json({ success: true });
    }
  });
});

// Middleware to check if the user is logged in
function ensureLoggedIn(req, res, next) {
  if (req.session.isLoggedIn) {
    next(); // User is logged in, proceed to the next middleware/route
  } else {
    res.status(403).sendFile(path.join(__dirname, '../public/page403.html')); // Serve a custom 403 page
  }
}

// Serve the admin page (protected route)
app.get('/admin', ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, '../private/admin.html'));
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});