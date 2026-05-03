/**
 * Global Error Handler Middleware
 */

const logger = require('../../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
    userId: req.userId
  });

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Resource Error', message: `Invalid format for field: ${err.path}` });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    return res.status(400).json({ error: 'Validation Error', errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ error: 'Conflict', message: `${field} is already registered` });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Authentication Error', message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Authentication Error', message: 'Token expired' });
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'A temporary server error occurred.'
    : err.message;

  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.url}` });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, notFoundHandler, asyncHandler };
