const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// set up connection to PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'weride',
  password: 'REDACTED_LOCAL_DB_PASSWORD',
  port: 5432,
});

// ***** POST *****
// Create a new rating for a driver
// Expected input: { ride_id, reviewer_id, driver_id, rating }
// Returns the created rating row
router.post('/', async (req, res) => {
  try {
    const { ride_id, reviewer_id, driver_id, rating } = req.body;
    const result = await pool.query(
      'INSERT INTO Ratings (ride_id, reviewer_id, driver_id, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [ride_id, reviewer_id, driver_id, rating]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating rating:', err);
    res.status(500).json({ error: 'Failed to create rating' });
  }
});

// ***** GET *****
// Get all ratings or filter by driver_id
// Supports query param: /ratings?driver_id=3
router.get('/', async (req, res) => {
  try {
    const { driver_id } = req.query;
    let query = 'SELECT * FROM Ratings';
    const values = [];
    if (driver_id) {
      query += ' WHERE driver_id = $1';
      values.push(driver_id);
    }
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// ***** GET Average *****
// Get the average rating for a driver
// Example: /ratings/average/3
router.get('/average/:driver_id', async (req, res) => {
  try {
    const { driver_id } = req.params;
    const result = await pool.query(
      'SELECT AVG(rating)::numeric(10,2) AS average_rating FROM Ratings WHERE driver_id = $1',
      [driver_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error calculating average rating:', err);
    res.status(500).json({ error: 'Failed to calculate average rating' });
  }
});

module.exports = router;
