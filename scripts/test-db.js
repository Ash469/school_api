require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

async function testDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'local',
    port: process.env.DB_PORT || 5432
  });

  try {
    console.log('Connecting to database...');
    
    const client = await pool.connect();
    console.log('Connected successfully');
    
    // Test basic query
    const timeRes = await client.query('SELECT NOW() as time');
    console.log('Database time:', timeRes.rows[0].time);
    
    // Check if schools table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schools'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('Schools table exists');
      
      // Check table structure
      const columnsCheck = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'schools'
      `);
      
      console.log('Table structure:');
      columnsCheck.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('Schools table does not exist');
    }
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Database test failed:', err);
  }
}

testDatabase();
