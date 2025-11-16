import { HTTP_STATUS, ERROR_CODES } from '../config/constants.js';
import config from '../config/environment.js';
import { logError } from '../utils/logger.js';

/**
 * Global error handler middleware
 * Catches all errors and returns appropriate responses
 */
export const errorHandler = (err, req, res, next) => {
  // Log error server-side (with sensitive data filtered)
  logError('Error caught by error handler', {
    error: err.message,
    stack: config.isDevelopment() ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Default to 500 if status code not set
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;

  // Generic error message for production
  let message = err.message || 'Internal server error';
  if (config.isProduction() && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    message = 'An unexpected error occurred';
  }

  // Build error response
  const errorResponse = {
    error: message,
    code: errorCode,
  };

  // Include stack trace in development only
  if (config.isDevelopment()) {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || {};
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: `Route not found: ${req.method} ${req.path}`,
    code: ERROR_CODES.NOT_FOUND,
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error classes
 */

export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.DATABASE_ERROR);
  }
}

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ValidationError,
  NotFoundError,
  DatabaseError,
};
