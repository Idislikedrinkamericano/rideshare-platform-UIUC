const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // ***** GET/All saved trips for a user *****
    router.get('/alltrips', async (req, res) => {
        try {
            const userId = req.user.id;

            const result = await pool.query(
                `SELECT r.*
                   FROM MyTrips mt
                   JOIN Rides r
                     ON mt.ride_id = r.id
                  WHERE mt.user_id = $1
               ORDER BY mt.added_at DESC`,
                [userId]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching saved trips:', error);
            res.status(500).json({ error: 'Could not fetch your saved trips at the moment.' });
        }
    });

    // ***** POST/Add a ride to "MyTrips" as passenger *****
    router.post('/add/passenger', async (req, res) => {
        try {
            const userId = req.user.id;
            const { ride_id } = req.body;

            const result = await pool.query(
                `INSERT INTO MyTrips (user_id, ride_id)
                 VALUES ($1, $2)
                 RETURNING *`,
                [userId, ride_id]
            );

            await pool.query(
                `UPDATE Rides
                 SET passenger_joined_count = passenger_joined_count + 1
                 WHERE id = $1`,
                [ride_id]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error adding to MyTrips:', error);
            res.status(500).json({ error: 'Could not save your trip at the moment.' });
        }
    });

    // ***** POST/Add a ride to "MyTrips" as driver *****
    router.post('/add/driver', async (req, res) => {
        try {
            const userId = req.user.id;
            const { ride_id } = req.body;

            const result = await pool.query(
                `INSERT INTO MyTrips (user_id, ride_id)
                 VALUES ($1, $2)
                 RETURNING *`,
                [userId, ride_id]
            );

            await pool.query(
                `UPDATE Rides
                 SET driver_joined_count = driver_joined_count + 1
                 WHERE id = $1`,
                [ride_id]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error adding to MyTrips:', error);
            res.status(500).json({ error: 'Could not save your drive at the moment.' });
        }
    });

    // ***** DELETE/Remove a ride from "MyTrips" *****
    router.delete('/delete', async (req, res) => {
        try {
            const userId = req.user.id;
            const { ride_id } = req.body;

            const result = await pool.query(
                `DELETE FROM MyTrips
                 WHERE user_id = $1
                   AND ride_id = $2
                 RETURNING *`,
                [userId, ride_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Entry not found in MyTrips' });
            }

            res.json({ message: 'Removed from MyTrips' });
        } catch (error) {
            console.error('Error removing from MyTrips:', error);
            res.status(500).json({ error: 'Could not remove your trip at the moment.' });
        }
    });

    return router;
};
