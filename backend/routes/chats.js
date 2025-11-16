import express from 'express';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

/**
 * Chat Routes
 * All routes are prefixed with /api/chats
 */

// GET /api/chats - Get all conversations
router.get('/', chatController.getConversations);

// GET /api/chats/:id - Get single conversation
router.get('/:id', chatController.getConversation);

// GET /api/chats/:id/messages - Get messages for a conversation
router.get('/:id/messages', chatController.getConversationMessages);

// POST /api/chats/import - Import chat from JSON
router.post('/import', chatController.importChat);

// DELETE /api/chats/:id - Delete conversation
router.delete('/:id', chatController.deleteConversation);

// GET /api/chats/:id/export/:format - Export conversation
router.get('/:id/export/:format', chatController.exportConversation);

export default router;
