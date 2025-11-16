# Security Guidelines - Botwaffle Character Nexus

## Overview

Security is built into this project from day one. This document outlines all security measures, best practices, and guidelines for developers.

**Core Principle**: Privacy-first, local-only, zero-trust architecture.

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [API Key Management](#api-key-management)
3. [Input Validation](#input-validation)
4. [Output Sanitization](#output-sanitization)
5. [File Upload Security](#file-upload-security)
6. [Database Security](#database-security)
7. [Network Security](#network-security)
8. [Error Handling](#error-handling)
9. [Logging Security](#logging-security)
10. [Deployment Checklist](#deployment-checklist)

---

## Environment Variables

### Critical Rules

**NEVER COMMIT**:
- `.env`
- `.env.local`
- `.env.production`
- Any file containing real API keys

**ALWAYS COMMIT**:
- `.env.example` (with dummy values only)

### .gitignore Configuration

```gitignore
# REQUIRED in .gitignore
.env
.env.local
.env.production
.env.*.local
.secrets/
keys/
*.key
*.pem
```

### Backend Environment Variables (NEVER expose to frontend)

```bash
# backend/.env
NODE_ENV=development
SERVER_PORT=3000
DATABASE_PATH=./db.sqlite

# API KEYS - Backend only, NEVER in frontend
CLAUDE_API_KEY=sk-ant-your-real-key-here
JLLM_API_KEY=your-real-jllm-key-here
```

### Frontend Environment Variables (Safe to expose)

```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_VERSION=0.1.0
```

**WARNING**: Any `REACT_APP_` variable will be exposed in the production build!

### Verification Before First Commit

```bash
# Check git history for .env files
git log --all --full-history -- .env

# Should return nothing! If files found, they must be removed from history
```

---

## API Key Management

### Backend Configuration

```javascript
// ✅ CORRECT - Backend only (backend/config/environment.js)
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,  // Backend only
  JLLM_API_KEY: process.env.JLLM_API_KEY,      // Backend only
  DATABASE_PATH: process.env.DATABASE_PATH,
  SERVER_PORT: process.env.SERVER_PORT || 3000,
};
```

### Frontend Configuration

```javascript
// ✅ CORRECT - Frontend (frontend/src/config.js)
export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  VERSION: import.meta.env.VITE_VERSION || '0.1.0',
};

// ❌ WRONG - NEVER do this in frontend
// const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY; // EXPOSED!
```

### API Key Usage

```javascript
// ✅ All API calls go through backend
// frontend/services/api.js
export const generateWithClaude = async (prompt) => {
  const response = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  return response.json();
};

// Backend handles the actual API call with the key
// backend/controllers/generateController.js
import { config } from '../config/environment.js';

export const generate = async (req, res) => {
  const { prompt } = req.body;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    headers: {
      'x-api-key': config.CLAUDE_API_KEY, // Safe: backend only
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  // ... handle response
};
```

---

## Input Validation

### Backend Validation with Joi

```javascript
// backend/middleware/validation.js
import Joi from 'joi';

export const characterSchema = Joi.object({
  name: Joi.string().trim().max(255).required(),
  universe: Joi.string().trim().max(255).required(),
  bio: Joi.string().max(10000).allow(''),
  personality: Joi.string().max(50000).allow(''),
  tags: Joi.array().items(Joi.string().max(100)).max(50),
  contentRating: Joi.string().valid('sfw', 'nsfw'),
});

export const validateCharacter = (req, res, next) => {
  const { error, value } = characterSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message),
    });
  }
  req.validatedData = value;
  next();
};
```

### URL Validation for Scraping

```javascript
// backend/services/janitoraiScraper.js
const ALLOWED_DOMAINS = ['janitorai.com', 'www.janitorai.com'];
const FORBIDDEN_PATHS = ['/admin', '/api', '/settings', '/account'];

export const validateJanitorAIUrl = (url) => {
  try {
    const parsed = new URL(url);

    // Check domain whitelist
    if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
      throw new Error('Invalid domain - only janitorai.com allowed');
    }

    // Check forbidden paths
    for (const path of FORBIDDEN_PATHS) {
      if (parsed.pathname.includes(path)) {
        throw new Error('Cannot scrape from restricted pages');
      }
    }

    return true;
  } catch (error) {
    throw new Error('Invalid URL format');
  }
};
```

---

## Output Sanitization

### HTML Sanitization (Backend)

```javascript
// backend/middleware/sanitization.js
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
};

// Usage in controller
export const createCharacter = async (req, res) => {
  const { bio, personality } = req.validatedData;

  const sanitized = {
    bio: sanitizeHtml(bio),
    personality: sanitizeHtml(personality),
  };

  // Save sanitized data to database
};
```

### Frontend Sanitization (Defense-in-Depth)

```javascript
// frontend/components/CharacterCard.jsx
import DOMPurify from 'dompurify';

const CharacterCard = ({ character }) => {
  const safeBio = DOMPurify.sanitize(character.bio);

  return (
    <div>
      <h2>{character.name}</h2>
      <div dangerouslySetInnerHTML={{ __html: safeBio }} />
    </div>
  );
};
```

**Why sanitize twice?** Defense-in-depth. If backend sanitization is bypassed, frontend still protects.

---

## File Upload Security

### Image Validation and Processing

```javascript
// backend/services/imageService.js
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_DIR = './characters/images';

export const saveCharacterImage = async (imageBuffer, mimeType) => {
  // 1. Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('Invalid image type. Only JPEG, PNG, WebP allowed.');
  }

  // 2. Validate file size
  if (imageBuffer.length > MAX_FILE_SIZE) {
    throw new Error('Image too large. Maximum size is 5MB.');
  }

  // 3. Process image with Sharp
  const processedImage = await sharp(imageBuffer)
    .withMetadata(false)  // Strip EXIF (privacy!)
    .rotate()             // Auto-rotate based on EXIF
    .resize(1024, 1024, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 80 })
    .toBuffer();

  // 4. Generate UUID filename
  const filename = `${uuid()}.webp`;
  const filepath = path.join(IMAGE_DIR, filename);

  // 5. Verify path is safe (prevent path traversal)
  const resolvedPath = path.resolve(filepath);
  const resolvedDir = path.resolve(IMAGE_DIR);
  if (!resolvedPath.startsWith(resolvedDir)) {
    throw new Error('Invalid file path');
  }

  // 6. Save file
  await fs.writeFile(resolvedPath, processedImage);

  return filename;
};
```

### Why Strip EXIF Metadata?

EXIF data can contain:
- GPS coordinates (location where photo was taken)
- Camera model
- Software used
- Timestamps
- Copyright information

**Privacy risk**: User uploads character portrait taken from their phone → EXIF reveals their home location!

### File Upload Endpoint

```javascript
// backend/routes/images.js
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
    } else {
      cb(null, true);
    }
  },
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const filename = await saveCharacterImage(
      req.file.buffer,
      req.file.mimetype
    );
    res.json({ filename });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

---

## Database Security

### SQL Injection Prevention

```javascript
// ✅ CORRECT - Prepared statements
db.prepare('SELECT * FROM characters WHERE id = ?').get(characterId);
db.prepare('INSERT INTO characters (id, name) VALUES (?, ?)').run(id, name);

// ❌ WRONG - SQL injection vulnerability!
db.run(`SELECT * FROM characters WHERE id = ${characterId}`);
db.run(`INSERT INTO characters (id, name) VALUES ('${id}', '${name}')`);
```

### Database File Permissions

```javascript
// backend/config/database.js
import fs from 'fs';
import sqlite3 from 'sqlite3';

const dbPath = process.env.DATABASE_PATH || './db.sqlite';

// Set restrictive permissions (owner read/write only)
if (fs.existsSync(dbPath)) {
  fs.chmodSync(dbPath, 0o600);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
});
```

**Permissions Explanation**:
- `0o600` = Owner: read+write, Group: none, Others: none
- Prevents other users on the system from accessing the database

---

## Network Security

### CORS Configuration

```javascript
// backend/server.js
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGIN  // Specific domain only
    : 'http://localhost:5173',     // Vite dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
```

### Helmet.js Security Headers

```javascript
// backend/server.js
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

### Puppeteer Scraping Security

```javascript
// backend/services/janitoraiScraper.js
const launchOptions = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-plugins',
  ],
  timeout: 30000,
};

const browser = await puppeteer.launch(launchOptions);
```

**Why these flags?**
- `--no-sandbox`: Required for Docker/containerized environments
- `--disable-dev-shm-usage`: Prevents memory issues
- Timeout: Prevents infinite hangs

---

## Error Handling

### Generic Error Messages to Client

```javascript
// ❌ WRONG - Exposes internal details
app.get('/api/characters', (req, res) => {
  try {
    const data = fs.readFileSync('/home/user/db.sqlite');
  } catch (error) {
    res.json({ error: error.stack }); // Shows file paths!
  }
});

// ✅ CORRECT - Generic message, log details server-side
app.get('/api/characters', (req, res) => {
  try {
    const data = getAllCharacters();
    res.json(data);
  } catch (error) {
    console.error('Database error:', error); // Log internally
    res.status(500).json({ error: 'Failed to fetch characters' }); // Generic to client
  }
});
```

### Error Handler Middleware

```javascript
// backend/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err); // Log full error server-side

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Usage
app.use(errorHandler);
```

---

## Logging Security

### Safe Logging Practices

```javascript
// backend/utils/logger.js
export const logAction = (action, details) => {
  // Strip sensitive fields
  const safeDetails = {
    ...details,
    api_key: undefined,
    password: undefined,
    token: undefined,
    secret: undefined,
    claudeApiKey: undefined,
    jllmApiKey: undefined,
  };

  console.log(`[${new Date().toISOString()}] ${action}`, safeDetails);
};

// ❌ WRONG
console.log('API Key:', process.env.CLAUDE_API_KEY);

// ✅ CORRECT
console.log('API Key configured:', !!process.env.CLAUDE_API_KEY);
```

---

## Deployment Checklist

### Pre-Commit Checklist

```
- [ ] .env file exists locally, NOT committed
- [ ] .gitignore includes all sensitive files
- [ ] No API keys anywhere in code
- [ ] Git history checked: `git log --all --full-history -- .env`
- [ ] All user input validated with Joi
- [ ] All HTML sanitized with DOMPurify
- [ ] EXIF stripping enabled for images
- [ ] Puppeteer URL validation implemented
- [ ] Error messages don't expose system details
- [ ] Logging doesn't include sensitive data
- [ ] Database file has 0600 permissions
- [ ] All queries use prepared statements
- [ ] CORS restricted to specific origin
- [ ] Helmet.js configured
```

### Production Deployment Checklist

```
- [ ] NODE_ENV=production
- [ ] Different .env for production
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] File upload limits enforced
- [ ] Database backups configured
- [ ] Logging to file (not just console)
- [ ] Error monitoring (Sentry, etc.)
- [ ] Security headers verified (securityheaders.com)
```

---

## Reporting Security Issues

If you discover a security vulnerability, please email: security@botwaffle.io

**Do NOT** open a public GitHub issue for security vulnerabilities.

---

## Security Updates

- **2025-11-16**: Initial security guidelines created
- **Version**: 0.1.0

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security Best Practices](https://react.dev/learn/security)

---

**Remember**: Security is not a feature. It's a process. Review this document regularly and update as new threats emerge.
