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
 * Health check
 */
export const healthCheck = async () => {
  return fetchAPI('/health');
};

export default {
  characterAPI,
  healthCheck,
};
