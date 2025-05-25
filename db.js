const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as now');
    console.log('✅ PostgreSQL Connected');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL Connection Error:', err.message);
    return false;
  }
};

// Initialize database with tables
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    try {
      // Create schools table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS schools (
          id INTEGER PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address TEXT NOT NULL,
          latitude NUMERIC(10,6) NOT NULL,
          longitude NUMERIC(10,6) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Database initialized successfully');
      return true;
    } catch (err) {
      console.error('Error initializing database:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Failed to initialize database:', err);
    return false;
  }
};

// Execute a direct query function for debugging
const debugQuery = async (query, params) => {
  const client = await pool.connect();
  try {
    return await client.query(query, params);
  } catch (err) {
    console.error('Debug query error:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  testConnection,
  initializeDatabase,
  debugQuery,
  pool
};
