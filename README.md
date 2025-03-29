# GenAI Analytics API

A lightweight backend service that simulates natural language query processing for data analytics. This service interprets English language queries and translates them into structured query operations, returning relevant data from the system.

## Features

- Natural language query processing
- Support for various query types (select, filter, aggregation)
- Query explanation functionality
- Query validation endpoint
- Mock database with sample users, products, and orders

## Tech Stack

- Node.js
- Express
- Compromise.js (for NLP processing)

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/genai-analytics-api.git
   cd genai-analytics-api
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

## API Documentation

The API provides three main endpoints for interacting with the natural language query system:

### 1. Process Query (`POST /api/v1/query`)

Processes a natural language query and returns matching data from the mock database.

**Request Body:**
```json
{
  "query": "your natural language query here"
}
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

### 2. Explain Query (`POST /api/v1/explain`)

Analyzes a natural language query and provides an explanation of how it would be processed without executing it.

**Request Body:**
```json
{
  "query": "your natural language query here"
}
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

### 3. Validate Query (`POST /api/v1/validate`)

Checks if a query is feasible to execute without actually running it.

**Request Body:**
```json
{
  "query": "your natural language query here"
}
```

**Response:**
```json
{
  "feasible": true,
  "reason": null
}
```

If the query is not feasible, the response will include a reason:

```json
{
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
```
Returns products with a price equal to 800.

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

- Missing query parameter
- Unsupported query types
- Reference to non-existent tables or fields
- Queries without recognizable intent

## Data Structure

The system uses a mock database with three tables:

### Users
Fields: id, name, email, age, join_date

### Products
Fields: id, name, category, price, stock

### Orders
Fields: id, user_id, product_id, quantity, order_date

## Deployment

The API can be deployed to various platforms including:

- Render
- Heroku
- Railway

Deployment instructions will vary based on the chosen platform.

## Testing

A Postman collection will be provided separately for testing all API endpoints with various query examples.

## License

[MIT](LICENSE)

---

Project created as part of the GenAI Analytics challenge. 