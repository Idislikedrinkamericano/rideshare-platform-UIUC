const express = require('express');
const { requireAuth } = require('../middleware/auth');

module.exports = (pool) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const { from, to, date, seats } = req.query;
    const conditions = ['r.ride_time >= NOW()'];
    const values = [];
    const add = (sql, value) => { values.push(value); conditions.push(sql.replace('?', `$${values.length}`)); };
    if (from) add('r.starting_location ILIKE ?', `%${from}%`);
    if (to) add('r.end_destination ILIKE ?', `%${to}%`);
    if (date) add('r.ride_time::date = ?::date', date);
    if (seats) add('r.seats_available >= ?::int', seats);
    try {
      const { rows } = await pool.query(
        `SELECT r.*, u.username AS driver_username,
                COALESCE(ROUND(AVG(rt.rating)::numeric, 1), 0) AS driver_rating
           FROM rides r
           JOIN users u ON u.id = r.user_id
           LEFT JOIN ratings rt ON rt.driver_id = r.user_id
          WHERE ${conditions.join(' AND ')}
          GROUP BY r.id, u.username
          ORDER BY r.ride_time ASC LIMIT 50`, values);
      res.json(rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Could not load rides.' }); }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT r.*, u.username AS driver_username,
                COALESCE(ROUND(AVG(rt.rating)::numeric, 1), 0) AS driver_rating
           FROM rides r JOIN users u ON u.id=r.user_id
           LEFT JOIN ratings rt ON rt.driver_id=r.user_id
          WHERE r.id=$1 GROUP BY r.id,u.username`, [req.params.id]);
      if (!rows[0]) return res.status(404).json({ error: 'Ride not found.' });
      res.json(rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Could not load ride.' }); }
  });

  router.post('/', requireAuth, async (req, res) => {
    const { ride_time, seats_available, starting_location, end_destination, ride_description } = req.body;
    const seats = Number(seats_available);
    if (!ride_time || !starting_location?.trim() || !end_destination?.trim() || !Number.isInteger(seats) || seats < 1 || seats > 8) {
      return res.status(400).json({ error: 'Time, locations, and 1–8 available seats are required.' });
    }
    if (Number.isNaN(Date.parse(ride_time)) || new Date(ride_time) <= new Date()) return res.status(400).json({ error: 'Departure must be a valid future time.' });
    try {
      const { rows } = await pool.query(
        `INSERT INTO rides (user_id, ride_time, seats_available, starting_location, end_destination, ride_description)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [req.user.id, ride_time, seats, starting_location.trim(), end_destination.trim(), (ride_description || '').trim()]);
      res.status(201).json(rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Could not create ride.' }); }
  });

  router.delete('/:id', requireAuth, async (req, res) => {
    try {
      const { rows } = await pool.query('DELETE FROM rides WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.user.id]);
      if (!rows[0]) return res.status(404).json({ error: 'Ride not found or not owned by you.' });
      res.status(204).end();
    } catch (err) { console.error(err); res.status(500).json({ error: 'Could not delete ride.' }); }
  });

  return router;
};
