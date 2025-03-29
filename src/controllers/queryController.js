// importing dependencies
import mockData from '../db/mockData.js';
import nlp from 'compromise';
import { asyncHandler } from '../utils/asyncHandler.js';

// analyzes queries using compromise.js
const analyzeQuery = (query) => {
  // using compromise to parse query
  const doc = nlp(query);
  
  // extracting key info
  const nouns = doc.nouns().out('array');
  const numbers = doc.numbers().out('array');
  
  // converting to lowercase
  const queryLower = query.toLowerCase();
  
  // checking for patterns
  const hasAverage = queryLower.includes('average') || queryLower.includes('avg');
  const hasTotal = queryLower.includes('total') || queryLower.includes('sum');
  
  // looking for comparisons
  const greaterThanMatch = queryLower.match(/(\w+)\s+(greater than|more than|above|over|exceeds)\s+(\d+)/);
  const lessThanMatch = queryLower.match(/(\w+)\s+(less than|lower than|below|under)\s+(\d+)/);
  const equalsMatch = queryLower.match(/(\w+)\s+(equal to|equals|is|=)\s+(\d+|'\w+'|\w+)/);
  
  // setting default query type
  let queryType = 'select';
  let field = null;
  let value = null;
  
  // checking for intent
  const hasRecognizableIntent = 
    queryLower.includes('show') || 
    queryLower.includes('get') || 
    queryLower.includes('find') || 
    queryLower.includes('list') ||
    queryLower.includes('search') ||
    queryLower.includes('what') ||
    queryLower.includes('provide') ||
    queryLower.includes('select') ||
    hasAverage ||
    hasTotal ||
    greaterThanMatch ||
    lessThanMatch ||
    equalsMatch;
  
  // handling unknown intent
  if (!hasRecognizableIntent) {
    return {
      type: 'unknown',
      message: 'Unsupported query type'
    };
  }
  
  // finding table to query
  let table = 'products';
  if (queryLower.includes('user')) table = 'users';
  else if (queryLower.includes('order')) table = 'orders';
  
  // handling comparison queries
  if (greaterThanMatch) {
    queryType = 'greater_than';
    field = greaterThanMatch[1];
    value = parseInt(greaterThanMatch[3]);
  } else if (lessThanMatch) {
    queryType = 'less_than';
    field = lessThanMatch[1];
    value = parseInt(lessThanMatch[3]);
  } else if (equalsMatch) {
    queryType = 'equals';
    field = equalsMatch[1];
    // Try to parse as number if possible, otherwise use as string
    const parsedValue = Number(equalsMatch[3]);
    value = isNaN(parsedValue) ? equalsMatch[3].replace(/['"`]/g, '') : parsedValue;
  } else if (hasAverage) {
    queryType = 'average';
  } else if (hasTotal) {
    queryType = 'sum';
  }
  
  // finding field if not already set
  if (!field) {
    // common fields by table
    const fieldMap = {
      products: ['price', 'stock', 'category'],
      users: ['age', 'name', 'email'],
      orders: ['quantity', 'order_date']
    };
    
    // checking for field in query
    for (const f of fieldMap[table]) {
      if (queryLower.includes(f)) {
        field = f;
        break;
      }
    }
    
    // setting default field
    if (!field) {
      if (table === 'products') field = 'price';
      else if (table === 'users') field = 'age';
      else if (table === 'orders') field = 'quantity';
    }
    
    // checking for number value
    if (numbers.length > 0 && !value) {
      value = parseInt(numbers[0].replace(/,/g, ''));
      
      if (queryLower.includes('greater') || queryLower.includes('more') || queryLower.includes('above')) {
        queryType = 'greater_than';
      } else if (queryLower.includes('less') || queryLower.includes('below') || queryLower.includes('under')) {
        queryType = 'less_than';
      }
    }
  }
  
  // handling product categories
  if (field === 'category') {
    if (queryLower.includes('electronic')) {
      value = 'electronics';
      queryType = 'equals';
    } else if (queryLower.includes('accessor')) {
      value = 'accessories';
      queryType = 'equals';
    }
  }
  
  // logging what was detected
  console.log('Query analysis:', { queryType, table, field, value });
  
  // returning analysis
  return {
    type: queryType,
    table,
    field,
    value
  };
};

// builds query object from analysis
const buildQueryObject = (analysis) => {
  // handling unknown query
  if (analysis.type === 'unknown') {
    return {
      type: 'unknown',
      sql: 'Query could not be translated',
      message: analysis.message || 'Unsupported query type'
    };
  }
  
  const { type, table, field, value } = analysis;
  
  // building sql for each type
  switch (type) {
    case 'average':
      return {
        type: 'aggregate',
        sql: `SELECT AVG(${field}) FROM ${table}`,
        table,
        operation: 'AVG',
        field
      };
      
    case 'sum':
      return {
        type: 'aggregate',
        sql: `SELECT SUM(${field}) FROM ${table}`,
        table,
        operation: 'SUM',
        field
      };
      
    case 'greater_than':
      return {
        type: 'filter',
        sql: `SELECT * FROM ${table} WHERE ${field} > ${value}`,
        table,
        condition: { field, operator: '>', value }
      };
      
    case 'less_than':
      return {
        type: 'filter',
        sql: `SELECT * FROM ${table} WHERE ${field} < ${value}`,
        table,
        condition: { field, operator: '<', value }
      };
      
    case 'equals':
      return {
        type: 'filter',
        sql: `SELECT * FROM ${table} WHERE ${field} = ${value}`,
        table,
        condition: { field, operator: '=', value }
      };
      
    // default select
    default:
      return {
        type: 'select',
        sql: `SELECT * FROM ${table}`,
        table
      };
  }
};

// runs query against mock db
const executeQuery = (query) => {
  // handling errors
  if (query.type === 'unknown') {
    return {
      error: true,
      message: query.message || 'Unsupported query type'
    };
  }
  
  const { type, table, operation, field, condition, join } = query;
  
  // checking if table exists
  if (!mockData[table]) {
    return {
      error: true,
      message: `Table '${table}' not found`
    };
  }
  
  try {
    // handling query types
    switch (type) {
      // aggregate queries
      case 'aggregate':
        if (operation === 'SUM') {
          const sum = mockData[table].reduce((acc, record) => acc + record[field], 0);
          return { result: sum, count: 1 };
        } 
        
        else if (operation === 'AVG') {
          const sum = mockData[table].reduce((acc, record) => acc + record[field], 0);
          const avg = sum / mockData[table].length;
          return { result: avg, count: 1 };
        }
        break;
        
      // basic select
      case 'select':
        return {
          result: mockData[table],
          count: mockData[table].length
        };
        
      // filtered queries
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
        
        // logging filter details
        console.log('Filter condition:', condition);
        console.log('Filtered results:', filtered);
        
        return {
          result: filtered,
          count: filtered.length
        };
        
      // fallback
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

// handles /query endpoint requests
const processQuery = asyncHandler(async (req, res) => {
  const { query } = req.body;
  
  // checking input
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query is required'
    });
  }
  
  // processing query
  const analysis = analyzeQuery(query);
  const queryObject = buildQueryObject(analysis);
  const results = executeQuery(queryObject);
  
  // handling errors
  if (results.error) {
    return res.status(400).json({
      success: false,
      query: {
        original: query,
        translated: queryObject.sql || 'Could not translate query'
      },
      message: results.message
    });
  }
  
  return res.status(200).json({
    success: true,
    query: {
      original: query,
      translated: queryObject.sql
    },
    result: results.result
  });
});

// handles /explain endpoint requests
const explainQuery = asyncHandler(async (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query is required'
    });
  }
  
  const analysis = analyzeQuery(query);
  const queryObject = buildQueryObject(analysis);
  
  if (queryObject.type === 'unknown') {
    return res.status(400).json({
      success: false,
      message: 'Could not understand query',
      query: {
        original: query
      }
    });
  }
  
  let explanation = '';
  let keywordInfo = '';
  const { type, table, field, condition } = queryObject;
  const queryLower = query.toLowerCase();
  
  if (type === 'select') {
    explanation = `This query will retrieve all records from the ${table} table.`;
    
    if (queryLower.includes('show')) {
      keywordInfo = "The SELECT operation was identified by the keyword 'show' in your query.";
    } else if (queryLower.includes('get')) {
      keywordInfo = "The SELECT operation was identified by the keyword 'get' in your query.";
    } else if (queryLower.includes('list')) {
      keywordInfo = "The SELECT operation was identified by the keyword 'list' in your query.";
    } else if (queryLower.includes('find')) {
      keywordInfo = "The SELECT operation was identified by the keyword 'find' in your query.";
    } else {
      keywordInfo = "The SELECT operation was used as the default operation type.";
    }
  } else if (type === 'filter') {
    explanation = `This query will filter ${table} to find records where ${condition.field} ${condition.operator} ${condition.value}.`;
    
    if (condition.operator === '>') {
      if (queryLower.includes('greater than')) {
        keywordInfo = "The FILTER operation was identified by the phrase 'greater than' in your query.";
      } else if (queryLower.includes('more than')) {
        keywordInfo = "The FILTER operation was identified by the phrase 'more than' in your query.";
      } else if (queryLower.includes('above')) {
        keywordInfo = "The FILTER operation was identified by the keyword 'above' in your query.";
      } else if (queryLower.includes('over')) {
        keywordInfo = "The FILTER operation was identified by the keyword 'over' in your query.";
      } else if (queryLower.includes('exceeds')) {
        keywordInfo = "The FILTER operation was identified by the keyword 'exceeds' in your query.";
      }
    } else if (condition.operator === '<') {
      if (queryLower.includes('less than')) {
        keywordInfo = "The FILTER operation was identified by the phrase 'less than' in your query.";
      } else if (queryLower.includes('lower than')) {
        keywordInfo = "The FILTER operation was identified by the phrase 'lower than' in your query.";
      } else if (queryLower.includes('below')) {
        keywordInfo = "The FILTER operation was identified by the keyword 'below' in your query.";
      } else if (queryLower.includes('under')) {
        keywordInfo = "The FILTER operation was identified by the keyword 'under' in your query.";
      }
    } else if (condition.operator === '=') {
      if (queryLower.includes('equal to')) {
        keywordInfo = "The FILTER operation was identified by the phrase 'equal to' in your query.";
      } else if (queryLower.includes('equals')) {
        keywordInfo = "The FILTER operation was identified by the keyword 'equals' in your query.";
      } else if (queryLower.match(/\w+\s+is\s+\d+/)) {
        keywordInfo = "The FILTER operation was identified by the keyword 'is' in your query.";
      } else {
        keywordInfo = "The FILTER operation was identified by matching category values in your query.";
      }
    }
  } else if (type === 'aggregate') {
    const operation = queryObject.operation === 'AVG' ? 'average' : 'sum';
    explanation = `This query will calculate the ${operation} of ${field} from all records in the ${table} table.`;
    
    if (queryObject.operation === 'AVG') {
      if (queryLower.includes('average')) {
        keywordInfo = "The AVERAGE operation was identified by the keyword 'average' in your query.";
      } else if (queryLower.includes('avg')) {
        keywordInfo = "The AVERAGE operation was identified by the keyword 'avg' in your query.";
      }
    } else if (queryObject.operation === 'SUM') {
      if (queryLower.includes('total')) {
        keywordInfo = "The SUM operation was identified by the keyword 'total' in your query.";
      } else if (queryLower.includes('sum')) {
        keywordInfo = "The SUM operation was identified by the keyword 'sum' in your query.";
      }
    }
  }
  
  return res.status(200).json({
    success: true,
    query: {
      original: query,
      translated: queryObject.sql
    },
    explanation: explanation,
    keywordTrigger: keywordInfo,
    tableAccessed: table,
    operation: type
  });
});

