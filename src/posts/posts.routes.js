// src/posts/posts.routes.js

const express = require('express');
const postsService = require('./posts.service');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const { sendSuccess, sendError } = require('../utils/response');
const { ROLES, STATUS_CODES } = require('../config/constants');

const router = express.Router();

// GET /api/posts - Get all posts (public, paginated)
router.get('/', async (req, res) => {
  try {
    const { page, limit, status, author, tags } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (author) filters.author = author;
    if (tags) filters.tags = tags;

    const result = await postsService.getAllPosts(filters, page, limit);
    sendSuccess(res, result, 'Posts retrieved successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/posts/search - Search posts
router.get('/search', async (req, res) => {
  try {
    const { q, page, limit } = req.query;

    if (!q) {
      return sendError(res, 'Search term is required', STATUS_CODES.BAD_REQUEST);
    }

    const result = await postsService.searchPosts(q, page, limit);
    sendSuccess(res, result, 'Search completed successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/posts/my-posts - Get current user's posts (requires authentication)
router.get('/my-posts', authenticate, async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await postsService.getPostsByAuthor(req.user.userId, page, limit);
    sendSuccess(res, result, 'Your posts retrieved successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
});

// GET /api/posts/:id - Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await postsService.getPostById(req.params.id);
    
    // Increment view count
    await postsService.incrementViews(req.params.id);
    
    sendSuccess(res, post, 'Post retrieved successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.NOT_FOUND);
  }
});

// POST /api/posts - Create new post (requires authentication)
router.post('/', authenticate, async (req, res) => {
  try {
    const post = await postsService.createPost(req.body, req.user.userId);
    sendSuccess(res, post, 'Post created successfully', STATUS_CODES.CREATED);
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.BAD_REQUEST);
  }
});

// PUT /api/posts/:id - Update post (requires authentication)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const post = await postsService.updatePost(req.params.id, req.body, req.user.userId);
    sendSuccess(res, post, 'Post updated successfully');
  } catch (error) {
    const statusCode = 
      error.message.includes('Unauthorized')
        ? STATUS_CODES.FORBIDDEN
        : error.message.includes('not found')
        ? STATUS_CODES.NOT_FOUND
        : STATUS_CODES.BAD_REQUEST;
    sendError(res, error.message, statusCode);
  }
});

// PATCH /api/posts/:id/publish - Publish post (requires authentication)
router.patch('/:id/publish', authenticate, async (req, res) => {
  try {
    const post = await postsService.publishPost(req.params.id, req.user.userId);
    sendSuccess(res, post, 'Post published successfully');
  } catch (error) {
    const statusCode = 
      error.message.includes('Unauthorized')
        ? STATUS_CODES.FORBIDDEN
        : error.message.includes('not found')
        ? STATUS_CODES.NOT_FOUND
        : STATUS_CODES.BAD_REQUEST;
    sendError(res, error.message, statusCode);
  }
});

// PATCH /api/posts/:id/like - Like/Unlike post (requires authentication)
router.patch('/:id/like', authenticate, async (req, res) => {
  try {
    const post = await postsService.toggleLike(req.params.id, req.user.userId);
    sendSuccess(res, post, 'Post like toggled successfully');
  } catch (error) {
    sendError(res, error.message, STATUS_CODES.NOT_FOUND);
  }
});

// DELETE /api/posts/:id - Delete post (requires authentication)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const isAdmin = req.user.role === ROLES.ADMIN;
    const result = await postsService.deletePost(req.params.id, req.user.userId, isAdmin);
    sendSuccess(res, result, 'Post deleted successfully');
  } catch (error) {
    const statusCode = 
      error.message.includes('Unauthorized')
        ? STATUS_CODES.FORBIDDEN
        : error.message.includes('not found')
        ? STATUS_CODES.NOT_FOUND
        : STATUS_CODES.INTERNAL_SERVER_ERROR;
    sendError(res, error.message, statusCode);
  }
});

module.exports = router;