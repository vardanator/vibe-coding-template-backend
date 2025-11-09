// src/middleware/validation.js

const { STATUS_CODES, VALIDATION } = require('../config/constants');

// Validate registration input
const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  // Username validation
  if (!username) {
    errors.push('Username is required');
  } else if (username.length < VALIDATION.USERNAME_MIN_LENGTH) {
    errors.push(`Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`);
  } else if (username.length > VALIDATION.USERNAME_MAX_LENGTH) {
    errors.push(`Username cannot exceed ${VALIDATION.USERNAME_MAX_LENGTH} characters`);
  }

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please provide a valid email');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
  }

  if (errors.length > 0) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// Validate login input
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please provide a valid email');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// Validate pagination parameters
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page && (isNaN(page) || page < 1)) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: 'Invalid page number',
    });
  }

  if (limit && (isNaN(limit) || limit < 1)) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: 'Invalid limit value',
    });
  }

  next();
};

// Validate MongoDB ObjectId
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    // MongoDB ObjectId is 24 hex characters
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Invalid ID format',
      });
    }

    next();
  };
};

// Sanitize user input (remove potentially dangerous characters)
const sanitizeInput = (req, res, next) => {
  // Recursively sanitize all string values in req.body
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove potential XSS characters
      return obj.replace(/[<>]/g, '').trim();
    } else if (Array.isArray(obj)) {
      return obj.map(sanitize);
    } else if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePagination,
  validateObjectId,
  sanitizeInput,
};