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

-- Conversations Table
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

-- Messages Table
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

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_character ON conversations(character_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_modified ON conversations(modified DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(conversation_id, order_index);

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

-- Conversations modified trigger
CREATE TRIGGER IF NOT EXISTS update_conversations_modified
AFTER UPDATE ON conversations
FOR EACH ROW
BEGIN
  UPDATE conversations
  SET modified = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- Update conversation message count and modified time when messages are added
CREATE TRIGGER IF NOT EXISTS update_conversation_on_message_insert
AFTER INSERT ON messages
FOR EACH ROW
BEGIN
  UPDATE conversations
  SET message_count = message_count + 1,
      modified = CURRENT_TIMESTAMP
  WHERE id = NEW.conversation_id;
END;

-- Update conversation message count when messages are deleted
CREATE TRIGGER IF NOT EXISTS update_conversation_on_message_delete
AFTER DELETE ON messages
FOR EACH ROW
BEGIN
  UPDATE conversations
  SET message_count = message_count - 1,
      modified = CURRENT_TIMESTAMP
  WHERE id = OLD.conversation_id;
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

INSERT OR REPLACE INTO schema_version (version) VALUES ('1.1.0');
