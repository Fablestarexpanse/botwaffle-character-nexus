import { all, get, run } from '../config/database.js';
import { generateUUID, sanitizeHtml, safeJsonStringify, safeJsonParse } from '../utils/helpers.js';
import { NotFoundError, DatabaseError } from '../middleware/errorHandler.js';
import { logInfo, logError } from '../utils/logger.js';

/**
 * Chat Service
 * Handles all database operations for conversations and messages
 */

/**
 * Parse JSON fields in conversation
 * @param {Object} conversation - Raw conversation from DB
 * @returns {Object} Parsed conversation
 */
const parseConversationJson = (conversation) => {
  if (!conversation) return conversation;
  return {
    ...conversation,
    metadata: safeJsonParse(conversation.metadata),
  };
};

/**
 * Parse JSON fields in message
 * @param {Object} message - Raw message from DB
 * @returns {Object} Parsed message
 */
const parseMessageJson = (message) => {
  if (!message) return message;
  return {
    ...message,
    metadata: safeJsonParse(message.metadata),
  };
};

/**
 * Get all conversations with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of conversations
 */
export const getAllConversations = async (filters = {}) => {
  try {
    let query = 'SELECT * FROM conversations WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.characterId) {
      query += ' AND character_id = ?';
      params.push(filters.characterId);
    }

    // Sorting
    const sortBy = filters.sortBy || 'modified';
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

    const conversations = await all(query, params);

    // Parse JSON fields
    return conversations.map(parseConversationJson);
  } catch (error) {
    logError('Error getting all conversations', { error: error.message });
    throw new DatabaseError('Failed to fetch conversations');
  }
};

/**
 * Get conversation by ID
 * @param {string} id - Conversation ID
 * @returns {Promise<Object>} Conversation object
 */
export const getConversationById = async (id) => {
  try {
    const conversation = await get('SELECT * FROM conversations WHERE id = ?', [id]);

    if (!conversation) {
      throw new NotFoundError(`Conversation with ID ${id} not found`);
    }

    return parseConversationJson(conversation);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logError('Error getting conversation by ID', { id, error: error.message });
    throw new DatabaseError('Failed to fetch conversation');
  }
};

/**
 * Create new conversation
 * @param {Object} conversationData - Conversation data
 * @returns {Promise<Object>} Created conversation
 */
export const createConversation = async (conversationData) => {
  try {
    const id = generateUUID();
    const now = new Date().toISOString();

    const query = `
      INSERT INTO conversations (
        id, character_id, title, persona_name, message_count, source_url, metadata, created, modified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      conversationData.characterId || null,
      conversationData.title || 'New Conversation',
      conversationData.personaName || null,
      0, // message_count starts at 0
      conversationData.sourceUrl || null,
      safeJsonStringify(conversationData.metadata || {}),
      now,
      now,
    ];

    await run(query, params);

    logInfo('Conversation created', { id, title: conversationData.title });

    return getConversationById(id);
  } catch (error) {
    logError('Error creating conversation', { error: error.message });
    throw new DatabaseError('Failed to create conversation');
  }
};

/**
 * Delete conversation (will cascade delete messages)
 * @param {string} id - Conversation ID
 * @returns {Promise<void>}
 */
export const deleteConversation = async (id) => {
  try {
    // Check if conversation exists
    await getConversationById(id);

    await run('DELETE FROM conversations WHERE id = ?', [id]);

    logInfo('Conversation deleted', { id });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logError('Error deleting conversation', { id, error: error.message });
    throw new DatabaseError('Failed to delete conversation');
  }
};

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} Array of messages ordered by order_index
 */
export const getMessages = async (conversationId) => {
  try {
    // Verify conversation exists
    await getConversationById(conversationId);

    const messages = await all(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY order_index ASC',
      [conversationId]
    );

    return messages.map(parseMessageJson);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logError('Error getting messages', { conversationId, error: error.message });
    throw new DatabaseError('Failed to fetch messages');
  }
};

/**
 * Create multiple messages (bulk insert for imports)
 * @param {string} conversationId - Conversation ID
 * @param {Array} messages - Array of message objects
 * @returns {Promise<Array>} Created messages
 */
export const createMessages = async (conversationId, messages) => {
  try {
    // Verify conversation exists
    await getConversationById(conversationId);

    if (!messages || messages.length === 0) {
      return [];
    }

    // Prepare bulk insert
    const insertQuery = `
      INSERT INTO messages (id, conversation_id, role, content, timestamp, order_index, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Insert each message
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const id = generateUUID();

      const params = [
        id,
        conversationId,
        message.role || 'user',
        sanitizeHtml(message.content || ''),
        message.timestamp || new Date().toISOString(),
        i, // order_index
        safeJsonStringify(message.metadata || {}),
      ];

      await run(insertQuery, params);
    }

    logInfo('Messages created', { conversationId, count: messages.length });

    // Return all messages for this conversation
    return getMessages(conversationId);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logError('Error creating messages', { conversationId, error: error.message });
    throw new DatabaseError('Failed to create messages');
  }
};

/**
 * Import chat from JanitorAI Chat Downloader JSON format
 * @param {Object} chatData - Chat JSON data
 * @param {string} characterId - Optional character ID to link
 * @returns {Promise<Object>} Created conversation with messages
 */
export const importChat = async (chatData, characterId = null) => {
  try {
    // Extract conversation metadata
    const title = chatData.title || chatData.characterName || 'Imported Chat';
    const personaName = chatData.personaName || chatData.userName || null;
    const sourceUrl = chatData.sourceUrl || null;

    // Create conversation
    const conversation = await createConversation({
      characterId,
      title,
      personaName,
      sourceUrl,
      metadata: {
        importedAt: new Date().toISOString(),
        originalData: chatData.metadata || {},
      },
    });

    // Parse and create messages
    const messages = (chatData.messages || []).map((msg, index) => ({
      role: msg.role || (msg.isUser ? 'user' : 'assistant'),
      content: msg.content || msg.text || '',
      timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
      metadata: msg.metadata || {},
    }));

    await createMessages(conversation.id, messages);

    logInfo('Chat imported successfully', {
      conversationId: conversation.id,
      messageCount: messages.length,
    });

    // Return conversation with messages
    const updatedConversation = await getConversationById(conversation.id);
    const conversationMessages = await getMessages(conversation.id);

    return {
      ...updatedConversation,
      messages: conversationMessages,
    };
  } catch (error) {
    logError('Error importing chat', { error: error.message });
    throw new DatabaseError('Failed to import chat');
  }
};

export default {
  getAllConversations,
  getConversationById,
  createConversation,
  deleteConversation,
  getMessages,
  createMessages,
  importChat,
};
