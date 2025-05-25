const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 3000;

console.log(`
========================================
    School API - Usage Guide
========================================

Available endpoints:

1. Add a new school
   POST http://localhost:${port}/addSchool
   
   Request body example:
   {
     "name": "Lincoln High School",
     "address": "123 Education Ave",
     "latitude": 40.7128,
     "longitude": -74.0060
   }

2. List all schools
   GET http://localhost:${port}/listSchools
   
   This will return all schools ordered by ID.

3. List schools by distance
   GET http://localhost:${port}/listSchools?latitude=40.7128&longitude=-74.0060
   
   Query parameters:
   - latitude: Your current latitude
   - longitude: Your current longitude
   
   This will return all schools sorted by distance from the provided coordinates.

4. Delete a school
   DELETE http://localhost:${port}/deleteSchool/2
   
   Replace "2" with the actual school ID you want to delete.

5. Test database connection
   GET http://localhost:${port}/test-db

========================================

Database Management:

- Setup database structure:
  npm run setup-db

- Setup database with sample data:
  npm run setup-db:with-samples

- Test database connection:
  npm run test-db

========================================
`);

console.log('For more information, check the documentation or contact support.');
