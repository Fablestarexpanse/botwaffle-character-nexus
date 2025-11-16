import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  SERVER_PORT: parseInt(process.env.SERVER_PORT, 10) || 3000,

  // Database Configuration
  DATABASE_PATH: process.env.DATABASE_PATH || path.resolve(__dirname, '../../db.sqlite'),

  // API Keys (Backend Only - NEVER expose to frontend)
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  JLLM_API_KEY: process.env.JLLM_API_KEY || '',

  // Application Settings
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT, 10) || 30000,

  // Image Upload Settings
  MAX_IMAGE_SIZE: parseInt(process.env.MAX_IMAGE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  IMAGE_DIR: path.resolve(__dirname, '../../characters/images'),

  // Scraping Settings
  PUPPETEER_HEADLESS: process.env.PUPPETEER_HEADLESS !== 'false',
  SCRAPE_TIMEOUT: parseInt(process.env.SCRAPE_TIMEOUT, 10) || 30000,

  // Security
  isDevelopment: () => config.NODE_ENV === 'development',
  isProduction: () => config.NODE_ENV === 'production',
};

// Validation: Warn if critical config missing
if (config.isDevelopment()) {
  console.log('🔧 Environment: Development');
  console.log(`📂 Database Path: ${config.DATABASE_PATH}`);
  console.log(`🖼️  Image Directory: ${config.IMAGE_DIR}`);
  console.log(`🌐 Allowed Origin: ${config.ALLOWED_ORIGIN}`);
  console.log(`🔑 Claude API Key: ${config.CLAUDE_API_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`🔑 JLLM API Key: ${config.JLLM_API_KEY ? '✅ Set' : '❌ Not set'}`);
}

export default config;
