# Botwaffle Character Nexus - Architecture Documentation

## Overview

Botwaffle Character Nexus is a privacy-first, local chat storage and character management tool for JanitorAI. It consists of three main components: a browser extension for data capture, a backend API for data processing and storage, and a frontend UI for viewing and managing content.

**Core Philosophy**: All data stays local. No cloud dependencies. Complete user privacy.

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Extension                        │
│               (Chrome/Firefox/Edge compatible)              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Content Script (content.js)                          │  │
│  │  - Injects UI button into JanitorAI                   │  │
│  │  - Manages captured data                              │  │
│  │  - Sends data to local backend                        │  │
│  │                                                         │  │
│  │  Injected Script (injected.js)                        │  │
│  │  - Intercepts XHR/Fetch requests                      │  │
│  │  - Captures chat messages from API responses          │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP POST to localhost:3000
┌──────────────────────▼──────────────────────────────────────┐
│                       Frontend (React)                      │
│                    http://localhost:5173                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Components: Character/Chat Tabs, Modals, Viewers    │  │
│  │  State: React State + useEffect                       │  │
│  │  Styling: Tailwind CSS (Dark Theme)                   │  │
│  │  Features:                                             │  │
│  │    - Chat viewer with message list                    │  │
│  │    - Export in multiple formats                       │  │
│  │    - Character management                             │  │
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
│  │  Features:                                             │  │
│  │    - Chat import and storage                          │  │
│  │    - Export to JSON/TXT/MD/JSONL                      │  │
│  │    - Character CRUD                                   │  │
│  │    - Image processing                                 │  │
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
│  - Conversations│         │  UUID.webp      │
│  - Messages     │         │  UUID.webp      │
│  - Metadata     │         │  ...            │
└─────────────────┘         └─────────────────┘
```

---

## Technology Stack

### Browser Extension
- **Manifest**: Version 3 (modern, compatible with all browsers)
- **Injection**: XHR/Fetch interception for data capture
- **UI**: Vanilla JavaScript (no framework needed)
- **Communication**: window.postMessage + fetch to localhost
- **Permissions**: activeTab, host_permissions for janitorai.com

### Backend
- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js 4.x
- **Database**: SQLite3 (local file-based)
- **Image Processing**: Sharp (resize, format conversion, EXIF removal)
- **Validation**: Joi (schema validation)
- **Security**: Helmet.js, CORS, DOMPurify
- **File Upload**: Multer
- **Environment**: dotenv

### Frontend
- **Framework**: React 18.x
- **Build Tool**: Vite 4.x
- **Styling**: Tailwind CSS 3.x (dark theme)
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

### Chat Capture Flow (Browser Extension → Backend)

```
User browses JanitorAI chat
         │
         ▼
Injected script intercepts XHR/Fetch
  - Detects chat/message API calls
  - Extracts message data from responses
         │
         ▼
Posts data to content script (window.postMessage)
         │
         ▼
Content script normalizes data
  - Determines role (user/assistant)
  - Extracts timestamps
  - Builds message array
  - Updates button badge (message count)
         │
         ▼
User clicks "Send to Botwaffle" button
         │
         ▼
Content script POSTs to localhost:3000/api/chats/import
  {
    chatData: {
      title: "Chat with Character",
      messages: [...],
      characterName: "...",
      personaName: "...",
      sourceUrl: "https://janitorai.com/...",
      metadata: {...}
    }
  }
         │
         ▼
Backend receives import request
         │
         ▼
chatService.importChat() processes data
  - Creates conversation record
  - Creates message records with order_index
  - Updates message_count via trigger
         │
         ▼
Returns success response
         │
         ▼
Content script shows success notification
```

### Chat Viewing Flow (Frontend → Backend)

```
User opens Botwaffle frontend
         │
         ▼
Clicks "Chats" tab
         │
         ▼
Frontend: GET /api/chats
         │
         ▼
Backend queries conversations table
         │
         ▼
Returns array of conversations with message counts
         │
         ▼
Frontend displays conversation list
         │
         ▼
User clicks a conversation
         │
         ▼
Frontend: GET /api/chats/:id/messages
         │
         ▼
Backend queries messages table (ordered by order_index)
         │
         ▼
Returns array of messages
         │
         ▼
Frontend renders message viewer
  - User messages: blue background
  - Assistant messages: dark background
  - Scrollable container
```

### Chat Export Flow

```
User clicks Export button → selects format
         │
         ▼
Frontend: GET /api/chats/:id/export/:format
         │
         ▼
Backend fetches conversation + messages
         │
         ├── format=json → Return full JSON
         │
         ├── format=txt → formatAsText()
         │   - Plain text with [User]/[Assistant] labels
         │   - Timestamps
         │
         ├── format=markdown → formatAsMarkdown()
         │   - Headers and formatting
         │   - Bold labels
         │   - Timestamps
         │
         └── format=jsonl → formatAsSillyTavernJSONL()
             - JSONL format (one JSON object per line)
             - Swipe message handling
             - First message duplication (ST requirement)
             - ISO date formatting
         │
         ▼