// checks if queries can be executed
const validateQuery = asyncHandler(async (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query is required'
    });
  }
  
  const analysis = analyzeQuery(query);
  const queryObject = buildQueryObject(analysis);
  
  const queryLower = query.toLowerCase();
  
  const validTableNames = ['users', 'products', 'orders', 'user', 'product', 'order'];
  const validFieldNames = ['age', 'name', 'email', 'join_date', 'price', 'stock', 'category', 'quantity', 'order_date'];
  
  const hasTableReference = validTableNames.some(table => queryLower.includes(table));
  const hasFieldReference = validFieldNames.some(field => queryLower.includes(field));
  
  let isFeasible = !(
    queryObject.type === 'unknown' || 
    !mockData[queryObject.table] ||
    (!hasTableReference && !hasFieldReference)
  );
  
  let reason = null;
  
  if (queryObject.type === 'unknown') {
    reason = 'Query could not be translated';
  } else if (!mockData[queryObject.table]) {
    reason = `Table '${queryObject.table}' not found`;
  } else if (!hasTableReference && !hasFieldReference) {
    reason = 'Could not find references to any table or field';
  }
  
  return res.status(200).json({
    feasible: isFeasible,
    reason: isFeasible ? null : reason
  });
});

export { processQuery, explainQuery, validateQuery };
