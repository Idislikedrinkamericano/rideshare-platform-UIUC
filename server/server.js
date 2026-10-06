require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required. Copy server/.env.example to server/.env and configure it.');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. Copy server/.env.example to server/.env and configure it.');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', async (_req,res)=>{try{await pool.query('SELECT 1');res.json({status:'ok'});}catch{res.status(503).json({status:'database unavailable'});}});
app.use('/api/users', require('./routes/users')(pool));
app.use('/api/rides', require('./routes/rides')(pool));
app.use('/api/requests', require('./routes/requests')(pool));
app.use('/api/trips', require('./routes/trips')(pool));
app.use('/api/ratings', require('./routes/ratings')(pool));
app.use('/api', (_req,res)=>res.status(404).json({error:'API route not found.'}));
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:'Unexpected server error.'});});
const port=process.env.PORT||4000;
app.listen(port,()=>console.log(`WeShare API running on http://localhost:${port}`));
