// Import mock data from db folder
import mockData from '../db/mockData.js';

/**
 * Simulates natural language to SQL translation
 * @param {string} query - Natural language query
 * @returns {Object} - Translated query details
 */
const translateQueryToSQL = (query) => {
  query = query.toLowerCase();
  
  // Numeric comparison patterns
  const greaterThanPattern = /(\w+)\s+(greater than|more than|higher than|above|larger than|over|>)\s+(\d+)/i;
  const lessThanPattern = /(\w+)\s+(less than|lower than|below|under|smaller than|under|<)\s+(\d+)/i;
  const equalToPattern = /(\w+)\s+(equal to|equals|is|==|=)\s+(\d+)/i;
  
  // Check for numeric comparison queries
  let match;
  let field, operator, value, table;
  
  if (match = query.match(greaterThanPattern)) {
    [, field, operator, value] = match;
    // Determine the table based on the field
    if (field === 'price' || field === 'stock') {
      table = 'products';
    } else if (field === 'amount' || field === 'quantity') {
      table = 'orders';
    } else if (field === 'age') {
      table = 'users';
    } else {
      // Default to products if field not recognized
      table = 'products';
    }
    
    return {
      type: 'comparison',
      sql: `SELECT * FROM ${table} WHERE ${field} > ${value}`,
      table,
      condition: { field, operator: '>', value: parseInt(value) }
    };
  } else if (match = query.match(lessThanPattern)) {
    [, field, operator, value] = match;
    // Determine the table based on the field
    if (field === 'price' || field === 'stock') {
      table = 'products';
    } else if (field === 'amount' || field === 'quantity') {
      table = 'orders';
    } else if (field === 'age') {
      table = 'users';
    } else {
      // Default to products if field not recognized
      table = 'products';
    }
    
    return {
      type: 'comparison',
      sql: `SELECT * FROM ${table} WHERE ${field} < ${value}`,
      table,
      condition: { field, operator: '<', value: parseInt(value) }
    };
  } else if (match = query.match(equalToPattern)) {
    [, field, operator, value] = match;
    // Determine the table based on the field
    if (field === 'price' || field === 'stock') {
      table = 'products';
    } else if (field === 'amount' || field === 'quantity') {
      table = 'orders';
    } else if (field === 'age') {
      table = 'users';
    } else {
      // Default to products if field not recognized
      table = 'products';
    }
    
    return {
      type: 'comparison',
      sql: `SELECT * FROM ${table} WHERE ${field} = ${value}`,
      table,
      condition: { field, operator: '=', value: parseInt(value) }
    };
  } 
  
  // Define some basic patterns to match and translate
  if (query.includes('total sales') || query.includes('revenue')) {
    return {
      type: 'aggregate',
      sql: 'SELECT SUM(price * quantity) FROM orders JOIN products ON orders.product_id = products.id',
      table: 'orders',
      operation: 'SUM',
      field: 'price * quantity',
      join: { table: 'products', on: 'product_id', foreignKey: 'id' }
    };
  } else if (query.includes('average') || query.includes('avg')) {
    let table, field;
    
    if (query.includes('price')) {
      table = 'products';
      field = 'price';
    } else if (query.includes('age')) {
      table = 'users';
      field = 'age';
    } else if (query.includes('quantity')) {
      table = 'orders';
      field = 'quantity';
    }
    
    return {
      type: 'aggregate',
      sql: `SELECT AVG(${field}) FROM ${table}`,
      table,
      operation: 'AVG',
      field
    };
  } else if (query.includes('list') || query.includes('show') || query.includes('get')) {
    let table = 'products';
    if (query.includes('user')) table = 'users';
    if (query.includes('order')) table = 'orders';
    
    return {
      type: 'select',
      sql: `SELECT * FROM ${table}`,
      table
    };
  } else if (query.includes('category') && query.includes('electronic')) {
    return {
      type: 'filter',
      sql: `SELECT * FROM products WHERE category = 'Electronics'`,
      table: 'products',
      condition: { field: 'category', operator: '=', value: 'Electronics' }
    };
  } else if (query.includes('category') && query.includes('accessor')) {
    return {
      type: 'filter',
      sql: `SELECT * FROM products WHERE category = 'Accessories'`,
      table: 'products',
      condition: { field: 'category', operator: '=', value: 'Accessories' }
    };
  }
  
  // Default fallback
  return {
    type: 'unknown',
    sql: 'Could not translate the query',
    message: 'The query could not be understood'
  };
};

/**
 * Executes the simulated SQL query against our mock database
 * @param {Object} translatedQuery - The translated query object
 * @returns {Object} - Query results
 */
const executeQuery = (translatedQuery) => {
  const { type, table, operation, field, condition, join } = translatedQuery;
  
  if (!mockData[table]) {
    return {
      error: true,
      message: `Table '${table}' not found in the database`
    };
  }
  
  try {
    switch (type) {
      case 'aggregate':
        if (operation === 'SUM') {
          if (join) {
            // Complex case with join
            let sum = 0;
            mockData[table].forEach(order => {
              const product = mockData[join.table].find(p => p.id === order[join.on]);
              if (product) {
                sum += product.price * order.quantity;
              }
            });
            return {
              result: sum,
              count: 1
            };
          } else {
            // Simple sum
            const sum = mockData[table].reduce((acc, record) => acc + record[field], 0);
            return {
              result: sum,
              count: 1
            };
          }
        } else if (operation === 'AVG') {
          const sum = mockData[table].reduce((acc, record) => acc + record[field], 0);
          return {
            result: sum / mockData[table].length,
            count: 1
          };
        }
        break;
        
      case 'select':
        return {
          result: mockData[table],
          count: mockData[table].length
        };
        
      case 'filter':
        const filtered = mockData[table].filter(record => {
          if (condition.operator === '=') {
            return record[condition.field] === condition.value;
          } else if (condition.operator === '>') {
            return record[condition.field] > condition.value;
          } else if (condition.operator === '<') {
            return record[condition.field] < condition.value;
          }
          return false;
        });
        return {
          result: filtered,
          count: filtered.length
        };
        
      case 'comparison':
        const comparisonResults = mockData[table].filter(record => {
          if (condition.operator === '>') {
            return record[condition.field] > condition.value;
          } else if (condition.operator === '<') {
            return record[condition.field] < condition.value;
          } else if (condition.operator === '=') {
            return record[condition.field] === condition.value;
          }
          return false;
        });
        return {
          result: comparisonResults,
          count: comparisonResults.length
        };
        
      default:
        return {
          error: true,
          message: 'Unsupported query type'
        };
    }
  } catch (error) {
    return {
      error: true,
      message: 'Error executing query',
      details: error.message
    };
  }
};

/**
 * Main query endpoint controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processQuery = (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }
    
    // Translate natural language query to SQL
    const translatedQuery = translateQueryToSQL(query);
    
    // Execute the query against our mock database
    const queryResult = executeQuery(translatedQuery);
    
    // Prepare response
    return res.status(200).json({
      success: true,
      query: {
        original: query,
        translated: translatedQuery.sql
      },
      result: queryResult.result,
      metadata: {
        resultCount: queryResult.count,
        executionTime: Math.floor(Math.random() * 100) + 'ms', // Simulated execution time
        confidence: Math.floor(Math.random() * 30 + 70) + '%'  // Simulated confidence score
      }
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error processing query',
      error: error.message
    });
  }
};

export { processQuery };
