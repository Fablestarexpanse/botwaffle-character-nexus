import { v4 as uuidv4 } from 'uuid';
import DOMPurify from 'isomorphic-dompurify';

/**
 * General utility helper functions
 */

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export const generateUUID = () => {
  return uuidv4();
};

/**
 * Sanitize HTML content
 * Removes dangerous tags and attributes to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Parse JSON safely
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed value or default
 */
export const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Convert object to JSON string safely
 * @param {*} obj - Object to stringify
 * @param {string} defaultValue - Default value if stringify fails
 * @returns {string} JSON string or default
 */
export const safeJsonStringify = (obj, defaultValue = '{}') => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Sleep/delay utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export const truncate = (str, maxLength) => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

/**
 * Remove undefined/null values from object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
export const removeEmpty = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null)
  );
};

/**
 * Format timestamp to ISO string
 * @param {Date|string|number} date - Date to format
 * @returns {string} ISO string
 */
export const formatTimestamp = (date) => {
  return new Date(date).toISOString();
};

/**
 * Check if string is valid JSON
 * @param {string} str - String to check
 * @returns {boolean} True if valid JSON
 */
export const isValidJson = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Extract domain from URL
 * @param {string} url - URL string
 * @returns {string} Domain name
 */
export const extractDomain = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (error) {
    return '';
  }
};

export default {
  generateUUID,
  sanitizeHtml,
  safeJsonParse,
  safeJsonStringify,
  sleep,
  truncate,
  removeEmpty,
  formatTimestamp,
  isValidJson,
  extractDomain,
};
