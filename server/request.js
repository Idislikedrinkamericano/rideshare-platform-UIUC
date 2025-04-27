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
// Create a new request to join a ride
// Expected input: { ride_id: int, passenger_id: int }
// Returns the created request row
router.post('/', async (req, res) => {
  const { ride_id, passenger_id } = req.body;

  try {
    const checkQuery = `
      SELECT * FROM Requests 
      WHERE ride_id = $1 AND passenger_id = $2
    `;
    const existing = await pool.query(checkQuery, [ride_id, passenger_id]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You have already requested this ride.' });
    }

    const insertQuery = `
      INSERT INTO Requests (ride_id, passenger_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [ride_id, passenger_id]);
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Failed to create request:', err);
    res.status(500).json({ error: 'Failed to create request.' });
  }
});

// ***** GET *****
// Get all requests or filter by passenger_id or ride_id
// Supports query params like /requests?ride_id=1&passenger_id=2
router.get('/', async (req, res) => {
  const { passenger_id, ride_id } = req.query;

  try {
    let query = 'SELECT * FROM Requests';
    const filters = [];
    const values = [];
    let index = 1;

    if (passenger_id) {
      filters.push(`passenger_id = $${index}`);
      values.push(passenger_id);
      index++;
    }

    if (ride_id) {
      filters.push(`ride_id = $${index}`);
      values.push(ride_id);
      index++;
    }

    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch requests:', err);
    res.status(500).json({ error: 'Error fetching requests.' });
  }
});

// ***** PUT *****
// Update the status of a request (approve/reject)
// Example: PUT /requests/5 with body { status: 'approved' }
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { rows } = await pool.query(
      'UPDATE Requests SET status = $1 WHERE request_id = $2 RETURNING *',
      [status, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Failed to update request:', err);
    res.status(500).json({ error: 'Error updating request.' });
  }
});

// ***** DELETE *****
// Delete a request by ID
// Example: DELETE /requests/3
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      'DELETE FROM Requests WHERE request_id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    res.json({ message: 'Request deleted successfully.' });
  } catch (err) {
    console.error('Failed to delete request:', err);
    res.status(500).json({ error: 'Error deleting request.' });
  }
});

module.exports = router;