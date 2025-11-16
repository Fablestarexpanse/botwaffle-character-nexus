import express from 'express';
import * as importController from '../controllers/importController.js';
import { validateBody, importUrlSchema } from '../middleware/validation.js';

const router = express.Router();

/**
 * Import Routes
 * All routes are prefixed with /api/import
 */

// POST /api/import/janitorai - Import from JanitorAI URL
router.post('/janitorai', validateBody(importUrlSchema), importController.importFromJanitorAI);

// POST /api/import/json - Bulk import from JSON
router.post('/json', importController.importFromJSON);

export default router;
