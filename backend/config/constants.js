/**
 * Application Constants
 * Centralized configuration for magic numbers and reusable values
 */

// Validation Limits
export const LIMITS = {
  CHARACTER_NAME: 255,
  CHAT_NAME: 255,
  UNIVERSE_NAME: 255,
  BIO_LENGTH: 10000,
  PERSONALITY_LENGTH: 50000,
  SCENARIO_LENGTH: 5000,
  INTRO_MESSAGE_LENGTH: 2000,
  NOTES_LENGTH: 50000,
  DESCRIPTION_LENGTH: 5000,
  MAX_TAGS: 50,
  TAG_LENGTH: 100,
  URL_LENGTH: 2083,
};

// Content Ratings
export const CONTENT_RATINGS = {
  SFW: 'sfw',
  NSFW: 'nsfw',
};

// Relationship Types
export const RELATIONSHIP_TYPES = [
  'ally',
  'friend',
  'best-friend',
  'rival',
  'enemy',
  'mentor',
  'student',
  'family',
  'romantic',
  'neutral',
  'unknown',
];

// Allowed Domains for Scraping
export const ALLOWED_SCRAPE_DOMAINS = [
  'janitorai.com',
  'www.janitorai.com',
];

// Forbidden URL Paths (prevent scraping sensitive pages)
export const FORBIDDEN_SCRAPE_PATHS = [
  '/admin',
  '/api',
  '/settings',
  '/account',
  '/login',
  '/logout',
  '/dashboard',
];

// Image Configuration
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_DIMENSION: 1024,
  OUTPUT_FORMAT: 'webp',
  OUTPUT_QUALITY: 80,
};

// API Configuration
export const API_CONFIG = {
  VERSION: '0.1.0',
  DEFAULT_LIMIT: 100,
  MAX_LIMIT: 500,
  DEFAULT_OFFSET: 0,
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_NAME: 'DUPLICATE_NAME',
  INVALID_URL: 'INVALID_URL',
  SCRAPING_FAILED: 'SCRAPING_FAILED',
  IMAGE_UPLOAD_FAILED: 'IMAGE_UPLOAD_FAILED',
  IMAGE_PROCESSING_FAILED: 'IMAGE_PROCESSING_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
};

// Puppeteer Configuration
export const PUPPETEER_CONFIG = {
  LAUNCH_OPTIONS: {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-plugins',
    ],
  },
  TIMEOUT: 30000,
  VIEWPORT: {
    width: 1280,
    height: 720,
  },
};

// Database Tables
export const DB_TABLES = {
  CHARACTERS: 'characters',
  GROUPS: 'groups',
  UNIVERSES: 'universes',
};

export default {
  LIMITS,
  CONTENT_RATINGS,
  RELATIONSHIP_TYPES,
  ALLOWED_SCRAPE_DOMAINS,
  FORBIDDEN_SCRAPE_PATHS,
  IMAGE_CONFIG,
  API_CONFIG,
  HTTP_STATUS,
  ERROR_CODES,
  PUPPETEER_CONFIG,
  DB_TABLES,
};
