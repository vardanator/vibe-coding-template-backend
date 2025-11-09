// src/middleware/auth.js

const { verifyToken } = require('../utils/jwt');
const { STATUS_CODES } = require('../config/constants');

// Middleware to authenticate JWT token
const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: 'No token provided. Please authenticate.',
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
    });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};