#!/usr/bin/env node

/**
 * Botwaffle Character Nexus - Backend Server
 * Express.js REST API server with security best practices
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/environment.js';
import { initDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { logInfo, logError } from './utils/logger.js';

const app = express();

// ===== SECURITY MIDDLEWARE =====

// Helmet.js - Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  })
);

// CORS Configuration
const corsOptions = {
  origin: config.ALLOWED_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

// ===== BODY PARSING MIDDLEWARE =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== API ROUTES =====

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '0.1.0',
  });
});

// Placeholder routes (to be implemented)
app.get('/api/characters', (req, res) => {
  res.json({ data: [], total: 0, message: 'Character routes not yet implemented' });
});

app.get('/api/groups', (req, res) => {
  res.json({ data: [], total: 0, message: 'Group routes not yet implemented' });
});

app.get('/api/universes', (req, res) => {
  res.json({ data: [], total: 0, message: 'Universe routes not yet implemented' });
});

// ===== ERROR HANDLING =====

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ===== SERVER STARTUP =====

const startServer = async () => {
  try {
    // Initialize database
    logInfo('Initializing database...');
    await initDatabase();
    logInfo('✅ Database initialized successfully');

    // Start Express server
    const server = app.listen(config.SERVER_PORT, () => {
      console.log('\n🚀 Botwaffle Character Nexus - Backend Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📡 Server running on: http://localhost:${config.SERVER_PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`🔒 CORS Origin: ${config.ALLOWED_ORIGIN}`);
      console.log(`📊 Database: ${config.DATABASE_PATH}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`\n✅ Ready to accept requests!\n`);
      console.log(`Try: curl http://localhost:${config.SERVER_PORT}/api/health\n`);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      logInfo('Received shutdown signal, closing server...');
      server.close(() => {
        logInfo('Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logError('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Start the server
startServer();
