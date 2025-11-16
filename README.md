# Botwaffle Character Nexus

> **Privacy-first, local character management for JanitorAI bots**

A ComfyUI-inspired tool for organizing and managing JanitorAI character profiles. Import, organize hierarchically, and manage your roleplay characters with complete privacy—all data stored locally, no cloud required.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

---

## Features

✅ **One-Click Import** - Paste JanitorAI URL → auto-import character with portrait
✅ **Hierarchical Organization** - Universe → Group → Character structure
✅ **Local-First Privacy** - All data stored on your machine (SQLite + local images)
✅ **Smart Tags & Search** - Filter by tags, universe, content rating, name
✅ **Relationship Mapping** - Track character relationships and connections
✅ **Dark Theme UI** - ComfyUI-inspired design with Tailwind CSS
✅ **Security Built-In** - Input validation, HTML sanitization, EXIF stripping
✅ **Open Source** - MIT License, self-hostable

---

## Quick Start

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

See [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) for detailed instructions.

---

## Tech Stack

**Backend**
- Node.js + Express.js
- SQLite3 (local database)
- Puppeteer (JanitorAI scraping)
- Sharp (image processing with EXIF stripping)
- Joi (validation) + DOMPurify (sanitization)
- Helmet.js (security headers)

**Frontend**
- React 18 + Vite
- Tailwind CSS (dark theme)
- Axios (HTTP client)
- Lucide React (icons)

---

## Project Structure

```
botwaffle-character-nexus/
├── backend/                # Express API server
│   ├── server.js           # Main entry point
│   ├── config/             # Environment, database config
│   ├── routes/             # API routes
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic (scraping, images)
│   ├── middleware/         # Validation, error handling
│   └── db/                 # Schema, migrations
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.jsx         # Main component
│   │   ├── components/     # UI components
│   │   ├── services/       # API client
│   │   └── styles/         # Tailwind CSS
│   └── index.html
│
├── characters/images/      # Character portraits (local storage)
├── db.sqlite               # SQLite database (not committed)
├── .env                    # Environment variables (not committed)
└── docs/                   # Documentation
    ├── SETUP_GUIDE.md      # Detailed setup
    ├── API_DOCS.md         # API reference
    ├── SECURITY.md         # Security guidelines
    └── DATABASE.md         # Schema documentation
```

---

## Usage

### Import from JanitorAI

1. Copy character URL from JanitorAI (e.g., `https://janitorai.com/characters/abc123`)
2. Click "Import" button in app
3. Paste URL and click "Import Character"
4. Character appears in grid with portrait, tags, and metadata

### Manual Character Creation

1. Click "New Character" button
2. Fill in name, universe, bio, personality, tags
3. Upload custom portrait (optional)
4. Save

### Organize Characters

- **Universes**: Top-level categories (e.g., "Star Wars", "Marvel")
- **Groups**: Factions, teams, organizations (e.g., "Avengers", "Sith Lords")
- **Characters**: Individual characters with relationships

Drag-and-drop in sidebar to reorganize (coming in v0.2.0).

---

## Security & Privacy

**Privacy-First Design**:
- All data stored locally on your machine
- No cloud services or external APIs (except for imports)
- Database file: `db.sqlite` (permissions: 0600, owner-only)
- Images stored in `/characters/images/`

**Security Measures**:
- Input validation with Joi schemas
- HTML sanitization with DOMPurify (backend + frontend)
- EXIF metadata stripped from images (prevents location leaks)
- Prepared SQL statements (prevents SQL injection)
- CORS restricted to localhost
- Helmet.js security headers
- URL validation for scraping (whitelist: janitorai.com only)

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

---

## API Reference

### Characters
- `GET /api/characters` - List all characters
- `GET /api/characters/:id` - Get single character
- `POST /api/characters` - Create character
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

### Import
- `POST /api/import/janitorai` - Import from JanitorAI URL

### Groups
- `GET /api/groups` - List groups
- `POST /api/groups` - Create group

### Universes
- `GET /api/universes` - List universes
- `POST /api/universes` - Create universe

See [API_DOCS.md](./docs/API_DOCS.md) for full API documentation.

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
> SELECT * FROM characters;
```

---

## Roadmap

### Phase 1: MVP (Current)
- [x] Project setup with security best practices
- [x] Database schema and initialization
- [ ] JanitorAI URL import
- [ ] Character CRUD operations
- [ ] Basic UI with character grid
- [ ] Search and filters

### Phase 2: Enhanced Features
- [ ] Relationship graph visualization (D3.js)
- [ ] Drag-and-drop organization
- [ ] Bulk import from JSON
- [ ] Export entire library
- [ ] Advanced search (full-text)
- [ ] Collections/playlists

### Phase 3: AI Integration
- [ ] Claude API integration for character generation
- [ ] JLLM API support
- [ ] Chat with characters locally
- [ ] Character personality analysis

### Phase 4: Deployment
- [ ] Electron desktop app
- [ ] Docker container
- [ ] Multi-user support (optional)

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

**Security**: Report vulnerabilities via email to security@botwaffle.io (do NOT create public issues).

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design decisions
- [SECURITY.md](./SECURITY.md) - Security guidelines and best practices
- [DATABASE.md](./DATABASE.md) - Database schema and queries
- [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) - Detailed setup instructions
- [API_DOCS.md](./docs/API_DOCS.md) - API reference

---

## Troubleshooting

**Port 3000 already in use?**
```bash
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

**Database locked?**
```bash
rm db.sqlite
cd backend && npm run init-db
```

**Puppeteer fails?**
```bash
# Ubuntu/Debian
sudo apt-get install -y libnss3 libxss1 libasound2 libatk-bridge2.0-0
```

See [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md#common-issues--troubleshooting) for more solutions.

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Acknowledgments

- Inspired by [ComfyUI LoRA Manager](https://github.com/ltdrdata/ComfyUI-Manager) design
- Built for the JanitorAI roleplay community
- Part of the **Botwaffle** suite of character management tools

---

## Contact

- **Website**: https://botwaffle.io
- **GitHub**: https://github.com/Fablestarexpanse/botwaffle-character-nexus
- **Issues**: https://github.com/Fablestarexpanse/botwaffle-character-nexus/issues
- **Security**: security@botwaffle.io

---

**Made with ❤️ for the roleplay community**

*Privacy-first. Local-only. Open source.*
