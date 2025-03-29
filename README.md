# Query Simulation Engine

A lightweight backend service that simulates natural language query processing for data analytics. This service interprets English language queries and translates them into structured query operations, returning relevant data from the system.

## API Service

The API is deployed with the base URL:
[https://query-simulation-engine.onrender.com](https://query-simulation-engine.onrender.com)

The specific API endpoints are:
- `https://query-simulation-engine.onrender.com/api/query`
- `https://query-simulation-engine.onrender.com/api/explain`
- `https://query-simulation-engine.onrender.com/api/validate`

**Note:** This is an API-only service with no frontend interface. It can only be accessed through API requests (POST) using tools like Postman or curl, not directly through a browser.

### Deployment Notes
- The first request after a period of inactivity may take 10-30 seconds to respond as the server needs to restart. Subsequent requests will be processed at normal speed.

## Postman Collection

To test the API, you can use the provided Postman collection:

1. Download the collection: [Query-Simulation-Engine.postman_collection.json](./Query-Simulation-Engine.postman_collection.json)
2. Open **Postman** and go to "Collections"
3. Click on **Import** and select the downloaded file
4. The collection includes ready-to-use requests for all endpoints:
   - Process Query
   - Explain Query
   - Validate Query
5. All requests are pre-configured with the correct API key header

## Authentication

All API endpoints are protected by API key authentication. You need to include the API key in your requests:

**Header:**
```
x-api-key: 5ygy9bi3rgjgcgr
```

Requests without a valid API key will receive a 401 Unauthorized or 403 Forbidden response.

## Features

- Natural language query processing
- Support for various query types (select, filter, aggregation)
- Query explanation functionality
- Query validation endpoint
- API key authentication
- Mock database with sample users, products, and orders

## API Documentation

The API provides three main endpoints for interacting with the natural language query system:

### 1. Process Query (`POST /api/query`)

Processes a natural language query and returns matching data from the mock database.

**Request Body:**
```json
{
  "query": "your natural language query here"
}
```

**Required Headers:**
```
x-api-key: 5ygy9bi3rgjgcgr
```

**Response:**
```json
{
  "success": true,
  "query": {
    "original": "your natural language query here",
    "translated": "SELECT * FROM users"
  },
  "result": [
    // Array of matching records from the database
  ]
}
```

### 2. Explain Query (`POST /api/explain`)

Analyzes a natural language query and provides an explanation of how it would be processed without executing it.

**Request Body:**
```json
{
  "query": "your natural language query here"
}
```

**Required Headers:**
```
x-api-key: 5ygy9bi3rgjgcgr
```

**Response:**
```json
{
  "success": true,
  "query": {
    "original": "your natural language query here",
    "translated": "SELECT * FROM users"
  },
  "explanation": "This query will retrieve all records from the users table.",
  "keywordTrigger": "The SELECT operation was identified by the keyword 'show' in your query.",
  "tableAccessed": "users",
  "operation": "select"
}
```

### 3. Validate Query (`POST /api/validate`)

Checks if a query is feasible to execute without actually running it.

**Request Body:**
```json
{
  "query": "your natural language query here"
}
```

**Required Headers:**
```
x-api-key: 5ygy9bi3rgjgcgr
```

**Response:**
```json
{
  "success": true,
  "feasible": true,
  "reason": null
}
```

If the query is not feasible, the response will include a reason:

```json
{
  "success": true,
  "feasible": false,
  "reason": "Query could not be translated"
}
```

## Sample Query Examples

Here are some example queries that demonstrate the system's capabilities:

### Basic Select Queries

```
show all users
```
Returns all user records from the database.

```
get products
```
Returns all product records from the database.

### Filtered Queries

```
show users with age greater than 27
```
Returns users whose age is greater than 27.

```
find products with price less than 100
```
Returns products with a price less than 100.

```
show products with price equal to 800
```Returns products with a price equal to 800.

### Category Filters

```
show products in electronics category
```
Returns all products in the electronics category.

### Aggregate Queries

```
what is the average age of users
```
Calculates and returns the average age of all users.

```
show total price of products
```
Calculates and returns the sum of all product prices.

## Error Handling

The API handles various error cases:

- Missing or invalid API key (401/403)
- Missing query parameter (400)
- Unsupported query types (400)
- Reference to non-existent tables or fields (400)
- Queries without recognizable intent (400)

## Data Structure

The system uses a mock database with three tables:

### Users
Fields: id, name, email, age, join_date

### Products
Fields: id, name, category, price, stock

### Orders
Fields: id, user_id, product_id, quantity, order_date

## Tech Stack

- Node.js
- Express
- Compromise.js (for NLP processing)

## Setup Instructions (Local Development)

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/AntimonyBullets/Query-Simulation-Engine.git
   cd query-simulation-engine
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. For production
   ```bash
   npm start
   ```
   
---

Query Simulation Engine: A natural language to structured query translator. 
