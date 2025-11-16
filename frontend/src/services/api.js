/**
 * API Service
 * Handles all HTTP requests to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Character API
 */

export const characterAPI = {
  /**
   * Get all characters
   * @param {Object} filters - Filter options
   * @returns {Promise} Characters data
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.universe) params.append('universe', filters.universe);
    if (filters.contentRating) params.append('contentRating', filters.contentRating);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = `/characters${queryString ? `?${queryString}` : ''}`;

    return fetchAPI(endpoint);
  },

  /**
   * Get single character by ID
   * @param {string} id - Character ID
   * @returns {Promise} Character data
   */
  getById: async (id) => {
    return fetchAPI(`/characters/${id}`);
  },

  /**
   * Create new character
   * @param {Object} characterData - Character data
   * @returns {Promise} Created character
   */
  create: async (characterData) => {
    return fetchAPI('/characters', {
      method: 'POST',
      body: JSON.stringify(characterData),
    });
  },

  /**
   * Update character
   * @param {string} id - Character ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} Updated character
   */
  update: async (id, updateData) => {
    return fetchAPI(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete character
   * @param {string} id - Character ID
   * @returns {Promise} Delete response
   */
  delete: async (id) => {
    return fetchAPI(`/characters/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Import API
 */
export const importAPI = {
  /**
   * Import character from JanitorAI URL
   * @param {string} url - JanitorAI character URL
   * @returns {Promise} Import result
   */
  fromJanitorAI: async (url) => {
    return fetchAPI('/import/janitorai', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  /**
   * Bulk import from JSON
   * @param {Array} characters - Array of character objects
   * @returns {Promise} Import results
   */
  fromJSON: async (characters) => {
    return fetchAPI('/import/json', {
      method: 'POST',
      body: JSON.stringify({ characters }),
    });
  },
};

/**
 * Chat API
 */
export const chatAPI = {
  /**
   * Get all conversations
   * @param {Object} filters - Filter options
   * @returns {Promise} Conversations data
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.characterId) params.append('characterId', filters.characterId);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = `/chats${queryString ? `?${queryString}` : ''}`;

    return fetchAPI(endpoint);
  },

  /**
   * Get single conversation by ID
   * @param {string} id - Conversation ID
   * @returns {Promise} Conversation data
   */
  getById: async (id) => {
    return fetchAPI(`/chats/${id}`);
  },

  /**
   * Get messages for a conversation
   * @param {string} id - Conversation ID
   * @returns {Promise} Messages array
   */
  getMessages: async (id) => {
    return fetchAPI(`/chats/${id}/messages`);
  },

  /**
   * Import chat from JSON
   * @param {Object} chatData - Chat data from JanitorAI Chat Downloader
   * @param {string} characterId - Optional character ID to link
   * @returns {Promise} Import result
   */
  import: async (chatData, characterId = null) => {
    return fetchAPI('/chats/import', {
      method: 'POST',
      body: JSON.stringify({ chatData, characterId }),
    });
  },

  /**
   * Delete conversation
   * @param {string} id - Conversation ID
   * @returns {Promise} Delete response
   */
  delete: async (id) => {
    return fetchAPI(`/chats/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Export conversation
   * @param {string} id - Conversation ID
   * @param {string} format - Export format (json, txt, markdown, jsonl)
   * @returns {Promise} Exported file (blob download)
   */
  export: async (id, format = 'json') => {
    const response = await fetch(`${API_URL}/chats/${id}/export/${format}`);

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get filename from Content-Disposition header
    const disposition = response.headers.get('Content-Disposition');
    const filename = disposition
      ? disposition.split('filename=')[1].replace(/"/g, '')
      : `chat-${id}.${format}`;

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true, filename };
  },
};

/**
 * Health check
 */
export const healthCheck = async () => {
  return fetchAPI('/health');
};

export default {
  characterAPI,
  importAPI,
  chatAPI,
  healthCheck,
};
