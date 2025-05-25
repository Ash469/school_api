# School API

A RESTful API for managing school information, built with Express and PostgreSQL.

![School API Banner](https://via.placeholder.com/800x200?text=School+API)

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the API](#running-the-api)
- [API Endpoints](#api-endpoints)
- [Technical Approach](#technical-approach)
- [Error Handling](#error-handling)

## ✨ Features

- Create, read, and delete schools
- Sort schools by distance from a given location
- Automatically manage incremental IDs with gap filling
- Database connection health check endpoint

## 🛠️ Technology Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **Joi** - Request validation
- **dotenv** - Environment variable management

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/school-api.git
   cd school-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the root directory with the following variables:

```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=schools_db
DB_PORT=5432
PORT=3000
```

## 🗄️ Database Setup

The API provides scripts to set up the database:

1. Create database tables:
   ```bash
   npm run setup-db
   ```

2. Create tables with sample data:
   ```bash
   npm run setup-db:with-samples
   ```

3. Test database connection:
   ```bash
   npm run test-db
   ```

## 🏃‍♂️ Running the API

Start the development server:
```bash
npm run dev
```

For production:
```bash
npm start
```

View available commands:
```bash
npm run help
```

## 📡 API Endpoints

| Method | Endpoint | Description | Request Body / Query Params |
|--------|----------|-------------|----------------------------|
| GET    | `/test-db` | Test database connection | N/A |
| POST   | `/addSchool` | Add one or multiple schools | Single object: `{ "name": "School Name", "address": "123 Education St", "latitude": 40.7128, "longitude": -74.0060 }` or Array: `[{school1}, {school2}, ...]` |
| GET    | `/listSchools` | List all schools | N/A |
| GET    | `/listSchools?latitude=40.7128&longitude=-74.0060` | List schools sorted by distance | `latitude`, `longitude` as query parameters |
| DELETE | `/deleteSchool/:id` | Delete a school | `id` as URL parameter |

### Example Requests

#### Add a new school

```bash
curl -X POST http://localhost:3000/addSchool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lincoln High School",
    "address": "123 Education Ave",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

#### Add multiple schools

```bash
curl -X POST http://localhost:3000/addSchool \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "Lincoln High School",
      "address": "123 Education Ave",
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    {
      "name": "Washington Academy",
      "address": "456 Learning Lane",
      "latitude": 40.7129,
      "longitude": -74.0062
    }
  ]'
```

#### List all schools

```bash
curl http://localhost:3000/listSchools
```

#### List schools by distance

```bash
curl "http://localhost:3000/listSchools?latitude=40.7128&longitude=-74.0060"
```

#### Delete a school

```bash
curl -X DELETE http://localhost:3000/deleteSchool/2
```

## 💡 Technical Approach

### Database Design

The application uses a PostgreSQL database with a simple schema:

- `schools` table with fields:
  - `id` (INTEGER): Primary key with manually managed increment
  - `name` (VARCHAR): School name
  - `address` (TEXT): Physical address
  - `latitude` (DECIMAL): Geographic coordinate
  - `longitude` (DECIMAL): Geographic coordinate
  - `created_at` (TIMESTAMP): Creation timestamp

### ID Management

Unlike traditional auto-incrementing IDs, this API uses a custom approach that:
- Finds and fills gaps in ID sequence
- If no gaps exist, uses the next available ID
- This approach optimizes ID reuse after deletions

### Distance Calculation

The Haversine formula is implemented in `utils/distance.js` to calculate the great-circle distance between two points on Earth, accounting for the planet's curvature.

### Express Structure

The application follows MVC-like patterns:
- `routes/`: Define API endpoints
- `controllers/`: Handle request processing and business logic
- `db.js`: Database interaction layer
- `utils/`: Utility functions
- `scripts/`: Database setup and maintenance

## 🛡️ Error Handling

The API implements comprehensive error handling:
- Request validation with Joi
- Database transaction support with commit/rollback
- Graceful server shutdown
- Detailed error responses with appropriate HTTP status codes


