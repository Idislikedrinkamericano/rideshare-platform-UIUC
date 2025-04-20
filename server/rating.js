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
  const { ride_id, reviewer_id, driver_id, rating } = req.body;

  try {
    const checkQuery = `
      SELECT * FROM Ratings
      WHERE reviewer_id = $1 AND ride_id = $2
    `;
    const existing = await pool.query(checkQuery, [reviewer_id, ride_id]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You have already rated this ride.' });
    }

    const insertQuery = `
      INSERT INTO Ratings (ride_id, reviewer_id, driver_id, rating)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [ride_id, reviewer_id, driver_id, rating]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to create rating:', err);
    res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

// ***** GET *****
// Get all ratings or filter by driver_id
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

// ***** GET Stats *****
// Get average rating and total count for a driver
router.get('/stats/:driver_id', async (req, res) => {
  try {
    const { driver_id } = req.params;
    const result = await pool.query(
      `SELECT 
         COUNT(*) AS total_ratings,
         ROUND(AVG(rating)::numeric, 2) AS average_rating
       FROM Ratings
       WHERE driver_id = $1`,
      [driver_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching rating stats:', err);
    res.status(500).json({ error: 'Failed to fetch rating stats' });
  }
});

module.exports = router;

