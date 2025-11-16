import { ALLOWED_SCRAPE_DOMAINS, FORBIDDEN_SCRAPE_PATHS } from '../config/constants.js';
import { ValidationError } from '../middleware/errorHandler.js';

/**
 * Validate JanitorAI URL
 * Ensures URL is from allowed domain and not a forbidden path
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If URL is invalid
 */
export const validateJanitorAIUrl = (url) => {
  try {
    const parsed = new URL(url);

    // Check domain whitelist
    if (!ALLOWED_SCRAPE_DOMAINS.includes(parsed.hostname)) {
      throw new ValidationError(
        `Invalid domain. Only ${ALLOWED_SCRAPE_DOMAINS.join(', ')} allowed.`
      );
    }

    // Check forbidden paths
    for (const path of FORBIDDEN_SCRAPE_PATHS) {
      if (parsed.pathname.includes(path)) {
        throw new ValidationError(`Cannot scrape from restricted page: ${path}`);
      }
    }

    return true;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid URL format');
  }
};

/**
 * Validate UUID format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid UUID
 */
export const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Validate image filename format
 * @param {string} filename - Filename to validate
 * @returns {boolean} True if valid
 */
export const isValidImageFilename = (filename) => {
  // Must be UUID.webp format
  const filenameRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i;
  return filenameRegex.test(filename);
};

/**
 * Sanitize filename to prevent path traversal
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  // Remove path separators and dangerous characters
  return filename.replace(/[^a-z0-9.-]/gi, '_');
};

/**
 * Validate pagination parameters
 * @param {number} limit - Results limit
 * @param {number} offset - Results offset
 * @returns {Object} Validated pagination
 */
export const validatePagination = (limit, offset) => {
  const validLimit = Math.max(1, Math.min(parseInt(limit, 10) || 100, 500));
  const validOffset = Math.max(0, parseInt(offset, 10) || 0);

  return { limit: validLimit, offset: validOffset };
};

export default {
  validateJanitorAIUrl,
  isValidUUID,
  isValidImageFilename,
  sanitizeFilename,
  validatePagination,
};
