#!/usr/bin/env node

/**
 * Database Initialization Script
 * Creates SQLite database and schema from schema.sql
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const dbPath = path.resolve(__dirname, '../../db.sqlite');
const schemaPath = path.resolve(__dirname, '../db/schema.sql');
const imageDir = path.resolve(__dirname, '../../characters/images');

console.log('🚀 Initializing Botwaffle Character Nexus Database...\n');

// Ensure directories exist
const ensureDirectories = () => {
  // Ensure image directory exists
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
    console.log(`✅ Created image directory: ${imageDir}`);
  }

  // Create .gitkeep in images directory
  const gitkeepPath = path.join(imageDir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
    console.log('✅ Created .gitkeep in images directory');
  }
};

// Initialize database
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    // Check if database already exists
    const dbExists = fs.existsSync(dbPath);
    if (dbExists) {
      console.log(`⚠️  Database already exists: ${dbPath}`);
      console.log('   To reset, delete db.sqlite and run this script again.\n');
    } else {
      console.log(`📁 Creating database: ${dbPath}`);
    }

    // Create database connection
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error creating database:', err.message);
        reject(err);
        return;
      }

      if (!dbExists) {
        console.log('✅ Database file created successfully');
      }

      // Read schema SQL
      const schema = fs.readFileSync(schemaPath, 'utf8');

      // Execute schema
      db.exec(schema, (execErr) => {
        if (execErr) {
          console.error('❌ Error creating schema:', execErr.message);
          reject(execErr);
          return;
        }

        console.log('✅ Schema created successfully');

        // Set database file permissions (owner read/write only)
        try {
          fs.chmodSync(dbPath, 0o600);
          console.log('🔒 Database permissions set to 0600 (owner only)');
        } catch (permErr) {
          console.warn('⚠️  Could not set database permissions:', permErr.message);
        }

        // Verify schema
        db.all(
          "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
          [],
          (tablesErr, tables) => {
            if (tablesErr) {
              console.error('❌ Error verifying schema:', tablesErr.message);
              reject(tablesErr);
              return;
            }

            console.log('\n📊 Database Tables:');
            tables.forEach((table) => {
              console.log(`   - ${table.name}`);
            });

            // Get schema version
            db.get('SELECT version FROM schema_version LIMIT 1', [], (versionErr, row) => {
              if (!versionErr && row) {
                console.log(`\n📌 Schema Version: ${row.version}`);
              }

              db.close((closeErr) => {
                if (closeErr) {
                  console.error('❌ Error closing database:', closeErr.message);
                  reject(closeErr);
                  return;
                }

                console.log('\n✅ Database initialization complete!\n');
                console.log('🎉 You can now run the backend server with:');
                console.log('   npm run dev\n');
                resolve();
              });
            });
          }
        );
      });
    });
  });
};

// Main execution
(async () => {
  try {
    ensureDirectories();
    await initializeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    process.exit(1);
  }
})();
