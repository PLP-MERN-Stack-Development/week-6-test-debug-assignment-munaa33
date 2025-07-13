// server/src/utils/logger.js - Logging utility

const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp} - ${message}`, meta);
  },

  error: (message, error = null, meta = {}) => {
    const timestamp = new Date().toISOString();
    const errorDetails = error ? `\nError: ${error.message}\nStack: ${error.stack}` : '';
    console.error(`[ERROR] ${timestamp} - ${message}${errorDetails}`, meta);
  },

  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp} - ${message}`, meta);
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`[DEBUG] ${timestamp} - ${message}`, meta);
    }
  },

  // Performance logging
  performance: (operation, duration, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[PERF] ${timestamp} - ${operation} took ${duration}ms`, meta);
  },

  // Request logging
  request: (req, res, duration) => {
    const timestamp = new Date().toISOString();
    const status = res.statusCode;
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    console.log(`[REQUEST] ${timestamp} - ${method} ${url} ${status} ${duration}ms - ${userAgent}`);
  }
};

module.exports = logger; 