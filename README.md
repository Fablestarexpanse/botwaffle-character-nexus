# Botwaffle Character Nexus

> **Privacy-first, local chat storage and character management for JanitorAI**

A powerful tool for storing and managing your JanitorAI chats and characters. Capture chats directly from JanitorAI with our browser extension, create and organize characters, export conversations in multiple formats—all with complete privacy and local-only storage.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

---

## Features

✅ **Browser Extension** - One-click chat capture from JanitorAI.com (no manual downloads!)
✅ **Chat Storage** - Save and organize conversations with full message history
✅ **Multiple Export Formats** - JSON, TXT, Markdown, SillyTavern JSONL
✅ **Character Management** - Create and organize characters manually or import from JanitorAI
✅ **Local-First Privacy** - All data stored on your machine (SQLite + local storage)
✅ **Smart Organization** - Link chats to characters, search conversations, filter by date
✅ **Dark Theme UI** - Modern dark design with Tailwind CSS
✅ **Security Built-In** - Input validation, HTML sanitization, data privacy
✅ **Open Source** - MIT License, self-hostable

---

## Quick Start

### Option 1: Easy Rebuild (Windows/Linux/Mac)

```bash
# Windows
rebuild.bat

# Linux/Mac
./rebuild.sh
```

The rebuild script will:
- Delete old files
- Clone fresh repository
- Install all dependencies
- Initialize database
- You're ready to go!

### Option 2: Manual Setup

```bash
# Clone repository
git clone https://github.com/Fablestarexpanse/botwaffle-character-nexus.git
cd botwaffle-character-nexus

# Install dependencies
npm install
npm install --prefix backend
npm install --prefix frontend

# Setup environment
cp .env.example .env

# Initialize database
cd backend && npm run init-db && cd ..

# Run development servers
npm run dev
```

**Backend**: http://localhost:3000
**Frontend**: http://localhost:5173

---

## Browser Extension Setup

To capture chats from JanitorAI, install our lightweight browser extension:

### Chrome/Edge

1. Open `chrome://extensions/` (or `edge://extensions/`)
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `browser-extension` folder from this project
5. Visit JanitorAI.com and start capturing!

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `browser-extension/manifest.json`
4. Visit JanitorAI.com and start capturing!

See [browser-extension/README.md](./browser-extension/README.md) for detailed instructions.

---

## How It Works

```
┌─────────────────┐
│  JanitorAI.com  │  ← Browse and chat normally
│   (chat page)   │
└────────┬────────┘
         │
    ┌────▼─────────────────┐
    │ Browser Extension    │  ← Captures messages automatically
    │ [Send to Botwaffle]  │
    │    Button (23 msgs)  │
    └────┬─────────────────┘
         │ HTTP POST
    ┌────▼─────────────────┐
    │  localhost:3000      │  ← Your Botwaffle backend
    │  Botwaffle Nexus     │     saves to SQLite
    └────┬─────────────────┘
         │
    ┌────▼─────────────────┐
    │  localhost:5173      │  ← View and manage chats
    │  Frontend UI         │     in beautiful interface
    └──────────────────────┘
```

**Workflow:**
1. Install browser extension
2. Visit JanitorAI and chat normally
3. Extension captures messages as they load
4. Click "Send to Botwaffle" button when ready
5. View your chat in Botwaffle (Chats tab)
6. Export to any format (JSON, TXT, Markdown, SillyTavern)

---

## Tech Stack

**Backend**
- Node.js + Express.js
- SQLite3 (local database)
- Sharp (image processing)
- Joi (validation) + DOMPurify (sanitization)
- Helmet.js (security headers)

**Frontend**
- React 18 + Vite
- Tailwind CSS (dark theme)
- Axios (HTTP client)
- Lucide React (icons)

**Browser Extension**
- Manifest V3 (Chrome/Firefox/Edge compatible)
- XHR/Fetch interception
- Direct integration with local backend

---

## Project Structure

