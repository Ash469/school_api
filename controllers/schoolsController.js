const db = require('../db');
const getDistance = require('../utils/distance');
const Joi = require('joi');

const schoolSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required()
});

exports.addSchool = async (req, res) => {
  try {
    // Check if the request body is an array
    const isArray = Array.isArray(req.body);
    const schoolData = isArray ? req.body : [req.body];
    
    // Validate all school entries
    const validationErrors = [];
    const validSchools = [];
    
    for (const school of schoolData) {
      const { error, value } = schoolSchema.validate(school);
      if (error) {
        validationErrors.push({
          data: school,
          error: error.details[0].message
        });
      } else {
        validSchools.push(value);
      }
    }

    // If there are validation errors
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed for one or more schools', 
        details: validationErrors 
      });
    }

    // If no valid schools to add
    if (validSchools.length === 0) {
      return res.status(400).json({ error: 'No valid school data provided' });
    }

    try {
      const client = await db.pool.connect();
      const results = [];
      
      try {
        await client.query('BEGIN');
        
        for (const { name, address, latitude, longitude } of validSchools) {
          // Find the lowest available ID
          const idResult = await client.query(`
            SELECT i.id + 1 AS next_id
            FROM schools i
            LEFT JOIN schools i2 ON i.id + 1 = i2.id
            WHERE i2.id IS NULL
            ORDER BY next_id
            LIMIT 1;
          `);
          
          let nextId = 1; // Default if table is empty
          
          if (idResult.rows.length > 0) {
            nextId = idResult.rows[0].next_id;
          } else {
            // If the query returns no rows, check if the table is empty
            const countResult = await client.query('SELECT COUNT(*) FROM schools');
            if (parseInt(countResult.rows[0].count) > 0) {
              // Find the max ID and add 1
              const maxResult = await client.query('SELECT MAX(id) + 1 AS next_id FROM schools');
              nextId = maxResult.rows[0].next_id || 1;
            }
          }
          
          // Insert with the found ID
          const insertQuery = 'INSERT INTO schools (id, name, address, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING id';
          const result = await client.query(insertQuery, [nextId, name, address, latitude, longitude]);
          
          results.push({
            id: result.rows[0].id,
            name,
            address,
            latitude,
            longitude
          });
        }
        
        await client.query('COMMIT');
        
        // Return appropriate response based on whether input was array or single object
        if (isArray) {
          res.status(201).json({ 
            message: `${results.length} schools added successfully`, 
            schools: results 
          });
        } else {
          res.status(201).json({ 
            message: 'School added successfully', 
            id: results[0].id,
            school: results[0]
          });
        }
        
      } catch (dbError) {
        await client.query('ROLLBACK');
        throw dbError;
      } finally {
        client.release();
      }
    } catch (err) {
      res.status(500).json({ 
        error: 'Database insertion failed',
        details: err.message
      });
    }
  } catch (outerError) {
    console.error('Unexpected error in addSchool controller:', outerError);
    res.status(500).json({ error: 'Server error processing request' });
  }
};

exports.listSchools = async (req, res) => {
  try {
    const userLat = parseFloat(req.query.latitude);
    const userLon = parseFloat(req.query.longitude);

    // Check if latitude and longitude are provided
    if (req.query.latitude && req.query.longitude) {
      // If parameters are provided but invalid
      if (isNaN(userLat) || isNaN(userLon)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
      }

      // Get schools sorted by distance
      const result = await db.query('SELECT * FROM schools');
      const rows = result.rows;

      const sorted = rows.map((school) => ({
        ...school,
        distance: getDistance(userLat, userLon, school.latitude, school.longitude)
      })).sort((a, b) => a.distance - b.distance);

      return res.status(200).json(sorted);
    } else {
      // No coordinates provided - return list sorted by ID
      const result = await db.query('SELECT * FROM schools ORDER BY id ASC');
      
      return res.status(200).json({
        message: 'Schools retrieved successfully',
        count: result.rows.length,
        schools: result.rows
      });
    }
  } catch (err) {
    console.error('Error fetching schools:', err);
    res.status(500).json({ error: 'Database query failed', details: err.message });
  }
};

exports.deleteSchool = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: 'Invalid school ID',
        message: 'The ID must be a numeric value'
      });
    }
    
    // Verify the school exists first
    const checkResult = await db.query('SELECT id FROM schools WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }
    
    // Delete the school
    await db.query('DELETE FROM schools WHERE id = $1', [id]);
    
    res.status(200).json({
      success: true,
      message: `School with ID ${id} deleted successfully`
    });
  } catch (err) {
    console.error('Error deleting school:', err);
    res.status(500).json({ 
      error: 'Failed to delete school',
      details: err.message
    });
  }
};
