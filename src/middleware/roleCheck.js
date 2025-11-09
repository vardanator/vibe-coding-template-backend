// src/middleware/roleCheck.js

const { STATUS_CODES } = require('../config/constants');

// Middleware to check if user has required role(s)
const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.role) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'You do not have permission to access this resource',
        });
      }

      next();
    } catch (error) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error checking permissions',
      });
    }
  };
};

// Middleware to check if user is accessing their own resource
const checkOwnership = (userIdParam = 'id') => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.userId) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get the user ID from params
      const resourceUserId = req.params[userIdParam];

      // Check if user owns the resource or is an admin
      if (req.user.userId !== resourceUserId && req.user.role !== 'admin') {
        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'You can only access your own resources',
        });
      }

      next();
    } catch (error) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error checking ownership',
      });
    }
  };
};

module.exports = {
  checkRole,
  checkOwnership,
};