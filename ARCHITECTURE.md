# Botwaffle Character Nexus - Architecture Documentation

## Overview

Botwaffle Character Nexus is a privacy-first, local character management tool for JanitorAI characters. It enables users to import, organize, and manage roleplay characters in a hierarchical structure with complete data ownership.

**Core Philosophy**: All data stays local. No cloud dependencies. Complete user privacy.

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                      │
│                    http://localhost:5173                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Components: Character Cards, Modals, Sidebar         │  │
│  │  State: React Context + Local State                   │  │
│  │  Styling: Tailwind CSS (Dark Theme)                   │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (JSON)
                       │ CORS: localhost:5173
┌──────────────────────▼──────────────────────────────────────┐
│                   Backend (Express.js)                      │
│                    http://localhost:3000                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Routes → Controllers → Services → Database           │  │
│  │  Middleware: Helmet, CORS, Validation, Error Handler │  │
│  │  Security: Input validation, sanitization, auth      │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │                           │
┌────────▼────────┐         ┌────────▼────────┐
│  SQLite3 DB     │         │  File Storage   │
│  (db.sqlite)    │         │  /characters/   │
│                 │         │     images/     │
│  - Characters   │         │                 │
│  - Groups       │         │  UUID.webp      │
│  - Universes    │         │  UUID.webp      │
│  - Metadata     │         │  ...            │
└─────────────────┘         └─────────────────┘
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js 4.x
- **Database**: SQLite3 (local file-based)
- **Scraping**: Puppeteer (headless Chrome)
- **Image Processing**: Sharp (resize, format conversion, EXIF removal)
- **Validation**: Joi (schema validation)
- **Security**: Helmet.js, CORS, DOMPurify
- **File Upload**: Multer
- **Environment**: dotenv

### Frontend
- **Framework**: React 18.x
- **Build Tool**: Vite 4.x
- **Styling**: Tailwind CSS 3.x
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Sanitization**: DOMPurify (client-side)

### Development Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Development**: Nodemon (backend hot reload), Vite HMR (frontend)
- **Concurrency**: Concurrently (run both servers)

---

## Data Flow

### Character Import Flow

```
User pastes JanitorAI URL
         │
         ▼
Frontend validates URL
         │
         ▼
POST /api/import/janitorai
         │
         ▼
Backend validates URL (whitelist check)
         │
         ▼
Puppeteer scrapes character data
  - Name, bio, personality
  - Profile image URL
  - Tags, scenario, example dialogues
         │
         ▼
Download and process image
  - Strip EXIF metadata (privacy)
  - Convert to WebP (compression)
  - Save with UUID filename
         │
         ▼
Sanitize HTML content (DOMPurify)
         │
         ▼
Validate data (Joi schema)
         │
         ▼
Insert into SQLite database
         │
         ▼
Return character object to frontend
         │
         ▼
Frontend updates UI (character grid)
```

### Character Display Flow

```
User navigates to main page
         │
         ▼
Frontend: GET /api/characters
         │
         ▼
Backend queries SQLite
         │
         ▼
Returns JSON array of characters
         │
         ▼
Frontend renders character cards
  - Portrait image
  - Name, universe, tags
  - Relationship count
         │
         ▼
User right-clicks → context menu
  - View Details
  - Edit
  - Duplicate
  - Add to Group
  - Delete
```

---

## Security Architecture

### Defense-in-Depth Strategy

1. **Input Validation** (Backend)
   - Joi schema validation on all endpoints
   - URL whitelist for scraping (janitorai.com only)
   - File type validation (images only)
   - Size limits (5MB max)

2. **Output Sanitization**
   - DOMPurify on backend before database storage
   - DOMPurify on frontend before rendering HTML
   - EXIF metadata stripped from images

3. **Network Security**
   - CORS restricted to localhost:5173 (dev) or specific domain (prod)
   - Helmet.js security headers
   - No API keys exposed to frontend

4. **Data Security**
   - SQLite prepared statements (prevent SQL injection)
   - Database file permissions: 0600 (owner read/write only)
   - No sensitive data in logs or error messages

5. **File Security**
   - UUID-based filenames (prevent path traversal)
   - Path validation (ensure within /characters/images/)
   - Image processing pipeline (re-encode to strip malicious content)

### Environment Variable Isolation

**Backend Only** (never exposed):
```
CLAUDE_API_KEY=sk-ant-...
JLLM_API_KEY=...
DATABASE_PATH=./db.sqlite
```

**Frontend Safe** (can be exposed):
```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_VERSION=0.1.0
```

---

## Database Schema

### Characters Table
```sql
CREATE TABLE characters (
  id TEXT PRIMARY KEY,              -- UUID v4
  name TEXT NOT NULL,
  chat_name TEXT,
  universe TEXT NOT NULL,
  image TEXT,                       -- Filename (UUID.webp)
  bio TEXT,                         -- Sanitized HTML
  personality TEXT,
  scenario TEXT,
  intro_message TEXT,
  example_dialogues TEXT,           -- JSON array
  tags TEXT,                        -- JSON array
  content_rating TEXT,              -- 'sfw' | 'nsfw'
  notes TEXT,                       -- User notes
  relationships TEXT,               -- JSON array
  custom_tags TEXT,                 -- JSON array
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT,                      -- Original JanitorAI URL
  last_synced_from TEXT             -- URL for re-import
);
```

