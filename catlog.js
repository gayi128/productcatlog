
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'product_catalog'
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// API 1: Add a product
app.post('/products', (req, res) => {
  const { name, category, price } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const sql = 'INSERT INTO products (name, category, price) VALUES (?, ?, ?)';
  db.query(sql, [name, category, price], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ message: 'Product added', id: result.insertId });
  });
});

// API 2: List of products
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// API 3: Get a product by ID
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
});

// API 4: List all categories
app.get('/categories', (req, res) => {
  db.query('SELECT DISTINCT category FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const categories = results.map(row => row.category);
    res.json(categories);
  });
});

// API 5: Group products by category
app.get('/gproducts/grouped', (req, res) => {
    //Here i have grouped the categories by using the code ,we can also do by using mysql query 
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const grouped = {};
    results.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    res.json(grouped);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


