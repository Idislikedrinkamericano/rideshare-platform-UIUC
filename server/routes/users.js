// routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');

module.exports = (pool) => {
  const router = express.Router();
  const SALT_ROUNDS = 10;

  // Signup endpoint
  // POST /users/signup
  router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    try {
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      const result = await pool.query(
        `INSERT INTO Users (username, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, created_at`,
        [username, email, password_hash]
      );
      const user = result.rows[0];
      res.status(201).json({ user });
    } catch (err) {
      // Unique constraint violation
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Username or email already exists.' });
      }
      console.error('Signup error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  // Login endpoint
  // POST /users/login
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
      const result = await pool.query(
        `SELECT id, username, email, password_hash
         FROM Users
         WHERE username = $1`,
        [username]
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }
      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  return router;
};

