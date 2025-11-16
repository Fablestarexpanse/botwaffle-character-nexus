# Setup Guide - Botwaffle Character Nexus

## Prerequisites

Before starting, ensure you have:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**: For version control
- **Text Editor**: VS Code recommended

Check your versions:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
git --version
```

---

## Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/Fablestarexpanse/botwaffle-character-nexus.git
cd botwaffle-character-nexus

# 2. Install dependencies (root, backend, frontend)
npm install
npm install --prefix backend
npm install --prefix frontend

# 3. Create .env file (copy from example)
cp .env.example .env

# 4. Initialize database
cd backend
npm run init-db
cd ..

# 5. Run the application
npm run dev

# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

That's it! You should now have both servers running.

---

## Detailed Setup Instructions

### Step 1: Clone Repository

```bash
git clone https://github.com/Fablestarexpanse/botwaffle-character-nexus.git
cd botwaffle-character-nexus
```

### Step 2: Install Root Dependencies

```bash
npm install
```

This installs:
- `concurrently` - Run both servers simultaneously
- `eslint` - Code linting
- `prettier` - Code formatting

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web framework
- `sqlite3` - Database
- `puppeteer` - Web scraping
- `sharp` - Image processing
- `joi` - Validation
- `helmet` - Security headers
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- And more...

### Step 4: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This installs:
- `react` + `react-dom` - UI framework
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `axios` - HTTP client
- `dompurify` - HTML sanitization
- `lucide-react` - Icons
- And more...

### Step 5: Create Environment File

```bash
cd ..  # Back to root
cp .env.example .env
```

Edit `.env` and add your API keys (optional for now):

```bash
# .env
NODE_ENV=development
SERVER_PORT=3000
DATABASE_PATH=./db.sqlite

# Optional: Add API keys later for AI generation features
# CLAUDE_API_KEY=sk-ant-your-key-here
# JLLM_API_KEY=your-key-here
```

**IMPORTANT**: Never commit `.env` to git! It's already in `.gitignore`.

### Step 6: Initialize Database

```bash
cd backend
npm run init-db
```

This creates:
- `db.sqlite` file in the project root
- Tables: characters, groups, universes
- Indexes for performance

You should see:
```
Database created successfully
Schema created successfully
Database permissions set to 0600
```

### Step 7: Verify Directory Structure

```bash
cd ..
ls -la
```

You should see:
```
.env                 # Your environment file
.env.example         # Template (committed to git)
.gitignore           # Git ignore rules
backend/             # Backend code
frontend/            # Frontend code
db.sqlite            # Database file (created by init-db)
characters/images/   # Image storage (empty for now)
package.json         # Root dependencies
```

### Step 8: Run Development Servers

**Option A: Run both servers together (recommended)**

```bash
npm run dev
```

**Option B: Run servers separately**

Terminal 1 (Backend):
```bash
npm run backend
# or: cd backend && npm run dev
```

Terminal 2 (Frontend):
```bash
npm run frontend
# or: cd frontend && npm run dev
```

### Step 9: Verify Everything Works

1. **Backend**: Open [http://localhost:3000/api/characters](http://localhost:3000/api/characters)
   - You should see: `{"data": [], "total": 0}`

2. **Frontend**: Open [http://localhost:5173](http://localhost:5173)
   - You should see the main application interface

---

## Development Workflow

### File Watching

Both servers support hot reload:
- **Backend**: Nodemon watches for file changes
- **Frontend**: Vite HMR (Hot Module Replacement)

Edit files and see changes instantly without restarting!

### Running Linter

```bash
npm run lint         # Lint all files
npm run lint --fix   # Auto-fix issues
```

### Running Formatter

```bash
npm run format       # Format all files with Prettier
```

### Creating a New Character (Manual Test)

```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Character",
    "universe": "Test Universe",
    "bio": "A test character for development",
    "contentRating": "sfw"
  }'
```

---

## Project Structure Overview

```
botwaffle-character-nexus/
├── backend/
│   ├── server.js              # Main entry point
│   ├── config/                # Environment, database config
│   ├── routes/                # API route definitions
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── middleware/            # Express middleware
│   └── db/
│       └── schema.sql         # Database schema
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── components/        # Reusable UI components
│   │   ├── services/          # API client
│   │   └── styles/            # CSS/Tailwind
│   ├── index.html             # HTML entry point
│   └── vite.config.js         # Vite configuration
│
├── characters/images/         # Uploaded character images
├── db.sqlite                  # SQLite database
└── package.json               # Root dependencies
```

---

## Common Issues & Troubleshooting

### Issue: "Port 3000 already in use"

**Solution**: Kill the process using port 3000
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change the port in `.env`:
```
SERVER_PORT=3001
```

### Issue: "Cannot find module 'sqlite3'"

**Solution**: Rebuild native modules
```bash
cd backend
npm rebuild sqlite3
```

### Issue: "Puppeteer fails to launch"

**Solution**: Install Chromium dependencies

**Ubuntu/Debian**:
```bash
sudo apt-get install -y \
  libnss3 libxss1 libasound2 libatk-bridge2.0-0 \
  libgtk-3-0 libgbm1
