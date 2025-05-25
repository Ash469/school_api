require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

async function setupDatabase() {
  let poolConfig;
  
  if (process.env.DB_CONNECTION_STRING) {
    poolConfig = {
      connectionString: process.env.DB_CONNECTION_STRING
    };
    console.log('Using connection string for Railway database');
  } else {
    poolConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'local',
      port: process.env.DB_PORT || 5432
    };
    console.log('Using individual connection parameters');
  }

  const pool = new Pool(poolConfig);

  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL on Railway');
    
    // Drop existing table if it exists
    await client.query('DROP TABLE IF EXISTS schools');
    
    // Create schools table - using INTEGER instead of SERIAL
    await client.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        latitude DECIMAL(10, 6) NOT NULL,
        longitude DECIMAL(10, 6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Schools table created successfully');
    
    // Check if sample data should be added
    const addSampleData = process.argv.includes('--with-samples');
    
    if (addSampleData) {
      const result = await client.query(`
        INSERT INTO schools (id, name, address, latitude, longitude)
        VALUES 
          (1, 'Example School', '123 Main Street', 40.7128, -74.0060),
          (2, 'Test Academy', '456 Park Avenue', 40.7135, -74.0046)
      `);
      
      console.log(`Added ${result.rowCount} sample schools`);
    }
    
    client.release();
    await pool.end();
    console.log('Database setup completed successfully');
  } catch (err) {
    console.error('Database setup failed:', err);
    process.exit(1);
  }
}

setupDatabase();
