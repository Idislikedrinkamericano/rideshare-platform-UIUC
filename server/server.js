const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

//***** THIS IS A INITIAL STAGE IMPLEMENTATION MORE WILL BE ADDED*****

// If you want to test the server. open terminal and enter following commands
//1. `cd server`
//2. `npm install`
//3. Set up `.env` with your DB credentials (optional)
//4. Run `node server.js`

//setting up express.js client
const app = express();
//local port 3000
const port = 3000; 

// we use body-parser for parsing json requests, this essentially put client requests into a accessable form instead of purely JSON
app.use(bodyParser.json());

// What this server is essentially doing
// listening to all JSON requests sent from clients
// parse the JSON requests and interact with database according to these requests


//postgres SQL congiguration
// use connection pool so that we don't reconnect to server everytime
// this is suggested by chatGPTo3
const pool = new Pool({
  user: 'postgres',       //when testing, replace with your PostgreSQL username
  host: 'localhost',
  database: 'weride',   //when testing, replace with your PostgreSQL database name
  password: 'REDACTED_LOCAL_DB_PASSWORD',   //when testing, replace with your PostgreSQL password
  port: 5432,                  //when testing, default PostgreSQL port
});



//////////////////////////////////////////////////////// RIDE TABLE API
// Basic API endpoints for CRUD operations to RIDE TABLE

// ***** Post *****
//  Post/Create/insert a new ride to the database, and send back status of this operation
app.post('/rides', async (req, res) => {
  try {
    const { ride_time, number_of_passengers, starting_location, end_destination, driver_username, ride_description } = req.body;
    //pool query to create a new ride, we use RETURNING * for confirming the status of our operation
    const result = await pool.query(
      `INSERT INTO Rides 
       (ride_time, number_of_passengers, starting_location, end_destination, driver_username, ride_description) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [ride_time, number_of_passengers, starting_location, end_destination, driver_username, ride_description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { //error handling
    console.error('Error creating ride:', error);
    res.status(500).json({ error: 'Error creating ride' });
  }
});

// ***** GET All RIDEs *****
// Get all rides in the database right now
app.get('/rides', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Rides');
    res.json(result.rows);
  } catch (error) {
    console.error('Error occured when getting rides:', error);
    res.status(500).json({ error: 'Error occured when getting rides' });
  }
});

// **** GET A SINGLE RIDE ID****
// This is a super simplified version for this endpoints
// Ultimate goal is a flexible search API endpoint that can find the ride no matter how much criteria clients sent
app.get('/rides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM Rides WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching ride:', error);
    res.status(500).json({ error: 'Error fetching ride' });
  }
});

// *********** UPDATE (PUT) an Existing Ride **************
// Updating a single ride with new parameters
// THis is a Fulll Update so far , the next goal is a partial update using patch
// which allows each client to partially modify their rides
app.put('/rides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ride_time, number_of_passengers, starting_location, end_destination, driver_username, ride_description } = req.body;
    const result = await pool.query(
      `UPDATE Rides 
       SET ride_time = $1, number_of_passengers = $2, starting_location = $3, end_destination = $4, driver_username = $5, ride_description = $6 
       WHERE id = $7 RETURNING *`,
      [ride_time, number_of_passengers, starting_location, end_destination, driver_username, ride_description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ride:', error);
    res.status(500).json({ error: 'Error updating ride' });
  }
});

// ******* DELETE a Ride *********
//delete a ride by ID
app.delete('/rides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM Rides WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    res.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error('Error deleting ride:', error);
    res.status(500).json({ error: 'Error deleting ride' });
  }
});


//////////////////Starting the server
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