```

**macOS**: Puppeteer should work out of the box

**Windows**: Install Visual C++ Redistributable

### Issue: "Database locked"

**Solution**: Close all database connections
```bash
# Stop all servers
# Delete db.sqlite
rm db.sqlite

# Recreate database
cd backend
npm run init-db
```

### Issue: "CORS error in frontend"

**Solution**: Verify CORS configuration in `backend/server.js`
```javascript
const corsOptions = {
  origin: 'http://localhost:5173',  // Must match frontend port
  credentials: true,
};
```

### Issue: "Images not loading"

**Solution**:
1. Check `/characters/images/` exists
2. Verify image filename format (UUID.webp)
3. Check backend serves files from `/api/images/:filename`

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | development | Environment mode |
| `SERVER_PORT` | No | 3000 | Backend server port |
| `DATABASE_PATH` | No | ./db.sqlite | SQLite file path |
| `CLAUDE_API_KEY` | No | - | Claude API key (future) |
| `JLLM_API_KEY` | No | - | JLLM API key (future) |
| `ALLOWED_ORIGIN` | No | http://localhost:5173 | CORS origin |
| `MAX_IMAGE_SIZE` | No | 5242880 | Max image size (5MB) |

---

## Database Management

### View Database Contents

**Option 1: SQLite CLI**
```bash
sqlite3 db.sqlite
# Inside SQLite CLI:
.tables                          # List tables
SELECT * FROM characters;        # View characters
SELECT * FROM universes;         # View universes
.exit
```

**Option 2: DB Browser for SQLite** (GUI)
- Download from https://sqlitebrowser.org/
- Open `db.sqlite` file

### Reset Database

```bash
rm db.sqlite
cd backend
npm run init-db
```

### Backup Database

```bash
cp db.sqlite db.sqlite.backup.$(date +%Y%m%d)
```

---

## Git Workflow

### Before Your First Commit

**CRITICAL**: Verify no sensitive files committed
```bash
# Check git status
git status

# Verify .env is NOT listed (should be ignored)
# If .env appears, it's NOT being ignored! Fix .gitignore

# Check git history for .env (should return nothing)
git log --all --full-history -- .env
```

### Creating a Branch

```bash
git checkout -b feature/your-feature-name
```

### Committing Changes

```bash
git add .
git commit -m "Add feature: description"
git push origin feature/your-feature-name
```

---

## Testing

### Manual Testing Checklist

1. **Backend API**
   - [ ] GET /api/characters returns empty array
   - [ ] POST /api/characters creates character
   - [ ] GET /api/characters/:id returns character
   - [ ] PUT /api/characters/:id updates character
   - [ ] DELETE /api/characters/:id deletes character

2. **Frontend**
   - [ ] Page loads without errors
   - [ ] Character grid displays
   - [ ] Import modal opens
   - [ ] Create character modal opens

3. **Integration**
   - [ ] Frontend calls backend successfully
   - [ ] Images load correctly
   - [ ] CORS works (no console errors)

### Running Tests (Future)

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

This creates `frontend/dist/` with optimized static files.

### Serve Production Build

```bash
# Serve frontend build from backend
cd backend
npm run start

# Backend serves frontend at http://localhost:3000
```

---

## Next Steps

After setup:

1. **Read Documentation**
   - [ARCHITECTURE.md](../ARCHITECTURE.md) - System design
   - [SECURITY.md](../SECURITY.md) - Security guidelines
   - [DATABASE.md](../DATABASE.md) - Database schema
   - [API_DOCS.md](./API_DOCS.md) - API reference

2. **Try Importing a Character**
   - Get a JanitorAI character URL
   - Use Import feature in frontend
   - Verify character appears in grid

3. **Customize**
   - Modify Tailwind theme (colors, fonts)
   - Add new API endpoints
   - Create custom components

4. **Contribute**
   - Check GitHub issues
   - Submit pull requests
   - Report bugs

---

## Getting Help

- **Documentation**: See `/docs` folder
- **Issues**: https://github.com/Fablestarexpanse/botwaffle-character-nexus/issues
- **Security Issues**: Email security@botwaffle.io (do NOT create public issues)

---

## License

MIT License - See [LICENSE](../LICENSE) file for details.

---

**Last Updated**: 2025-11-16
**Version**: 0.1.0

**Happy coding!** 🎉