```
botwaffle-character-nexus/
├── browser-extension/      # Browser extension for chat capture
│   ├── manifest.json        # Extension config
│   ├── content.js          # Main content script
│   ├── injected.js         # Network interception
│   └── README.md           # Extension docs
│
├── backend/                # Express API server
│   ├── server.js           # Main entry point
│   ├── config/             # Environment, database config
│   ├── routes/             # API routes (characters, chats)
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   └── db/
│       └── schema.sql      # Database schema (v1.1.0)
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.jsx         # Main component (tabs: Characters/Chats)
│   │   ├── components/     # UI components
│   │   │   ├── characters/ # Character management
│   │   │   ├── chats/      # Chat viewer (ChatsView.jsx)
│   │   │   └── modals/     # Import modals
│   │   ├── services/       # API client (characterAPI, chatAPI)
│   │   └── styles/         # Tailwind CSS
│   └── index.html
│
├── characters/images/      # Character portraits (local storage)
├── db.sqlite               # SQLite database (not committed)
├── .env                    # Environment variables (not committed)
├── rebuild.sh              # Quick rebuild script (Linux/Mac)
├── rebuild.bat             # Quick rebuild script (Windows)
└── docs/                   # Documentation
    ├── SETUP_GUIDE.md      # Detailed setup
    ├── API_DOCS.md         # API reference
    ├── DATABASE.md         # Schema documentation
    ├── ARCHITECTURE.md     # System architecture
    ├── SECURITY.md         # Security guidelines
    └── JANITORAI_DOWNLOADER_ANALYSIS.md  # Research analysis
```

---

## Usage

### Capturing Chats from JanitorAI

1. **Install Extension**: Load the browser extension (see setup above)
2. **Visit JanitorAI**: Navigate to any chat on https://janitorai.com
3. **Chat Normally**: The extension automatically captures messages
4. **Send to Botwaffle**: Click the purple "Send to Botwaffle" button
5. **View in App**: Open http://localhost:5173 and click "Chats" tab

### Managing Chats

- **View Conversations**: Click on any conversation to see messages
- **Export Chats**: Click export button and choose format:
  - JSON (full data)
  - TXT (plain text)
  - Markdown (formatted)
  - SillyTavern JSONL (compatible with SillyTavern)
- **Delete Chats**: Remove conversations you no longer need
- **Search**: Filter by character, date, or title

### Creating Characters

1. Click "New Character" button
2. Fill in name, universe, bio, personality
3. Upload custom portrait (optional)
4. Save and organize

### Linking Chats to Characters

When importing a chat, you can link it to an existing character for better organization.

---

## API Reference

### Characters
- `GET /api/characters` - List all characters
- `GET /api/characters/:id` - Get single character
- `POST /api/characters` - Create character
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

### Chats
- `GET /api/chats` - List all conversations
- `GET /api/chats/:id` - Get single conversation
- `GET /api/chats/:id/messages` - Get conversation messages
- `POST /api/chats/import` - Import chat (from extension or JSON file)
- `GET /api/chats/:id/export/:format` - Export chat (json|txt|markdown|jsonl)
- `DELETE /api/chats/:id` - Delete conversation

See [docs/API_DOCS.md](./docs/API_DOCS.md) for complete API documentation.

---

## Database Schema

**Version 1.1.0** includes:

### Characters Table
- Character profiles (name, bio, personality, images, tags)
- Custom notes and relationships
- Creation and modification timestamps

### Conversations Table
- Chat metadata (title, source URL, message count)
- Character linking (optional foreign key)
- Persona name tracking

### Messages Table
- Individual messages (role, content, timestamp)
- Order preservation
- Metadata storage

See [docs/DATABASE.md](./docs/DATABASE.md) for complete schema.

---

## Export Formats

### JSON
Full structured data with all metadata
```json
{
  "title": "Chat with Character",
  "characterName": "Character Name",
  "messages": [...]
}
```

### TXT
Plain text conversation format
```
[User] Hello!
[Character] Hi there!
```

