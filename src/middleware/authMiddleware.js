// authentication middleware
const authenticate = (req, res, next) => {
  // get api key from request header
  const apiKey = req.header('x-api-key');
  
  // api key validation - using a simple hardcoded key for demo purposes
  // in a real application, this would be stored securely and not in code
  const validApiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is required'
    });
  }
  
  if (apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      message: 'Invalid API key'
    });
  }
  
  // if authentication passes, proceed to the next middleware/controller
  next();
};

export { authenticate }; 