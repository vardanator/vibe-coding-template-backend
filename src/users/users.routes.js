// src/users/users.routes.js

const express = require('express');
const usersService = require('./users.service');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { sendSuccess, sendError } = require('../utils/response');
const { ROLES, STATUS_CODES } = require('../config/constants');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users - Get all users (paginated)
router.get('/', async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await usersService.getAllUsers(page, limit);
    sendSuccess(res, result, 'Users retrieved successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/users/search - Search users
router.get('/search', async (req, res) => {
  try {
    const { q, page, limit } = req.query;

    if (!q) {
      return sendError(res, 'Search term is required', STATUS_CODES.BAD_REQUEST);
    }

    const result = await usersService.searchUsers(q, page, limit);
    sendSuccess(res, result, 'Search completed successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/users/me - Get current user profile
router.get('/me', async (req, res) => {
  try {
    const user = await usersService.getUserById(req.user.userId);
    sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.NOT_FOUND);
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.NOT_FOUND);
  }
});

// PUT /api/users/me - Update current user profile
router.put('/me', async (req, res) => {
  try {
    const user = await usersService.updateUser(req.user.userId, req.body);
    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.BAD_REQUEST);
  }
});

// PUT /api/users/:id - Update user by ID (own profile or admin)
router.put('/:id', async (req, res) => {
  try {
    // Users can only update their own profile unless they're admin
    if (req.params.id !== req.user.userId && req.user.role !== ROLES.ADMIN) {
      return sendError(res, 'Unauthorized to update this user', STATUS_CODES.FORBIDDEN);
    }

    const user = await usersService.updateUser(req.params.id, req.body);
    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.BAD_REQUEST);
  }
});

// PATCH /api/users/:id/role - Update user role (admin only)
router.patch('/:id/role', checkRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return sendError(res, 'Role is required', STATUS_CODES.BAD_REQUEST);
    }

    const user = await usersService.updateUserRole(req.params.id, role);
    sendSuccess(res, user, 'User role updated successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.BAD_REQUEST);
  }
});

// DELETE /api/users/:id - Soft delete user (admin only)
router.delete('/:id', checkRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const result = await usersService.deleteUser(req.params.id);
    sendSuccess(res, result, 'User deleted successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.NOT_FOUND);
  }
});

// DELETE /api/users/:id/permanent - Permanently delete user (admin only)
router.delete('/:id/permanent', checkRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const result = await usersService.permanentlyDeleteUser(req.params.id);
    sendSuccess(res, result, 'User permanently deleted');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.NOT_FOUND);
  }
});

module.exports = router;