-- Botwaffle Character Nexus - Database Schema
-- SQLite3 Schema for local character management
-- Version: 1.0.0
-- Last Updated: 2025-11-16

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Characters Table
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  chat_name TEXT,
  universe TEXT NOT NULL,
  image TEXT,

  -- JanitorAI Imported Fields
  bio TEXT,
  personality TEXT,
  scenario TEXT,
  intro_message TEXT,
  example_dialogues TEXT,
  tags TEXT,
  content_rating TEXT CHECK(content_rating IN ('sfw', 'nsfw')),

  -- User Metadata
  notes TEXT,
  relationships TEXT,
  custom_tags TEXT,

  -- System Fields
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT,
  last_synced_from TEXT
);

-- Groups Table
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  universe TEXT NOT NULL,
  description TEXT,
  characters TEXT,
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Universes Table
CREATE TABLE IF NOT EXISTS universes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance

-- Characters indexes
CREATE INDEX IF NOT EXISTS idx_characters_universe ON characters(universe);
CREATE INDEX IF NOT EXISTS idx_characters_created ON characters(created DESC);
CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_characters_content_rating ON characters(content_rating);
CREATE INDEX IF NOT EXISTS idx_characters_modified ON characters(modified DESC);

-- Groups indexes
CREATE INDEX IF NOT EXISTS idx_groups_universe ON groups(universe);
CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_groups_created ON groups(created DESC);

-- Universes indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_universes_name ON universes(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_universes_created ON universes(created DESC);

-- Triggers for automatic modified timestamp updates

-- Characters modified trigger
CREATE TRIGGER IF NOT EXISTS update_characters_modified
AFTER UPDATE ON characters
FOR EACH ROW
BEGIN
  UPDATE characters
  SET modified = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- Groups modified trigger
CREATE TRIGGER IF NOT EXISTS update_groups_modified
AFTER UPDATE ON groups
FOR EACH ROW
BEGIN
  UPDATE groups
  SET modified = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- Universes modified trigger
CREATE TRIGGER IF NOT EXISTS update_universes_modified
AFTER UPDATE ON universes
FOR EACH ROW
BEGIN
  UPDATE universes
  SET modified = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- Initial Data (Optional)
-- Uncomment to add sample data

-- INSERT OR IGNORE INTO universes (id, name, description) VALUES
--   ('universe-1', 'Original Characters', 'User-created original characters'),
--   ('universe-2', 'Uncategorized', 'Characters without a specific universe');

-- Schema Version Table (for future migrations)
CREATE TABLE IF NOT EXISTS schema_version (
  version TEXT PRIMARY KEY,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO schema_version (version) VALUES ('1.0.0');
