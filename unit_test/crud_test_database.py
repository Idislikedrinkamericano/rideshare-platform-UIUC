# Python Modules for writing tests
import unittest
#PostgreSQL adapter for Python , for locally interacting with database
import psycopg2
# Pretty printer for cleaner output for database query
from pprint import pprint

# *********Before you run the Script, run "python pip install psycopg2" in your terminal************
# This is a simple CRUD unit test for testing our database, TABLE: rides table. To see if the structure of our
# most i,portant table satisfy basic operations like searching for a ride, create a ride, delete a ride and update a ride
# more unit test will come out and I will be testing the API of our project.

class TestRidesCRUD(unittest.TestCase):
    #*********Mandatory methods for Unit Tests using tt framwork*********
    #configure connections for all queries
    #dynamically adding attributes to self
    @classmethod
    def setUpClass(cls):
        #client set up
        cls.connection = psycopg2.connect(
            dbname = "weride", #when testing, replace with your PostgreSQL username
            user = "postgres", #when testing, replace with your PostgreSQL username
            password = "REDACTED_LOCAL_DB_PASSWORD", #when testing, replace with your PostgreSQL username
            host = "localhost" #when testing, replace with your PostgreSQL username
        )
        #use autocommit for saving changes automatically.
        cls.connection.autocommit = True
        #init cursor for interacting with the database
        cls.cursor = cls.connection.cursor()
    
    #
    @classmethod
    def tearDownClass(cls):
        # cleanup, closing connection
        cls.cursor.close()
        cls.connection.close()

    def setUp(self):
        # we are testing continuesly
        pass
    
    #*********Methods for Test Queries*********

    def test_create_ride(self):
        #insert a new ride using SQL
        insert_query = """
            INSERT INTO Rides (ride_time, number_of_passengers, starting_location, end_destination, driver_username, ride_description)
            VALUES (NOW(), 3, 'Start Location', 'End Destination', 'driver1', 'Test ride')
            RETURNING *;
        """
        #execute query
        self.cursor.execute(insert_query)
        #fectch the ride we inserted for display
        ride = self.cursor.fetchone()
        pprint({"Created Ride": ride})
        #test if we inserted correctly
        self.assertIsNotNone(ride[0], "The ride_id should not be None after insertion.")

        print("Create passed")

    def test_read_ride(self):
        #select query , we are selecting the previously inserted ride where driver_username = driver1
        select_query = """
            SELECT * FROM Rides WHERE driver_username = %s;
        """
        self.cursor.execute(select_query, ('driver1',))
        #display the ride we found
        ride = self.cursor.fetchone()
        pprint({"Read Ride": ride})
        self.assertIsNotNone(ride, "The record should be found in the database.")
        print("Read passed")

    def test_update_ride(self):

        # find the rideid of the ride we inserted for update
        find_query = """
            SELECT id FROM Rides 
            WHERE driver_username = %s 
        """
        self.cursor.execute(find_query, ('driver1',))
        ride = self.cursor.fetchone()
        self.assertIsNotNone(ride)
        ride_id = ride[0]
        #writing new descriptions into the ride
        new_description = "Updated , unit test"
        update_query = "UPDATE Rides SET ride_description = %s WHERE id = %s;"
        self.cursor.execute(update_query, (new_description, ride_id))

        # read back the updated unit test
        self.cursor.execute("SELECT * FROM Rides WHERE id = %s;", (ride_id,))
        updated = self.cursor.fetchone()
        pprint({"Updated Ride": updated})
        self.assertEqual(updated[6], new_description)

        print("Update passed")

    def test_delete_ride(self):

         # find the rideid of the ride we inserted for update
        find_query = """
            SELECT id FROM Rides 
            WHERE driver_username = %s 
        """
        self.cursor.execute(find_query, ('driver1',))
        ride = self.cursor.fetchone()
        self.assertIsNotNone(ride)
        ride_id = ride[0]

        delete_query = "DELETE FROM Rides WHERE id = %s;"
        self.cursor.execute(delete_query, (ride_id,))

        select_query = "SELECT * FROM Rides WHERE id = %s;"
        self.cursor.execute(select_query, (ride_id,))
        result = self.cursor.fetchone()
        self.assertIsNone(result, "The ride record should be deleted.")
        
        print("Delete passed")


    def test_create_invalid_ride(self):
        insert_query = """
            INSERT INTO Rides (ride_time, number_of_passengers, starting_location, end_destination, driver_username, ride_description)
            VALUES (NOW(), -2, 'A', 'B', 'driver_invalid', 'Invalid test ride')
            RETURNING *;
        """
        with self.assertRaises(psycopg2.Error):
            self.cursor.execute(insert_query)
        print("Number less than zero")

    def test_read_nonexistent_ride(self):
        select_query = """
            SELECT * FROM Rides WHERE driver_username = %s;
        """
        self.cursor.execute(select_query, ('non_existent_user_123',))
        ride = self.cursor.fetchone()
        self.assertIsNone(ride, "No record driver!")
        print("Nonexistent driver")

    def test_update_nonexistent_ride(self):
        fake_id = -999
        new_description = "This ride does not exist"
        update_query = "UPDATE Rides SET ride_description = %s WHERE id = %s;"
        self.cursor.execute(update_query, (new_description, fake_id))
        self.assertEqual(self.cursor.rowcount, 0, "No row should be updated for nonexistent ride.")
        print("Update nonexistent passed")
    
    def test_delete_nonexistent_ride(self):
        fake_id = -999
        delete_query = "DELETE FROM Rides WHERE id = %s;"
        self.cursor.execute(delete_query, (fake_id,))
        self.assertEqual(self.cursor.rowcount, 0, "No row should be deleted for nonexistent ride.")
        print("Delete nonexistent passed")


