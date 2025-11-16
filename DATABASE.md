# Database Documentation - Botwaffle Character Nexus

## Overview

Botwaffle Character Nexus uses **SQLite3** as its database engine for local, file-based storage. All data is stored in a single `db.sqlite` file with proper normalization and indexing.

**Database File**: `./db.sqlite` (in project root)
**Permissions**: 0600 (owner read/write only)

---

## Schema Design

### Tables

1. **characters** - Core character data
2. **groups** - Factions, organizations, teams
3. **universes** - Top-level universe/series classification
4. **tags** - Reusable tag system (future enhancement)

---

## Characters Table

### Schema

```sql
CREATE TABLE characters (
  id TEXT PRIMARY KEY,              -- UUID v4
  name TEXT NOT NULL,               -- Character name
  chat_name TEXT,                   -- Optional display name for chats
  universe TEXT NOT NULL,           -- Universe/series name
  image TEXT,                       -- Filename only (UUID.webp)

  -- JanitorAI Imported Fields
  bio TEXT,                         -- Sanitized HTML, max 10000 chars
  personality TEXT,                 -- Sanitized HTML, max 50000 chars
  scenario TEXT,                    -- Sanitized HTML, max 5000 chars
  intro_message TEXT,               -- First message, max 2000 chars
  example_dialogues TEXT,           -- JSON array of dialogue examples
  tags TEXT,                        -- JSON array of tag strings
  content_rating TEXT,              -- 'sfw' or 'nsfw'

  -- User Metadata
  notes TEXT,                       -- User's custom notes
  relationships TEXT,               -- JSON array: [{characterId, type, notes}]
  custom_tags TEXT,                 -- JSON array of user-added tags

  -- System Fields
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT,                      -- Original JanitorAI URL
  last_synced_from TEXT             -- URL for re-import
);
```

### Indexes

```sql
CREATE INDEX idx_characters_universe ON characters(universe);
CREATE INDEX idx_characters_created ON characters(created DESC);
CREATE INDEX idx_characters_name ON characters(name COLLATE NOCASE);
CREATE INDEX idx_characters_content_rating ON characters(content_rating);
```

### Field Details

| Field | Type | Max Length | Required | Description |
|-------|------|------------|----------|-------------|
| `id` | TEXT | 36 | Yes | UUID v4 |
| `name` | TEXT | 255 | Yes | Character's display name |
| `chat_name` | TEXT | 255 | No | Alternative name for conversations |
| `universe` | TEXT | 255 | Yes | Universe/series (e.g., "Star Wars") |
| `image` | TEXT | 255 | No | Filename only (e.g., "abc-123.webp") |
| `bio` | TEXT | 10000 | No | Character biography (HTML) |
| `personality` | TEXT | 50000 | No | Personality description |
| `scenario` | TEXT | 5000 | No | Default scenario/setting |
| `intro_message` | TEXT | 2000 | No | First message to user |
| `example_dialogues` | TEXT | - | No | JSON: `[{user: "...", bot: "..."}]` |
| `tags` | TEXT | - | No | JSON: `["tag1", "tag2"]` (max 50) |
| `content_rating` | TEXT | 4 | No | `"sfw"` or `"nsfw"` |
| `notes` | TEXT | - | No | User's private notes |
| `relationships` | TEXT | - | No | JSON array of relationships |
| `custom_tags` | TEXT | - | No | JSON array of user tags |
| `created` | DATETIME | - | Auto | Creation timestamp |
| `modified` | DATETIME | - | Auto | Last modified timestamp |
| `source` | TEXT | 2083 | No | Original import URL |
| `last_synced_from` | TEXT | 2083 | No | URL for re-import |

### JSON Field Formats

#### example_dialogues
```json
[
  {
    "user": "What's your name?",
    "bot": "I'm Aria, nice to meet you!"
  },
  {
    "user": "What do you like to do?",
    "bot": "I love exploring ancient ruins and uncovering forgotten histories."
  }
]
```

