const express = require('express');
const { requireAuth } = require('../middleware/auth');
module.exports = (pool) => {
  const router = express.Router();
  router.use(requireAuth);
  router.post('/', async (req,res) => {
    try {
      const { rows } = await pool.query(
        `INSERT INTO requests (ride_id, passenger_id) VALUES ($1,$2)
         ON CONFLICT (ride_id, passenger_id) DO NOTHING RETURNING *`, [req.body.ride_id, req.user.id]);
      if (!rows[0]) return res.status(409).json({ error: 'You already requested this ride.' });
      res.status(201).json(rows[0]);
    } catch(e){ console.error(e); res.status(500).json({error:'Could not send request.'}); }
  });
  router.get('/mine', async (req,res) => {
    try { const {rows}=await pool.query(`SELECT q.*,r.starting_location,r.end_destination,r.ride_time FROM requests q JOIN rides r ON r.id=q.ride_id WHERE q.passenger_id=$1 ORDER BY q.created_at DESC`,[req.user.id]); res.json(rows); }
    catch(e){console.error(e);res.status(500).json({error:'Could not load requests.'});}
  });
  router.get('/incoming', async (req,res) => {
    try { const {rows}=await pool.query(`SELECT q.*,u.username AS passenger_username,r.starting_location,r.end_destination,r.ride_time FROM requests q JOIN rides r ON r.id=q.ride_id JOIN users u ON u.id=q.passenger_id WHERE r.user_id=$1 ORDER BY q.created_at DESC`,[req.user.id]); res.json(rows); }
    catch(e){console.error(e);res.status(500).json({error:'Could not load requests.'});}
  });
  router.patch('/:id', async (req,res) => {
    const status=req.body.status; if(!['approved','rejected'].includes(status)) return res.status(400).json({error:'Invalid status.'});
    const client=await pool.connect();
    try { await client.query('BEGIN'); const {rows}=await client.query(`UPDATE requests q SET status=$1 FROM rides r WHERE q.id=$2 AND q.ride_id=r.id AND r.user_id=$3 RETURNING q.*`,[status,req.params.id,req.user.id]); if(!rows[0]){await client.query('ROLLBACK');return res.status(404).json({error:'Request not found.'});} if(status==='approved'){const update=await client.query('UPDATE rides SET seats_available=seats_available-1 WHERE id=$1 AND seats_available>0 RETURNING id',[rows[0].ride_id]); if(!update.rows[0]){await client.query('ROLLBACK');return res.status(409).json({error:'No seats remain.'});}} await client.query('COMMIT'); res.json(rows[0]); }
    catch(e){await client.query('ROLLBACK');console.error(e);res.status(500).json({error:'Could not update request.'});} finally{client.release();}
  });
  return router;
};