# ********* Additional Unit Tests for Requests and Ratings Table *********
# Testing basic operations: create and read (MVP level testing only, for better front-back end connection)
class TestRequests(unittest.TestCase):
    # Set up connection to database before all tests
    @classmethod
    def setUpClass(cls):
        cls.conn = psycopg2.connect(
            dbname="weride",
            user="postgres",
            password="REDACTED_LOCAL_DB_PASSWORD",
            host="localhost"
        )
        cls.conn.autocommit = True
        cls.cur = cls.conn.cursor()

    # Close connection after all tests
    @classmethod
    def tearDownClass(cls):
        cls.cur.close()
        cls.conn.close()

    def test_create_and_read_request(self):
        # Insert a request
        self.cur.execute(
            "INSERT INTO Requests (ride_id, passenger_id) VALUES (%s, %s) RETURNING *;",
            (1, 2)  # Make sure these IDs exist
        )
        request = self.cur.fetchone()
        pprint({"Created Request": request})
        self.assertIsNotNone(request)
        print("Request passed")


class TestRatings(unittest.TestCase):
    # Set up database connection
    @classmethod
    def setUpClass(cls):
        cls.conn = psycopg2.connect(
            dbname="weride",
            user="postgres",
            password="REDACTED_LOCAL_DB_PASSWORD",
            host="localhost"
        )
        cls.conn.autocommit = True
        cls.cur = cls.conn.cursor()

    # Close connection
    @classmethod
    def tearDownClass(cls):
        cls.cur.close()
        cls.conn.close()

    def test_create_and_read_rating(self):
        # Insert a rating
        self.cur.execute(
            "INSERT INTO Ratings (ride_id, reviewer_id, driver_id, rating) VALUES (%s, %s, %s, %s) RETURNING *;",
            (1, 2, 3, 5)  # Make sure these IDs exist
        )
        rating = self.cur.fetchone()
        pprint({"Created Rating": rating})
        self.assertIsNotNone(rating)
        print("Rating passed")


if __name__ == "__main__":
    unittest.main()