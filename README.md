# 🔍 Query Simulation Engine

[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![Render](https://img.shields.io/badge/Render-Deployed-success.svg)](https://query-simulation-engine.onrender.com)

A lightweight backend service that simulates natural language query processing for data analytics. This service interprets English language queries and translates them into structured query operations, returning relevant data from the system.

<div align="center">
  <img src="https://user-images.githubusercontent.com/11446256/226600852-44c0c60f-9d06-4a95-ab0e-1042cabbb314.png" width="500px" alt="Query Simulation Engine">
</div>

## 🚀 API Service

The API is deployed with the base URL:
[https://query-simulation-engine.onrender.com](https://query-simulation-engine.onrender.com)

The specific API endpoints are:
- `https://query-simulation-engine.onrender.com/api/query`
- `https://query-simulation-engine.onrender.com/api/explain`
- `https://query-simulation-engine.onrender.com/api/validate`

> **Note:** This is an API-only service with no frontend interface. It can only be accessed through API requests (POST) using tools like Postman or curl, not directly through a browser.

### ⚠️ Deployment Notes
- The first request after a period of inactivity may take 10-30 seconds to respond as the server needs to restart. Subsequent requests will be processed at normal speed.

## 📋 Postman Collection

To test the API, you can use the provided Postman collection:

1. Download the collection: [Query-Simulation-Engine.postman_collection.json](./Query-Simulation-Engine.postman_collection.json)
2. Open **Postman** and go to "Collections"
3. Click on **Import** and select the downloaded file
4. The collection includes ready-to-use requests for all endpoints:
   - Process Query
   - Explain Query
   - Validate Query
5. All requests are pre-configured with the correct API key header

## 🔐 Authentication

All API endpoints are protected by API key authentication. You need to include the API key in your requests:

**Header:**
```
x-api-key: 5ygy9bi3rgjgcgr
```

Requests without a valid API key will receive a 401 Unauthorized or 403 Forbidden response.

## ✨ Features

- 🧠 Natural language query processing
- 🔍 Support for various query types (select, filter, aggregation)
- 📝 Query explanation functionality
- ✅ Query validation endpoint
- 🔑 API key authentication
- 💾 Mock database with sample users, products, and orders

## 📘 API Documentation

The API provides three main endpoints for interacting with the natural language query system:

### 1. Process Query (`POST /api/query`)

Processes a natural language query and returns matching data from the mock database.

<details>
<summary><strong>View Request/Response Details</strong></summary>

**Request Body:**
```json
{
  "query": "find products with price less than 600"
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
    "original": "find products with price less than 600",
    "translated": "SELECT * FROM products WHERE price < 600"
  },
  "result": [
    // Array of matching records from the database
  ]
}
```
</details>

### 2. Explain Query (`POST /api/explain`)

Analyzes a natural language query and provides an explanation of how it would be processed without executing it.

<details>
<summary><strong>View Request/Response Details</strong></summary>

**Request Body:**
```json
{
  "query": "show all users"
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
    "original": "show all users",
    "translated": "SELECT * FROM users"
  },
  "explanation": "This query will retrieve all records from the users table.",
  "keywordTrigger": "The SELECT operation was identified by the keyword 'show' in your query.",
  "tableAccessed": "users",
  "operation": "select"
}
```
</details>

### 3. Validate Query (`POST /api/validate`)

Checks if a query is feasible to execute without actually running it.

<details>
<summary><strong>View Request/Response Details</strong></summary>

**Request Body:**
```json
{
  "query": "retrieve xyz from abc"
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
</details>

## 💬 Sample Query Examples

Here are some example queries that demonstrate the system's capabilities:

### Basic Select Queries

| Query | Description |
|-------|-------------|
| `show all users` | Returns all user records from the database. |
| `get products` | Returns all product records from the database. |

### Filtered Queries

| Query | Description |
|-------|-------------|
| `show users with age greater than 27` | Returns users whose age is greater than 27. |
| `find products with price less than 100` | Returns products with a price less than 100. |
| `show products with price equal to 800` | Returns products with a price equal to 800. |

### Category Filters

| Query | Description |
|-------|-------------|
| `show products in electronics category` | Returns all products in the electronics category. |

### Aggregate Queries

| Query | Description |
|-------|-------------|
| `what is the average age of users` | Calculates and returns the average age of all users. |
| `show total price of products` | Calculates and returns the sum of all product prices. |

## ⚠️ Error Handling

The API handles various error cases:

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 401/403 | Authentication Error | Missing or invalid API key |
| 400 | Validation Error | Missing query parameter |
| 400 | Query Error | Unsupported query types |
| 400 | Reference Error | Reference to non-existent tables or fields |
| 400 | Intent Error | Queries without recognizable intent |

## 💾 Data Structure

The system uses a mock database with three tables:

<details>
<summary><strong>Users</strong></summary>

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| name | String | User's name |
| email | String | User's email address |
| age | Integer | User's age |
| join_date | String | Date when user joined |
</details>

<details>
<summary><strong>Products</strong></summary>

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| name | String | Product name |
| category | String | Product category |
| price | Number | Product price |
| stock | Integer | Available stock |
</details>

<details>
<summary><strong>Orders</strong></summary>

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| user_id | Integer | Reference to user |
| product_id | Integer | Reference to product |
| quantity | Integer | Number of items ordered |
| order_date | String | Date of order |
</details>

## 🛠️ Tech Stack

- ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) Node.js
- ![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white) Express
- ![Compromise.js](https://img.shields.io/badge/-Compromise.js-764ABC?style=flat-square&logo=javascript&logoColor=white) Compromise.js (for NLP processing)

## 💻 Setup Instructions (Local Development)

### Prerequisites

- Node.js (v14+)
- npm

### Installation

<details>
<summary><strong>Step-by-Step Instructions</strong></summary>

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
</details>

---

<div align="center">
  <p><strong>Query Simulation Engine:</strong> A natural language to structured query translator.</p>
  <p>Developed as a project assignment for <a href="https://growthgear.in/">GrowthGear</a>.</p>
</div>
