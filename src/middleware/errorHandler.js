// src/middleware/errorHandler.js

const { STATUS_CODES } = require('../config/constants');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(STATUS_CODES.CONFLICT).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Default error
  const statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async handler wrapper to catch errors in async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
};