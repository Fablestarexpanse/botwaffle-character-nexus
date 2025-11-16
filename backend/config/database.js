import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { verbose } = sqlite3;
const sqlite = verbose();

// Database connection
let db = null;

/**
 * Initialize database connection
 * Sets up SQLite database with proper configuration and permissions
 */
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // Ensure database directory exists
    const dbDir = path.dirname(config.DATABASE_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite.Database(config.DATABASE_PATH, (err) => {
      if (err) {
        console.error('❌ Database connection error:', err.message);
        reject(err);
        return;
      }

      console.log(`✅ Database connected: ${config.DATABASE_PATH}`);

      // Set database file permissions (owner read/write only)
      try {
        if (fs.existsSync(config.DATABASE_PATH)) {
          fs.chmodSync(config.DATABASE_PATH, 0o600);
          console.log('🔒 Database permissions set to 0600 (owner only)');
        }
      } catch (permError) {
        console.warn('⚠️  Could not set database permissions:', permError.message);
      }

      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (pragmaErr) => {
        if (pragmaErr) {
          console.error('❌ Error enabling foreign keys:', pragmaErr.message);
          reject(pragmaErr);
          return;
        }

        console.log('✅ Foreign keys enabled');

        // Run schema initialization
        const schemaPath = path.resolve(__dirname, '../db/schema.sql');

        try {
          const schema = fs.readFileSync(schemaPath, 'utf8');

          db.exec(schema, (schemaErr) => {
            if (schemaErr) {
              console.error('❌ Error running schema:', schemaErr.message);
              reject(schemaErr);
              return;
            }

            console.log('✅ Database schema initialized');
            resolve(db);
          });
        } catch (readErr) {
          console.error('❌ Error reading schema file:', readErr.message);
          reject(readErr);
        }
      });
    });
  });
};

/**
 * Get database instance
 * @returns {sqlite3.Database} Database instance
 */
export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

/**
 * Close database connection
 */
export const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve();
      return;
    }

    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
        reject(err);
        return;
      }

      console.log('✅ Database connection closed');
      db = null;
      resolve();
    });
  });
};

/**
 * Run a query with parameters (for INSERT, UPDATE, DELETE)
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Promise with result
 */
export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

/**
 * Get single row from database
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Promise with single row
 */
export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

/**
 * Get all rows from database
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Promise with array of rows
 */
export const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
};

export default {
  initDatabase,
  getDatabase,
  closeDatabase,
  run,
  get,
  all,
};