Backend sets headers (Content-Type, Content-Disposition)
         │
         ▼
Frontend triggers file download
```

---

## Security Architecture

### Defense-in-Depth Strategy

1. **Browser Extension Security**
   - Manifest V3 (latest security standards)
   - Content Security Policy (CSP)
   - No eval() or inline scripts
   - Only connects to localhost (no external servers)
   - User-initiated actions only (button click required)

2. **Input Validation** (Backend)
   - Joi schema validation on all endpoints
   - File type validation (images only)
   - Size limits (5MB max for images)
   - Message content length limits

3. **Output Sanitization**
   - DOMPurify on backend before database storage
   - DOMPurify on frontend before rendering HTML
   - EXIF metadata stripped from images

4. **Network Security**
   - CORS restricted to localhost:5173 (dev) or specific domain (prod)
   - Helmet.js security headers
   - No API keys exposed to frontend or extension
   - HTTPS upgrade in production

5. **Data Security**
   - SQLite prepared statements (prevent SQL injection)
   - Database file permissions: 0600 (owner read/write only)
   - No sensitive data in logs or error messages
   - Foreign key constraints to maintain data integrity

6. **File Security**
   - UUID-based filenames (prevent path traversal)
   - Path validation (ensure within /characters/images/)
   - Image processing pipeline (re-encode to strip malicious content)

---

## Database Schema (v1.1.0)

### Characters Table
```sql
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  chat_name TEXT,
  universe TEXT NOT NULL,
  image TEXT,
  bio TEXT,
  personality TEXT,
  scenario TEXT,
  intro_message TEXT,
  example_dialogues TEXT,
  tags TEXT,
  content_rating TEXT CHECK(content_rating IN ('sfw', 'nsfw')),
  notes TEXT,
  relationships TEXT,
  custom_tags TEXT,
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT,
  last_synced_from TEXT
);
```

### Conversations Table
```sql
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  character_id TEXT,
  title TEXT,
  persona_name TEXT,
  message_count INTEGER DEFAULT 0,
  source_url TEXT,
  metadata TEXT,
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL
);
```

### Messages Table
```sql
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp DATETIME,
  order_index INTEGER NOT NULL,
  metadata TEXT,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

### Key Indexes
```sql
CREATE INDEX idx_conversations_character ON conversations(character_id);
CREATE INDEX idx_conversations_created ON conversations(created);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_order ON messages(conversation_id, order_index);
```

### Triggers
```sql
-- Auto-update message_count when messages are added
CREATE TRIGGER update_conversation_on_message_insert
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
  UPDATE conversations
  SET message_count = message_count + 1,
      modified = CURRENT_TIMESTAMP
  WHERE id = NEW.conversation_id;
END;

-- Auto-update message_count when messages are deleted
CREATE TRIGGER update_conversation_on_message_delete
AFTER DELETE ON messages
FOR EACH ROW
BEGIN
  UPDATE conversations
  SET message_count = message_count - 1,
      modified = CURRENT_TIMESTAMP
  WHERE id = OLD.conversation_id;
END;
```

---

## API Design

### RESTful Endpoints

#### Characters
- `GET /api/characters` - List all characters
- `GET /api/characters/:id` - Get single character
- `POST /api/characters` - Create character
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

#### Chats (New in v1.1.0)
- `GET /api/chats` - List all conversations
- `GET /api/chats/:id` - Get single conversation
- `GET /api/chats/:id/messages` - Get conversation messages
- `POST /api/chats/import` - Import chat
- `GET /api/chats/:id/export/:format` - Export chat (json|txt|markdown|jsonl)
- `DELETE /api/chats/:id` - Delete conversation

#### Files
- `GET /api/images/:filename` - Serve character image
- `POST /api/images/upload` - Upload custom image

---

## Frontend Architecture

### Component Hierarchy

```
App.jsx
  ├─ Tab Navigation (Characters / Chats)
  │
  ├─ Characters Tab
  │   ├─ Header.jsx
  │   │   ├─ SearchBar.jsx
  │   │   └─ Buttons (New Character, Import)
  │   │
  │   ├─ CharacterGrid.jsx
  │   │   └─ CharacterCard.jsx (x N)
  │   │
  │   └─ Modals
  │       ├─ ImportModal.jsx (JanitorAI URL / JSON file)
  │       ├─ CharacterDetailModal.jsx
  │       ├─ EditCharacterModal.jsx
  │       └─ ConfirmDeleteModal.jsx
  │
  └─ Chats Tab
      ├─ ChatImportModal.jsx
      │   ├─ JSON file upload
      │   └─ Character linking dropdown
      │
      └─ ChatsView.jsx
          ├─ Conversation List (left panel)
          │   └─ ConversationCard (x N)
          │       ├─ Title
          │       ├─ Message count
          │       ├─ Created date
          │       └─ Delete button
          │
          └─ Message Viewer (right panel)
              ├─ Export buttons (JSON, TXT, MD, JSONL)
              ├─ Conversation header
              └─ Message list
                  └─ MessageBubble (x N)
                      ├─ Role indicator (User/Assistant)
                      ├─ Content
                      └─ Timestamp
```

