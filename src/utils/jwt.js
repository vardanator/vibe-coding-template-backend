// src/utils/jwt.js

const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE, JWT_REFRESH_EXPIRE } = require('../config/env');

// Generate JWT token
const generateToken = (payload, isRefreshToken = false) => {
  const expiresIn = isRefreshToken ? JWT_REFRESH_EXPIRE : JWT_EXPIRE;

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

// Decode token without verification (useful for checking token contents)
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};