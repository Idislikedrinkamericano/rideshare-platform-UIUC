const express = require('express');
const { requireAuth } = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();
  router.use(requireAuth);

  router.post('/', async (req, res) => {
    const rideId = Number(req.body.ride_id);
    if (!Number.isInteger(rideId)) return res.status(400).json({ error: 'A valid ride is required.' });
    try {
      const ride = await pool.query('SELECT user_id, seats_available, ride_time FROM rides WHERE id=$1', [rideId]);
      if (!ride.rows[0]) return res.status(404).json({ error: 'Ride not found.' });
      if (ride.rows[0].user_id === req.user.id) return res.status(400).json({ error: 'You cannot request your own ride.' });
      if (ride.rows[0].seats_available < 1) return res.status(409).json({ error: 'This ride is full.' });
      if (new Date(ride.rows[0].ride_time) <= new Date()) return res.status(409).json({ error: 'This ride has already departed.' });
      const { rows } = await pool.query(
        `INSERT INTO requests (ride_id, passenger_id) VALUES ($1,$2)
         ON CONFLICT (ride_id, passenger_id) DO NOTHING RETURNING *`, [rideId, req.user.id]);
      if (!rows[0]) return res.status(409).json({ error: 'You already requested this ride.' });
      res.status(201).json(rows[0]);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Could not send request.' }); }
  });

  router.get('/mine', async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT q.*,r.starting_location,r.end_destination,r.ride_time,u.username AS driver_username
        FROM requests q JOIN rides r ON r.id=q.ride_id JOIN users u ON u.id=r.user_id
        WHERE q.passenger_id=$1 ORDER BY r.ride_time`, [req.user.id]);
      res.json(rows);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Could not load requests.' }); }
  });

  router.get('/incoming', async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT q.*,u.username AS passenger_username,r.starting_location,r.end_destination,r.ride_time
        FROM requests q JOIN rides r ON r.id=q.ride_id JOIN users u ON u.id=q.passenger_id
        WHERE r.user_id=$1 ORDER BY CASE q.status WHEN 'pending' THEN 0 ELSE 1 END, r.ride_time`, [req.user.id]);
      res.json(rows);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Could not load requests.' }); }
  });

  router.patch('/:id', async (req, res) => {
    const status = req.body.status;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const found = await client.query(`SELECT q.*, r.user_id AS driver_id, r.seats_available
        FROM requests q JOIN rides r ON r.id=q.ride_id WHERE q.id=$1 FOR UPDATE OF q, r`, [req.params.id]);
      const request = found.rows[0];
      if (!request || request.driver_id !== req.user.id) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Request not found.' }); }
      if (request.status !== 'pending') { await client.query('ROLLBACK'); return res.status(409).json({ error: 'This request has already been decided.' }); }
      if (status === 'approved') {
        const seat = await client.query('UPDATE rides SET seats_available=seats_available-1 WHERE id=$1 AND seats_available>0 RETURNING id', [request.ride_id]);
        if (!seat.rows[0]) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'No seats remain.' }); }
      }
      const updated = await client.query('UPDATE requests SET status=$1 WHERE id=$2 RETURNING *', [status, request.id]);
      await client.query('COMMIT');
      res.json(updated.rows[0]);
    } catch (e) { await client.query('ROLLBACK'); console.error(e); res.status(500).json({ error: 'Could not update request.' }); }
    finally { client.release(); }
  });
  return router;
};
