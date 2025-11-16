import { all, get, run } from '../config/database.js';
import { generateUUID, sanitizeHtml, safeJsonStringify, safeJsonParse } from '../utils/helpers.js';
import { NotFoundError, DatabaseError } from '../middleware/errorHandler.js';
import { logInfo, logError } from '../utils/logger.js';

/**
 * Character Service
 * Handles all database operations for characters
 */

/**
 * Get all characters with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of characters
 */
export const getAllCharacters = async (filters = {}) => {
  try {
    let query = 'SELECT * FROM characters WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.universe) {
      query += ' AND universe = ?';
      params.push(filters.universe);
    }

    if (filters.contentRating) {
      query += ' AND content_rating = ?';
      params.push(filters.contentRating);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR bio LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Sorting
    const sortBy = filters.sortBy || 'created';
    const sortOrder = filters.sortOrder || 'DESC';
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Pagination
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit, 10));
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(filters.offset, 10));
    }

    const characters = await all(query, params);

    // Parse JSON fields
    return characters.map(parseCharacterJson);
  } catch (error) {
    logError('Error getting all characters', { error: error.message });
    throw new DatabaseError('Failed to fetch characters');
  }
};

/**
 * Get character by ID
 * @param {string} id - Character ID
 * @returns {Promise<Object>} Character object
 */
export const getCharacterById = async (id) => {
  try {
    const character = await get('SELECT * FROM characters WHERE id = ?', [id]);

    if (!character) {
      throw new NotFoundError(`Character with ID ${id} not found`);
    }

    return parseCharacterJson(character);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logError('Error getting character by ID', { id, error: error.message });
    throw new DatabaseError('Failed to fetch character');
  }
};

/**
 * Create new character
 * @param {Object} characterData - Character data
 * @returns {Promise<Object>} Created character
 */
export const createCharacter = async (characterData) => {
  try {
    const id = generateUUID();
    const now = new Date().toISOString();

    // Sanitize HTML fields
    const sanitizedData = {
      ...characterData,
      bio: sanitizeHtml(characterData.bio || ''),
      personality: sanitizeHtml(characterData.personality || ''),
      scenario: sanitizeHtml(characterData.scenario || ''),
      introMessage: sanitizeHtml(characterData.introMessage || ''),
    };

    // Convert arrays to JSON strings
    const exampleDialogues = safeJsonStringify(sanitizedData.exampleDialogues || []);
    const tags = safeJsonStringify(sanitizedData.tags || []);
    const customTags = safeJsonStringify(sanitizedData.customTags || []);
    const relationships = safeJsonStringify(sanitizedData.relationships || []);

    const query = `
      INSERT INTO characters (
        id, name, chat_name, universe, image,
        bio, personality, scenario, intro_message,
        example_dialogues, tags, content_rating,
        notes, relationships, custom_tags,
        created, modified, source, last_synced_from
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      sanitizedData.name,
      sanitizedData.chatName || null,
      sanitizedData.universe,
      sanitizedData.image || null,
      sanitizedData.bio || null,
      sanitizedData.personality || null,
      sanitizedData.scenario || null,
      sanitizedData.introMessage || null,
      exampleDialogues,
      tags,
      sanitizedData.contentRating || 'sfw',
      sanitizedData.notes || null,
      relationships,
      customTags,
      now,
      now,
      sanitizedData.source || null,
      sanitizedData.lastSyncedFrom || null,
    ];

    await run(query, params);

    logInfo('Character created', { id, name: sanitizedData.name });

    return await getCharacterById(id);
  } catch (error) {
    logError('Error creating character', { error: error.message });
    throw new DatabaseError('Failed to create character');
  }
};

/**
 * Update character
 * @param {string} id - Character ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated character
 */
export const updateCharacter = async (id, updateData) => {
  try {
    // Check if character exists
    await getCharacterById(id);

    // Sanitize HTML fields
    const sanitizedData = {
      ...updateData,
      bio: updateData.bio ? sanitizeHtml(updateData.bio) : undefined,
      personality: updateData.personality ? sanitizeHtml(updateData.personality) : undefined,
      scenario: updateData.scenario ? sanitizeHtml(updateData.scenario) : undefined,
      introMessage: updateData.introMessage ? sanitizeHtml(updateData.introMessage) : undefined,
    };

    // Build update query dynamically
    const fields = [];
    const params = [];

    Object.keys(sanitizedData).forEach((key) => {
      if (sanitizedData[key] !== undefined) {
        // Convert camelCase to snake_case
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

        // Handle JSON fields
        if (['exampleDialogues', 'tags', 'customTags', 'relationships'].includes(key)) {
          fields.push(`${dbKey} = ?`);
          params.push(safeJsonStringify(sanitizedData[key]));
        } else {
          fields.push(`${dbKey} = ?`);
          params.push(sanitizedData[key]);
        }
      }
    });

    if (fields.length === 0) {
      return await getCharacterById(id);
    }

    params.push(id);

    const query = `UPDATE characters SET ${fields.join(', ')} WHERE id = ?`;
    await run(query, params);

    logInfo('Character updated', { id });

    return await getCharacterById(id);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logError('Error updating character', { id, error: error.message });
    throw new DatabaseError('Failed to update character');
  }
};

/**
 * Delete character
 * @param {string} id - Character ID
 * @returns {Promise<void>}
 */
export const deleteCharacter = async (id) => {
  try {
    // Check if character exists
    const character = await getCharacterById(id);

    await run('DELETE FROM characters WHERE id = ?', [id]);

    logInfo('Character deleted', { id, name: character.name });

    // TODO: Delete associated image file if exists
    // This will be implemented in imageService

    return { success: true, deletedCharacter: character };
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logError('Error deleting character', { id, error: error.message });
    throw new DatabaseError('Failed to delete character');
  }
};

/**
 * Get character count
 * @param {Object} filters - Filter options
 * @returns {Promise<number>} Total count
 */
export const getCharacterCount = async (filters = {}) => {
  try {
    let query = 'SELECT COUNT(*) as count FROM characters WHERE 1=1';
    const params = [];

    if (filters.universe) {
      query += ' AND universe = ?';
      params.push(filters.universe);
    }

    if (filters.contentRating) {
      query += ' AND content_rating = ?';
      params.push(filters.contentRating);
    }

    const result = await get(query, params);
    return result.count;
  } catch (error) {
    logError('Error getting character count', { error: error.message });
    throw new DatabaseError('Failed to get character count');
  }
};

/**
 * Helper: Parse JSON fields in character object
 * @param {Object} character - Raw character from database
 * @returns {Object} Character with parsed JSON fields
 */
const parseCharacterJson = (character) => {
  return {
    ...character,
    exampleDialogues: safeJsonParse(character.example_dialogues, []),
    tags: safeJsonParse(character.tags, []),
    customTags: safeJsonParse(character.custom_tags, []),
    relationships: safeJsonParse(character.relationships, []),
    // Convert snake_case to camelCase for frontend
    chatName: character.chat_name,
    introMessage: character.intro_message,
    contentRating: character.content_rating,
    lastSyncedFrom: character.last_synced_from,
    // Remove snake_case versions
    example_dialogues: undefined,
    chat_name: undefined,
    intro_message: undefined,
    content_rating: undefined,
    custom_tags: undefined,
    last_synced_from: undefined,
  };
};

export default {
  getAllCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getCharacterCount,
};
