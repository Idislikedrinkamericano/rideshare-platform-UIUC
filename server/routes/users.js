const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { secret } = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();

  router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const cleanUsername = typeof username === 'string' ? username.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (cleanUsername.length < 2 || cleanUsername.length > 100 || !emailOk || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Username, email, and an 8+ character password are required.' });
    }
    try {
      const passwordHash = await bcrypt.hash(password, 12);
      const { rows } = await pool.query(
        `INSERT INTO users (username, email, password_hash)
         VALUES ($1, $2, $3) RETURNING id, username, email`,
        [cleanUsername, cleanEmail, passwordHash]
      );
      res.status(201).json({ user: rows[0] });
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Username or email already exists.' });
      console.error(err);
      res.status(500).json({ error: 'Could not create account.' });
    }
  });

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }
      const token = jwt.sign(
        { id: user.id, username: user.username },
        secret(),
        { expiresIn: '7d' }
      );
      res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not sign in.' });
    }
  });

  return router;
};
