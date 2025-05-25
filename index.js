const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const schoolRoutes = require('./routes/schools');
const db = require('./db');

const app = express();
app.use(bodyParser.json());

// Add a test endpoint for debugging
app.get('/test-db', async (req, res) => {
  try {
    // Test basic connection
    const connected = await db.testConnection();
    if (!connected) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    // Test query execution
    const result = await db.debugQuery('SELECT NOW() as time');
    
    res.json({
      status: 'success',
      dbTime: result.rows[0].time,
      message: 'Database connection and query execution successful'
    });
  } catch (err) {
    console.error('Test endpoint error:', err);
    res.status(500).json({ 
      error: 'Test failed', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Test database connection and initialize
async function startServer() {
  try {
    // Test database connection
    const connected = await db.testConnection();
    if (!connected) {
      console.log('Warning: Database connection issues detected');
    }
    
    // Initialize database tables
    console.log('Initializing database...');
    await db.initializeDatabase();
    
    // Setup routes
    app.use('/', schoolRoutes);

    // Start server
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
      console.log(`API endpoints:`);
      console.log(`- GET http://localhost:${process.env.PORT}/test-db`);
      console.log(`- POST http://localhost:${process.env.PORT}/addSchool`);
      console.log(`- GET http://localhost:${process.env.PORT}/listSchools`);
      console.log(`- GET http://localhost:${process.env.PORT}/listSchools?latitude=40.7128&longitude=-74.0060`);
      console.log(`- DELETE http://localhost:${process.env.PORT}/deleteSchool/:id`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

// Add graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    await db.pool.end();
    console.log('Database pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

startServer();
