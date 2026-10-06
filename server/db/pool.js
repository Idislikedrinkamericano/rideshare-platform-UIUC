const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('DATABASE_URL is not set. API database routes will be unavailable until configured.');
}

const pool = new Pool(connectionString ? { connectionString } : {});
module.exports = pool;
