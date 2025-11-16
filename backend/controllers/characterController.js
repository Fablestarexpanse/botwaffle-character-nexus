import * as characterService from '../services/characterService.js';
import { HTTP_STATUS } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validatePagination } from '../utils/validators.js';

/**
 * Character Controller
 * Handles HTTP requests for character operations
 */

/**
 * GET /api/characters
 * Get all characters with optional filters
 */
export const getCharacters = asyncHandler(async (req, res) => {
  const { universe, contentRating, search, limit, offset, sortBy, sortOrder } = req.query;

  // Validate pagination
  const pagination = validatePagination(limit, offset);

  const filters = {
    universe,
    contentRating,
    search,
    limit: pagination.limit,
    offset: pagination.offset,
    sortBy,
    sortOrder,
  };

  const characters = await characterService.getAllCharacters(filters);
  const total = await characterService.getCharacterCount({ universe, contentRating });

  res.status(HTTP_STATUS.OK).json({
    data: characters,
    total,
    limit: pagination.limit,
    offset: pagination.offset,
  });
});

/**
 * GET /api/characters/:id
 * Get single character by ID
 */
export const getCharacter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const character = await characterService.getCharacterById(id);

  res.status(HTTP_STATUS.OK).json({
    data: character,
  });
});

/**
 * POST /api/characters
 * Create new character
 */
export const createCharacter = asyncHandler(async (req, res) => {
  const characterData = req.validatedData;

  const character = await characterService.createCharacter(characterData);

  res.status(HTTP_STATUS.CREATED).json({
    data: character,
    message: 'Character created successfully',
  });
});

/**
 * PUT /api/characters/:id
 * Update character
 */
export const updateCharacter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.validatedData;

  const character = await characterService.updateCharacter(id, updateData);

  res.status(HTTP_STATUS.OK).json({
    data: character,
    message: 'Character updated successfully',
  });
});

/**
 * DELETE /api/characters/:id
 * Delete character
 */
export const deleteCharacter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await characterService.deleteCharacter(id);

  res.status(HTTP_STATUS.OK).json({
    message: 'Character deleted successfully',
  });
});

export default {
  getCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
};
