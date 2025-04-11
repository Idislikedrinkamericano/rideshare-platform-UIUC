const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const router = express.Router();
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'weride',
  password: 'REDACTED_LOCAL_DB_PASSWORD',
  port: 5432
});
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) return res.status(400).json({ error: 'Missing fields' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query("INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id", [username, email, hashedPassword]);
    res.status(201).json({ user_id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  try {
    const result = await pool.query("SELECT id, password_hash FROM Users WHERE username = $1", [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid username or password' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });
    res.status(200).json({ user_id: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});
router.put('/users/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { username, email } = req.body;
  if (!username && !email) return res.status(400).json({ error: 'No updates provided' });
  try {
    const updates = [];
    const values = [];
    let index = 1;
    if (username) {
      updates.push(`username = $${index++}`);
      values.push(username);
    }
    if (email) {
      updates.push(`email = $${index++}`);
      values.push(email);
    }
    const query = `UPDATE Users SET ${updates.join(', ')} WHERE id = $${index} RETURNING id, username, email`;
    values.push(user_id);
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error during update' });
  }
});
module.exports = router;