### Markdown
Formatted markdown with headers
```markdown
# Chat with Character

**[User]**: Hello!

**[Character]**: Hi there!
```

### SillyTavern JSONL
Compatible with SillyTavern format
- Swipe message support
- First message duplication (ST requirement)
- Proper date formatting

---

## Security & Privacy

**Privacy-First Design**:
- All data stored locally on your machine
- No cloud services or external APIs
- Database: `db.sqlite` (permissions: 0600)
- Images: `/characters/images/` (local only)
- Browser extension: Localhost-only communication

**Security Measures**:
- Input validation with Joi schemas
- HTML sanitization with DOMPurify
- Prepared SQL statements (prevent SQL injection)
- CORS restricted to localhost
- Helmet.js security headers
- No external data transmission

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

---

## Development

### Run Development Servers

```bash
# Both servers concurrently
npm run dev

# Or separately:
npm run backend   # Backend only (port 3000)
npm run frontend  # Frontend only (port 5173)
```

### Linting & Formatting

```bash
npm run lint      # Lint all files
npm run format    # Format with Prettier
```

### Database Management

```bash
# Reset database
rm db.sqlite
cd backend && npm run init-db

# View database (SQLite CLI)
sqlite3 db.sqlite
> .tables
> SELECT * FROM conversations;
```

---

## Troubleshooting

**Extension button not appearing?**
- Wait 2 seconds after page load
- Refresh the JanitorAI page
- Check browser console for errors

**"Failed to send chat to Botwaffle"?**
- Ensure backend is running: `npm run backend`
- Verify http://localhost:3000 is accessible
- Check backend terminal for errors

**Port 3000 already in use?**
```bash
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

**Database locked?**
```bash
rm db.sqlite
cd backend && npm run init-db
```

See [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) for more solutions.

---

## Roadmap

### Current Version (1.1.0)
- [x] Chat storage and management system
- [x] Browser extension for JanitorAI capture
- [x] Multiple export formats (JSON, TXT, Markdown, JSONL)
- [x] Character creation and management
- [x] Dark theme UI with tab navigation

### Phase 2: Enhanced Features
- [ ] Advanced search across conversations
- [ ] Batch export (export multiple chats at once)
- [ ] EPUB export format
- [ ] PDF export with custom styling
- [ ] Character avatar auto-detection from chats
- [ ] Chat analytics and statistics

### Phase 3: Advanced Organization
- [ ] Relationship graph visualization
- [ ] Collections/playlists
- [ ] Tags and custom categorization
- [ ] Full-text search (SQLite FTS5)
- [ ] Backup/restore functionality

### Phase 4: Deployment
- [ ] Electron desktop app
- [ ] Docker container
- [ ] Chrome Web Store / Firefox Add-ons publication
- [ ] Multi-user support (optional)

---

## Documentation

- [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) - Detailed setup instructions
- [API_DOCS.md](./docs/API_DOCS.md) - Complete API reference
- [DATABASE.md](./docs/DATABASE.md) - Database schema documentation
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture
- [SECURITY.md](./docs/SECURITY.md) - Security best practices
- [browser-extension/README.md](./browser-extension/README.md) - Extension guide
- [JANITORAI_DOWNLOADER_ANALYSIS.md](./docs/JANITORAI_DOWNLOADER_ANALYSIS.md) - Research analysis

---

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow code style (ESLint + Prettier)
4. Test your changes
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

**Security**: Report vulnerabilities via GitHub Issues with the security label.

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Acknowledgments

- Built for the JanitorAI roleplay community
- Inspired by the JanitorAI Chat Downloader extension
- Part of the **Botwaffle** suite of character management tools

---

## Contact

- **GitHub**: https://github.com/Fablestarexpanse/botwaffle-character-nexus
- **Issues**: https://github.com/Fablestarexpanse/botwaffle-character-nexus/issues

---

**Made with 💜 for the roleplay community**

*Privacy-first. Local-only. Open source.*
