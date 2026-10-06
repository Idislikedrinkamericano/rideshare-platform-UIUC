const express = require('express');
const { requireAuth } = require('../middleware/auth');
module.exports = (pool) => {
  const router = express.Router();
  router.post('/', requireAuth, async (req, res) => {
    const rideId = Number(req.body.ride_id);
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rideId) || !Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Ride and a 1–5 rating are required.' });
    try {
      const eligible = await pool.query(`SELECT r.user_id AS driver_id, r.ride_time
        FROM rides r JOIN requests q ON q.ride_id=r.id
        WHERE r.id=$1 AND q.passenger_id=$2 AND q.status='approved'`, [rideId, req.user.id]);
      const ride = eligible.rows[0];
      if (!ride) return res.status(403).json({ error: 'Only approved passengers can rate this ride.' });
      if (ride.driver_id === req.user.id) return res.status(400).json({ error: 'You cannot rate yourself.' });
      if (new Date(ride.ride_time) > new Date()) return res.status(409).json({ error: 'You can rate a driver after the ride.' });
      const { rows } = await pool.query(`INSERT INTO ratings(ride_id,reviewer_id,driver_id,rating) VALUES($1,$2,$3,$4)
        ON CONFLICT(ride_id,reviewer_id) DO UPDATE SET rating=EXCLUDED.rating RETURNING *`, [rideId, req.user.id, ride.driver_id, rating]);
      res.status(201).json(rows[0]);
    } catch (e) { console.error(e); res.status(500).json({ error: 'Could not save rating.' }); }
  });
  return router;
};
