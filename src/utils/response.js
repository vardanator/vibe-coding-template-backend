// src/utils/response.js

const { STATUS_CODES } = require('../config/constants');

// Send success response
const sendSuccess = (res, data = null, message = 'Success', statusCode = STATUS_CODES.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Send error response
const sendError = (res, message = 'Error', statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Send paginated response
const sendPaginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(STATUS_CODES.OK).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages: pagination.pages,
      totalItems: pagination.total,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < pagination.pages,
      hasPreviousPage: pagination.page > 1,
    },
  });
};

// Send created response
const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, STATUS_CODES.CREATED);
};

// Send no content response
const sendNoContent = (res) => {
  return res.status(204).send();
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
  sendCreated,
  sendNoContent,
};