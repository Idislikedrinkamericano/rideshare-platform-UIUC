const express = require('express');

//////////////////////////////////////////////////////// RIDE TABLE API
// Basic API endpoints for CRUD operations to RIDE TABLE
module.exports = (pool) => {
    const router = express.Router();


    // ***** Post *****
    //  Post/Create/insert a new ride to the database, and send back status of this operation
    router.post('/create', async (req, res) => {
        try {
        const { ride_time, number_of_passengers, starting_location, end_destination, driver_username, ride_description } = req.body;
        //pool query to create a new ride, we use RETURNING * for confirming the status of our operation
        const result = await pool.query(
            `INSERT INTO Rides 
            (user_id, ride_time, number_of_passengers, starting_location, end_destination, driver_username, ride_description) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [user_id,ride_time, number_of_passengers, starting_location, end_destination, driver_username, ride_description]
        );
        res.status(201).json(result.rows[0]);
        } catch (error) { //error handling
        console.error('Error creating ride:', error);
        res.status(500).json({ error: 'Error creating ride' });
        }
    });
    
    // ***** GET All RIDEs *****
    // Get all rides in the database right now
    router.get('/all', async (req, res) => {
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
    // the result of search would be come rides that's within the time range and
    // have a passengerner number that's greater than the passengeres number provided by
    router.get('/search', async (req, res) => {
        try {
        //extracting request information from the client url
        const {
            id,
            start_time,
            end_time,    
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
        
        if (start_time) {
            const paramIdx = index;
            index += 1;
            conditions.push(`ride_time >= $${paramIdx}`);
            values.push(start_time);
        }
    
        if (end_time) {
            const paramIdx = index;
            index += 1;
            conditions.push(`ride_time <= $${paramIdx}`);
            values.push(end_time);
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
            conditions.push(`number_of_passengers > $${paramIdx}`);
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
    router.put('/:id', async (req, res) => {
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
    router.delete('/:id', async (req, res) => {
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

    return router;
}

  
