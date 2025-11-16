import config from '../config/environment.js';

/**
 * Utility for safe logging (strips sensitive data)
 */

const SENSITIVE_FIELDS = [
  'api_key',
  'apiKey',
  'password',
  'token',
  'secret',
  'claudeApiKey',
  'jllmApiKey',
  'authorization',
  'cookie',
  'session',
];

/**
 * Strip sensitive fields from object
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const stripSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };

  SENSITIVE_FIELDS.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });

  return sanitized;
};

/**
 * Format timestamp
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Log info message
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 */
export const logInfo = (message, meta = {}) => {
  const safeMeta = stripSensitiveData(meta);
  console.log(`[${getTimestamp()}] INFO: ${message}`, safeMeta);
};

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Object} meta - Additional metadata
 */
export const logError = (message, meta = {}) => {
  const safeMeta = stripSensitiveData(meta);
  console.error(`[${getTimestamp()}] ERROR: ${message}`, safeMeta);
};

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
export const logWarn = (message, meta = {}) => {
  const safeMeta = stripSensitiveData(meta);
  console.warn(`[${getTimestamp()}] WARN: ${message}`, safeMeta);
};

/**
 * Log debug message (only in development)
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
export const logDebug = (message, meta = {}) => {
  if (config.isDevelopment()) {
    const safeMeta = stripSensitiveData(meta);
    console.log(`[${getTimestamp()}] DEBUG: ${message}`, safeMeta);
  }
};

/**
 * Log action (user action tracking)
 * @param {string} action - Action name
 * @param {Object} details - Action details
 */
export const logAction = (action, details = {}) => {
  const safeDetails = stripSensitiveData(details);
  console.log(`[${getTimestamp()}] ACTION: ${action}`, safeDetails);
};

export default {
  logInfo,
  logError,
  logWarn,
  logDebug,
  logAction,
};
