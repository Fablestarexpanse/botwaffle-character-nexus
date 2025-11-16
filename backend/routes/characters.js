import express from 'express';
import * as characterController from '../controllers/characterController.js';
import { validateBody } from '../middleware/validation.js';
import { characterSchema } from '../middleware/validation.js';

const router = express.Router();

/**
 * Character Routes
 * All routes are prefixed with /api/characters
 */

// GET /api/characters - Get all characters
router.get('/', characterController.getCharacters);

// GET /api/characters/:id - Get single character
router.get('/:id', characterController.getCharacter);

// POST /api/characters - Create new character
router.post('/', validateBody(characterSchema), characterController.createCharacter);

// PUT /api/characters/:id - Update character
router.put('/:id', validateBody(characterSchema), characterController.updateCharacter);

// DELETE /api/characters/:id - Delete character
router.delete('/:id', characterController.deleteCharacter);

export default router;