#### relationships
```json
[
  {
    "characterId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "type": "ally",
    "notes": "Best friend since childhood"
  },
  {
    "characterId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "type": "rival",
    "notes": "Competing for the same promotion"
  }
]
```

#### tags / custom_tags
```json
["fantasy", "mage", "fire-magic", "protagonist"]
```

---

## Groups Table

### Schema

```sql
CREATE TABLE groups (
  id TEXT PRIMARY KEY,              -- UUID v4
  name TEXT NOT NULL,               -- Group name (e.g., "Avengers")
  universe TEXT NOT NULL,           -- Parent universe
  description TEXT,                 -- Group description (max 5000)
  characters TEXT,                  -- JSON array of character IDs
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
CREATE INDEX idx_groups_universe ON groups(universe);
CREATE INDEX idx_groups_name ON groups(name COLLATE NOCASE);
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | TEXT | Yes | UUID v4 |
| `name` | TEXT | Yes | Group name (e.g., "The Fellowship") |
| `universe` | TEXT | Yes | Parent universe |
| `description` | TEXT | No | Group description (max 5000 chars) |
| `characters` | TEXT | No | JSON array of character IDs |
| `created` | DATETIME | Auto | Creation timestamp |
| `modified` | DATETIME | Auto | Last modified timestamp |

### JSON Field Format

#### characters
```json
[
  "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "12345678-1234-1234-1234-123456789012"
]
```

---

## Universes Table

### Schema

```sql
CREATE TABLE universes (
  id TEXT PRIMARY KEY,              -- UUID v4
  name TEXT NOT NULL UNIQUE,        -- Universe name
  description TEXT,                 -- Universe description (max 5000)
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
CREATE UNIQUE INDEX idx_universes_name ON universes(name COLLATE NOCASE);
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | TEXT | Yes | UUID v4 |
| `name` | TEXT | Yes | Universe name (unique) |
| `description` | TEXT | No | Universe description (max 5000 chars) |
| `created` | DATETIME | Auto | Creation timestamp |
| `modified` | DATETIME | Auto | Last modified timestamp |

---

## Common Queries

### Characters

#### Get all characters
```sql
SELECT * FROM characters ORDER BY created DESC;
```

#### Get characters by universe
```sql
SELECT * FROM characters WHERE universe = ? ORDER BY name;
```

#### Search characters by name
```sql
SELECT * FROM characters
WHERE name LIKE ?
ORDER BY name
LIMIT 50;
```

#### Get character with relationships
```sql
SELECT c.*, GROUP_CONCAT(r.name) as related_names
FROM characters c
LEFT JOIN characters r ON json_extract(c.relationships, '$[*].characterId') LIKE '%' || r.id || '%'
WHERE c.id = ?
GROUP BY c.id;
```

#### Filter by content rating
```sql
SELECT * FROM characters
WHERE content_rating = 'sfw'
ORDER BY created DESC;
```

#### Filter by tags
```sql
SELECT * FROM characters
WHERE json_extract(tags, '$') LIKE '%"fantasy"%'
ORDER BY created DESC;
```

### Groups

#### Get all groups
```sql
SELECT * FROM groups ORDER BY universe, name;
```

#### Get groups by universe
```sql
SELECT * FROM groups WHERE universe = ? ORDER BY name;
```

#### Get group with character details
```sql
SELECT g.*, c.name as character_name
FROM groups g
JOIN characters c ON json_extract(g.characters, '$') LIKE '%' || c.id || '%'
WHERE g.id = ?;
```

### Universes

#### Get all universes
```sql
SELECT * FROM universes ORDER BY name;
```

#### Get universe with character count
```sql
SELECT u.*, COUNT(c.id) as character_count
FROM universes u
LEFT JOIN characters c ON c.universe = u.name
GROUP BY u.id
ORDER BY u.name;
```

---

## Database Initialization

### Initial Setup Script

```javascript
// backend/scripts/initDb.js
import sqlite3 from 'sqlite3';
import fs from 'fs';

const dbPath = './db.sqlite';

// Create database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  }
  console.log('Database created successfully');
});

// Read and execute schema
const schema = fs.readFileSync('./backend/db/schema.sql', 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('Error creating schema:', err);
    process.exit(1);
  }
  console.log('Schema created successfully');

  // Set database file permissions
  fs.chmodSync(dbPath, 0o600);
  console.log('Database permissions set to 0600');

  db.close();
});
```

### Run Initialization

```bash
cd backend
npm run init-db
```

---

## Migrations Strategy

### Future Migration System

For schema changes, create migration files in `backend/db/migrations/`:

```
backend/db/migrations/
  001_initial_schema.sql
  002_add_tags_table.sql
  003_add_character_favorites.sql
```

### Migration File Format

```sql
-- Migration: 002_add_tags_table.sql
-- Description: Add standalone tags table for better performance
-- Date: 2025-11-20

-- Up Migration
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_name ON tags(name COLLATE NOCASE);

-- Down Migration (rollback)
-- DROP TABLE tags;
```

---

## Backup and Restore

### Manual Backup

```bash
# Backup database
cp db.sqlite db.sqlite.backup.$(date +%Y%m%d_%H%M%S)

# Restore database
cp db.sqlite.backup.20251116_120000 db.sqlite
```

### Automated Backup (Future Feature)

```javascript
// backend/utils/backup.js
import fs from 'fs';
import path from 'path';

export const backupDatabase = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join('./backups', `db_${timestamp}.sqlite`);

  fs.copyFileSync('./db.sqlite', backupPath);
  console.log(`Database backed up to ${backupPath}`);
};
```

---

## Performance Optimization

### Recommended Indexes

```sql
-- Already included in schema.sql
CREATE INDEX idx_characters_universe ON characters(universe);
CREATE INDEX idx_characters_created ON characters(created DESC);
CREATE INDEX idx_characters_name ON characters(name COLLATE NOCASE);
CREATE INDEX idx_groups_universe ON groups(universe);
CREATE UNIQUE INDEX idx_universes_name ON universes(name COLLATE NOCASE);
```

### Query Optimization Tips

1. **Use prepared statements** - Prevents SQL injection and improves performance
2. **Limit results** - Use `LIMIT` for pagination
3. **Index foreign keys** - Universe, group IDs should be indexed
4. **Avoid SELECT *** - Specify only needed columns
5. **Use EXPLAIN QUERY PLAN** - Analyze slow queries

```sql
EXPLAIN QUERY PLAN
SELECT * FROM characters WHERE universe = 'Star Wars';
```

---

## Database Maintenance

### VACUUM (Reclaim space)

```sql
VACUUM;
```

**When to run**: After deleting many records

### ANALYZE (Update statistics)

```sql
ANALYZE;
```

**When to run**: After bulk inserts/updates

### Integrity Check

```sql
PRAGMA integrity_check;
```

---

## Future Enhancements

### Full-Text Search

```sql
-- Add FTS5 virtual table for fast text search
CREATE VIRTUAL TABLE characters_fts USING fts5(
  name,
  bio,
  personality,
  tags,
  content=characters,
  content_rowid=id
);

-- Example search query
SELECT * FROM characters_fts WHERE characters_fts MATCH 'wizard OR mage';
```

### Standalone Tags Table

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,  -- e.g., 'genre', 'trait', 'setting'
  created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE character_tags (
  character_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (character_id, tag_id),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

---

## Security Considerations

1. **File Permissions**: Database file set to 0600 (owner only)
2. **Prepared Statements**: Always use parameterized queries
3. **Input Validation**: Validate before database insertion
4. **Backup Encryption**: Encrypt backups if containing sensitive data
5. **No Credentials**: SQLite doesn't use passwords (file-based security)

---

**Last Updated**: 2025-11-16
**Version**: 0.1.0
**Schema Version**: 1.0.0
