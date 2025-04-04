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

// **** GET A RIDE ****
// This is a flexible search endpoint
// It allows the client to search for rides based on various parameters
app.get('/rides', async (req, res) => {
  try {
    //extracting request information from the client url
    const {
      id,
      ride_time,
      starting_location,
      end_destination,
      driver_username,
      number_of_passengers
    } = req.query;

    //now dynamically build server query based on parameters provided in the request
    const conditions = [];
    const values = [];
    // a local integer to the endpoint
    let index = 1;

    //check if the client provided any of the parameters
    // if yes, add them to the conditions, values array
    // at the end we will use these arrays to parse final SQL query
    if (id) {
      const paramIdx = index;
      index += 1;
      conditions.push(`id = $${paramIdx}`);
      values.push(id);
    }
    
    if (ride_time) {
      const paramIdx = index;
      index += 1;
      conditions.push(`ride_time = $${paramIdx}`);
      values.push(ride_time);
    }
    
    if (starting_location) {
      const paramIdx = index;
      index += 1;
      conditions.push(`starting_location ILIKE $${paramIdx}`);
      values.push(`%${starting_location}%`);
    }
    
    if (end_destination) {
      const paramIdx = index;
      index += 1;
      conditions.push(`end_destination ILIKE $${paramIdx}`);
      values.push(`%${end_destination}%`);
    }
    
    if (driver_username) {
      const paramIdx = index;
      index += 1;
      conditions.push(`driver_username ILIKE $${paramIdx}`);
      values.push(`%${driver_username}%`);
    }
    
    if (number_of_passengers) {
      const paramIdx = index;
      index += 1;
      conditions.push(`number_of_passengers = $${paramIdx}`);
      values.push(number_of_passengers);
    }
    
    // Now values look like this
    // [v1, v2, v3,etc]
    // and conditions look like this
    // [condition1, condition2, condition3,etc]
    // This is how the SQL query will look like, conceptual wise,
    // SELECT * FROM Rides WHERE condition1 = values[0] AND condition2 = values[1] AND condition3 = values[2]

    // base query, if there are conditions, 
    let query = 'SELECT * FROM Rides';
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND '); //conditions.join will concatenate all elements in conditions array with AND
    }

    // execute the query with the values
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No rides found matching the criteria' });
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ error: 'Error fetching rides' });
  }
});


// *********** UPDATE (PUT) an Existing Ride **************
// Now this is a flexible update endpoint
// it allows the client to update rides based on any param they want
app.put('/rides/:id', async (req, res) => {
  try {
    //extracting request information from the client url
    const {
      id,
      ride_time,
      starting_location,
      end_destination,
      driver_username,
      number_of_passengers
    } = req.query;

    //now dynamically build server query based on parameters provided in the request
    const conditions = [];
    const values = [];
    // a local integer to the endpoint
    let index = 1;

    //check if the client provided any of the parameters
    // if yes, add them to the conditions, values array
    // at the end we will use these arrays to parse final SQL query
    if (id) {
      const paramIdx = index;
      index += 1;
      conditions.push(`id = $${paramIdx}`);
      values.push(id);
    }
    
    if (ride_time) {
      const paramIdx = index;
      index += 1;
      conditions.push(`ride_time = $${paramIdx}`);
      values.push(ride_time);
    }
    
    if (starting_location) {
      const paramIdx = index;
      index += 1;
      conditions.push(`starting_location ILIKE $${paramIdx}`);
      values.push(`%${starting_location}%`);
    }
    
    if (end_destination) {
      const paramIdx = index;
      index += 1;
      conditions.push(`end_destination ILIKE $${paramIdx}`);
      values.push(`%${end_destination}%`);
    }
    
    if (driver_username) {
      const paramIdx = index;
      index += 1;
      conditions.push(`driver_username ILIKE $${paramIdx}`);
      values.push(`%${driver_username}%`);
    }
    
    if (number_of_passengers) {
      const paramIdx = index;
      index += 1;
      conditions.push(`number_of_passengers = $${paramIdx}`);
      values.push(number_of_passengers);
    }

    // Now values look like this
    // [v1, v2, v3,etc]
    // and conditions look like this
    // [condition1, condition2, condition3,etc]
    // This is how the SQL query will look like, conceptual wise,
    // UPDATE Rides SET conditions[0] = $1, conditions[1] = $2 WHERE conditions[2] = $3  RETURNING *;

    // Add the id at the end for WHERE clause
    values.push(id);
    const query = `UPDATE Rides SET ${conditions.join(', ')}  WHERE id = $${index}  RETURNING *;`;
    
    // execute the query with the values
    const result = await pool.query(query, values);

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