### Groups Table
```sql
CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  universe TEXT NOT NULL,
  description TEXT,
  characters TEXT,                  -- JSON array of character IDs
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Universes Table
```sql
CREATE TABLE universes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Design

### RESTful Endpoints

#### Characters
- `GET /api/characters` - List all characters (with filters)
- `GET /api/characters/:id` - Get single character
- `POST /api/characters` - Create character (manual)
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

#### Import
- `POST /api/import/janitorai` - Import from URL
- `POST /api/import/manual` - Manual character creation

#### Groups
- `GET /api/groups` - List all groups
- `GET /api/groups/:id` - Get single group
- `POST /api/groups` - Create group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

#### Universes
- `GET /api/universes` - List all universes
- `POST /api/universes` - Create universe
- `PUT /api/universes/:id` - Update universe
- `DELETE /api/universes/:id` - Delete universe

#### Files
- `GET /api/images/:filename` - Serve character image
- `POST /api/images/upload` - Upload custom image

---

## Frontend Architecture

### Component Hierarchy

```
App.jsx
  └─ MainPage.jsx
      ├─ Header.jsx
      │   ├─ SearchBar.jsx
      │   └─ Button.jsx (Import, Settings)
      │
      ├─ Sidebar.jsx
      │   └─ UniverseTree
      │       └─ GroupItems
      │           └─ CharacterItems
      │
      ├─ CharacterGrid.jsx
      │   └─ CharacterCard.jsx (x N)
      │       └─ ContextMenu.jsx (right-click)
      │
      └─ Modals
          ├─ ImportModal.jsx
          ├─ CharacterDetailModal.jsx
          ├─ EditCharacterModal.jsx
          └─ ConfirmDeleteModal.jsx
```

### State Management

**Context API** for global state:
- `CharacterContext` - Character data, CRUD operations
- `UIContext` - Modals, selected items, filters

**Local State** for component-specific:
- Form inputs
- Loading states
- Temporary UI state

### Styling Strategy

**Tailwind CSS** with custom theme:
```javascript
// Dark theme colors
{
  'dark-bg': '#1a1a1a',       // Main background
  'dark-card': '#2d2d2d',     // Card background
  'dark-border': '#404040',   // Borders
}
```

**Responsive breakpoints**:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## File Storage Strategy

### Image Storage

**Location**: `/characters/images/`

**Naming Convention**: UUID v4 + `.webp`
Example: `f47ac10b-58cc-4372-a567-0e02b2c3d479.webp`

**Processing Pipeline**:
1. Download from URL or receive upload
2. Validate MIME type (jpeg, png, webp only)
3. Validate file size (max 5MB)
4. Strip EXIF metadata (privacy)
5. Convert to WebP (compression)
6. Resize if needed (max 1024x1024)
7. Save with UUID filename

**Why WebP?**
- Better compression than JPEG/PNG
- Supports transparency
- Smaller file sizes

---

## Error Handling Strategy

### Backend Error Responses

```javascript
{
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "details": {} // Only in development
}
```

**HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

### Frontend Error Handling

```javascript
try {
  const response = await api.fetchCharacters();
} catch (error) {
  if (error.response) {
    // Server responded with error
    showErrorToast(error.response.data.error);
  } else if (error.request) {
    // Network error
    showErrorToast('Cannot connect to server');
  } else {
    // Client-side error
    showErrorToast('An unexpected error occurred');
  }
}
```

---

## Development Workflow

### Running Locally

```bash
# Terminal 1: Root (install dependencies)
npm install

# Terminal 2: Backend
cd backend
npm install
npm run dev  # Runs on localhost:3000

# Terminal 3: Frontend
cd frontend
npm install
npm run dev  # Runs on localhost:5173

# OR: Run both concurrently from root
npm run dev
```

### Database Initialization

```bash
cd backend
npm run init-db  # Creates db.sqlite and tables
```

---

## Future Enhancements (Phase 2+)

1. **Relationship Graph Visualization**
   - D3.js or Cytoscape.js
   - Interactive node graph
   - Visual relationship types

2. **AI Generation Integration**
   - Claude API for character generation
   - JLLM API for alternative generation
   - Chat with characters locally

3. **Export/Import**
   - JSON export of entire library
   - Import from other tools
   - Backup/restore functionality

4. **Advanced Search**
   - Full-text search (SQLite FTS5)
   - Filter by multiple criteria
   - Saved searches

5. **Collections/Playlists**
   - Custom groupings beyond universe/faction
   - Tags-based collections
   - Smart collections (dynamic filters)

---

## Deployment Considerations

### Local-First Deployment

**Option 1**: Desktop App (Electron)
- Package as standalone app
- No server required
- Native OS integration

**Option 2**: Local Web Server
- Keep as Node.js app
- Users run `npm start`
- Access via browser

**Option 3**: Docker Container
- Package entire stack
- One-command deployment
- Isolated environment

---

## Contributing Guidelines

1. **Always test security**:
   - Run validation tests
   - Check for XSS vulnerabilities
   - Verify file upload restrictions

2. **Code style**:
   - Run `npm run lint` before commit
   - Run `npm run format` for consistency
   - Follow existing patterns

3. **Documentation**:
   - Update ARCHITECTURE.md for design changes
   - Update API_DOCS.md for endpoint changes
   - Update DATABASE.md for schema changes

---

## License

MIT License - See LICENSE file for details.

---

**Last Updated**: 2025-11-16
**Version**: 0.1.0
**Status**: Initial Setup Phase
