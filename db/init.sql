-- Drop table if exists
DROP TABLE IF EXISTS schools;

-- Create schools table using INTEGER instead of SERIAL
CREATE TABLE schools (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add sample data (optional)
INSERT INTO schools (id, name, address, latitude, longitude)
VALUES 
  (1, 'Example School', '123 Main Street', 40.7128, -74.0060),
  (2, 'Test Academy', '456 Park Avenue', 40.7135, -74.0046);
