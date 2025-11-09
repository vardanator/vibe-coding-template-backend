// src/auth/auth.routes.js

const express = require('express');
const authService = require('./auth.service');
const { authenticate } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { sendSuccess, sendError } = require('../utils/response');
const { STATUS_CODES } = require('../config/constants');

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 'Registration successful', STATUS_CODES.CREATED);
  } catch (error) {
    const statusCode = 
      error.message.includes('already') 
        ? STATUS_CODES.CONFLICT 
        : STATUS_CODES.BAD_REQUEST;
    sendError(res, error.message, statusCode);
  }
});

// POST /api/auth/login - Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    const statusCode = 
      error.message.includes('Invalid') || error.message.includes('deactivated')
        ? STATUS_CODES.UNAUTHORIZED 
        : STATUS_CODES.INTERNAL_SERVER_ERROR;
    sendError(res, error.message, statusCode);
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', STATUS_CODES.BAD_REQUEST);
    }

    const result = await authService.refreshToken(refreshToken);
    sendSuccess(res, result, 'Token refreshed successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.UNAUTHORIZED);
  }
});

// POST /api/auth/change-password - Change password (requires authentication)
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(
        res,
        'Current password and new password are required',
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (newPassword.length < 8) {
      return sendError(
        res,
        'New password must be at least 8 characters',
        STATUS_CODES.BAD_REQUEST
      );
    }

    const result = await authService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );

    sendSuccess(res, result, 'Password changed successfully');
  } catch (error) {
    const statusCode = 
      error.message.includes('incorrect')
        ? STATUS_CODES.BAD_REQUEST
        : STATUS_CODES.INTERNAL_SERVER_ERROR;
    sendError(res, error.message, statusCode);
  }
});

// POST /api/auth/verify-email - Verify email (placeholder)
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendError(res, 'Verification token is required', STATUS_CODES.BAD_REQUEST);
    }

    const result = await authService.verifyEmail(token);
    sendSuccess(res, result, 'Email verified successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.BAD_REQUEST);
  }
});

// GET /api/auth/me - Get current user (requires authentication)
router.get('/me', authenticate, async (req, res) => {
  try {
    const User = require('../users/users.model');
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return sendError(res, 'User not found', STATUS_CODES.NOT_FOUND);
    }

    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
});

// POST /api/auth/logout - Logout (client-side token removal, optional endpoint)
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token. However, you could implement token blacklisting here
    // if needed for enhanced security
    
    sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
});

module.exports = router;