### State Management

**Component State** (useState):
- `activeTab` - 'characters' or 'chats'
- `selectedConversation` - Current conversation being viewed
- `messages` - Messages for selected conversation
- `characters` - Character list
- `conversations` - Conversation list

**Side Effects** (useEffect):
- Fetch conversations on tab change
- Fetch messages when conversation selected
- Refresh data after import/delete

---

## Export Formats

### JSON Format
```json
{
  "id": "conv-uuid",
  "title": "Chat with Character",
  "characterName": "Character Name",
  "personaName": "User",
  "message_count": 25,
  "created": "2025-01-16T10:00:00.000Z",
  "messages": [
    {
      "id": "msg-uuid",
      "role": "user",
      "content": "Hello!",
      "timestamp": "2025-01-16T10:00:00.000Z",
      "order_index": 0
    },
    {
      "id": "msg-uuid",
      "role": "assistant",
      "content": "Hi there!",
      "timestamp": "2025-01-16T10:00:15.000Z",
      "order_index": 1
    }
  ]
}
```

### TXT Format
```
Chat with Character
Created: 2025-01-16T10:00:00.000Z

[User] (10:00:00): Hello!
[Character Name] (10:00:15): Hi there!
```

### Markdown Format
```markdown
# Chat with Character

**Created**: 2025-01-16T10:00:00.000Z
**Messages**: 25

---

**[User]** (10:00:00):
Hello!

**[Character Name]** (10:00:15):
Hi there!
```

### SillyTavern JSONL Format
```jsonl
{"name":"Character Name","is_user":false,"send_date":"2025-01-16 10:00:15","mes":"Hi there!"}
{"name":"User","is_user":true,"send_date":"2025-01-16 10:00:00","mes":"Hello!"}
```

**Key SillyTavern Requirements**:
- Messages in reverse chronological order
- First message duplicated (ST requirement)
- ISO date format: YYYY-MM-DD HH:mm:ss
- Swipe message handling (future enhancement)

---

## Browser Extension Architecture

### File Structure
```
browser-extension/
├── manifest.json       # Extension configuration (Manifest V3)
├── content.js          # Content script (UI + data management)
├── injected.js         # Page context script (network interception)
└── README.md           # Installation and usage guide
```

### Manifest V3 Configuration
```json
{
  "manifest_version": 3,
  "name": "Botwaffle Chat Capture",
  "permissions": ["activeTab"],
  "host_permissions": [
    "https://janitorai.com/*",
    "http://localhost:3000/*"
  ],
  "content_scripts": [{
    "matches": ["*://*.janitorai.com/*"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }],
  "web_accessible_resources": [{
    "resources": ["injected.js"],
    "matches": ["*://*.janitorai.com/*"]
  }]
}
```

### Extension Communication Flow
```
Page Context (injected.js)
  - Intercepts XHR/Fetch
  - Extracts chat data
         │
         ▼ window.postMessage
Content Script (content.js)
  - Listens for messages
  - Normalizes data
  - Manages UI button
         │
         ▼ fetch()
Localhost Backend (port 3000)
  - Receives POST /api/chats/import
  - Stores in database
```

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
  const response = await chatAPI.import(chatData);
  showSuccessToast('Chat imported successfully!');
} catch (error) {
  if (error.response) {
    showErrorToast(error.response.data.error);
  } else if (error.request) {
    showErrorToast('Cannot connect to server');
  } else {
    showErrorToast('An unexpected error occurred');
  }
}
```

---

## Development Workflow

### Running Locally
```bash
# Terminal 1: Backend
cd backend && npm run dev  # Port 3000

# Terminal 2: Frontend
cd frontend && npm run dev  # Port 5173

# OR: Both concurrently from root
npm run dev
```

### Extension Development
1. Edit extension files
2. Reload extension in browser (chrome://extensions/ → Reload)
3. Refresh JanitorAI page to test

---

## Future Enhancements

### Phase 2: Advanced Features
1. **EPUB Export** - Using epub-gen library
2. **PDF Export** - Using puppeteer for styled PDFs
3. **Batch Export** - Export multiple chats as ZIP
4. **Advanced Search** - Full-text search with SQLite FTS5
5. **Chat Analytics** - Message counts, word clouds, timelines

### Phase 3: AI Integration
1. **Character Generation** - Claude API integration
2. **Chat with Characters** - Local LLM integration
3. **Personality Analysis** - Analyze chat patterns

### Phase 4: Deployment
1. **Electron App** - Desktop application
2. **Docker Container** - One-command deployment
3. **Extension Publishing** - Chrome Web Store / Firefox Add-ons
4. **Multi-user Support** - Optional authentication

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
**Version**: 1.1.0
**Status**: Chat Storage System Complete
