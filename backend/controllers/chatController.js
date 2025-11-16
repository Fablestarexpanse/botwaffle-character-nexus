import * as chatService from '../services/chatService.js';
import { HTTP_STATUS } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validatePagination } from '../utils/validators.js';

/**
 * Chat Controller
 * Handles HTTP requests for chat/conversation operations
 */

/**
 * GET /api/chats
 * Get all conversations with optional filters
 */
export const getConversations = asyncHandler(async (req, res) => {
  const { characterId, limit, offset, sortBy, sortOrder } = req.query;

  // Validate pagination
  const pagination = validatePagination(limit, offset);

  const filters = {
    characterId,
    limit: pagination.limit,
    offset: pagination.offset,
    sortBy,
    sortOrder,
  };

  const conversations = await chatService.getAllConversations(filters);

  res.status(HTTP_STATUS.OK).json({
    data: conversations,
    limit: pagination.limit,
    offset: pagination.offset,
  });
});

/**
 * GET /api/chats/:id
 * Get single conversation by ID
 */
export const getConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conversation = await chatService.getConversationById(id);

  res.status(HTTP_STATUS.OK).json({
    data: conversation,
  });
});

/**
 * GET /api/chats/:id/messages
 * Get messages for a conversation
 */
export const getConversationMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const messages = await chatService.getMessages(id);

  res.status(HTTP_STATUS.OK).json({
    data: messages,
  });
});

/**
 * POST /api/chats/import
 * Import chat from JSON (JanitorAI Chat Downloader format or custom)
 */
export const importChat = asyncHandler(async (req, res) => {
  const { chatData, characterId } = req.body;

  if (!chatData) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Chat data is required',
    });
  }

  const conversation = await chatService.importChat(chatData, characterId);

  res.status(HTTP_STATUS.CREATED).json({
    data: conversation,
    message: 'Chat imported successfully',
  });
});

/**
 * DELETE /api/chats/:id
 * Delete conversation
 */
export const deleteConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await chatService.deleteConversation(id);

  res.status(HTTP_STATUS.OK).json({
    message: 'Conversation deleted successfully',
  });
});

/**
 * GET /api/chats/:id/export/:format
 * Export conversation in various formats
 */
export const exportConversation = asyncHandler(async (req, res) => {
  const { id, format } = req.params;

  // Get conversation and messages
  const conversation = await chatService.getConversationById(id);
  const messages = await chatService.getMessages(id);

  const exportData = {
    ...conversation,
    messages,
  };

  // Format-specific exports
  switch (format.toLowerCase()) {
    case 'json': {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="chat-${id}.json"`
      );
      return res.status(HTTP_STATUS.OK).json(exportData);
    }

    case 'txt': {
      const text = formatAsText(exportData);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="chat-${id}.txt"`
      );
      return res.status(HTTP_STATUS.OK).send(text);
    }

    case 'markdown':
    case 'md': {
      const markdown = formatAsMarkdown(exportData);
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="chat-${id}.md"`
      );
      return res.status(HTTP_STATUS.OK).send(markdown);
    }

    case 'jsonl':
    case 'sillytavern': {
      const jsonl = formatAsSillyTavernJSONL(exportData);
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="chat-${id}.jsonl"`
      );
      return res.status(HTTP_STATUS.OK).send(jsonl);
    }

    default:
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: `Unsupported export format: ${format}. Supported formats: json, txt, markdown, jsonl`,
      });
  }
});

/**
 * Format conversation as plain text
 */
const formatAsText = (conversation) => {
  const lines = [];
  lines.push(`Chat: ${conversation.title}`);
  if (conversation.persona_name) {
    lines.push(`User: ${conversation.persona_name}`);
  }
  lines.push(`Date: ${conversation.created}`);
  lines.push(`Messages: ${conversation.message_count}`);
  lines.push('');
  lines.push('='.repeat(80));
  lines.push('');

  conversation.messages.forEach((msg) => {
    const speaker = msg.role === 'user' ? (conversation.persona_name || 'User') : 'Assistant';
    lines.push(`${speaker}:`);
    lines.push(msg.content);
    lines.push('');
  });

  return lines.join('\n');
};

/**
 * Format conversation as Markdown
 */
const formatAsMarkdown = (conversation) => {
  const lines = [];
  lines.push(`# ${conversation.title}`);
  lines.push('');
  if (conversation.persona_name) {
    lines.push(`**User:** ${conversation.persona_name}`);
  }
  lines.push(`**Date:** ${conversation.created}`);
  lines.push(`**Messages:** ${conversation.message_count}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  conversation.messages.forEach((msg) => {
    const speaker = msg.role === 'user' ? (conversation.persona_name || 'User') : 'Assistant';
    lines.push(`### ${speaker}`);
    lines.push('');
    lines.push(msg.content);
    lines.push('');
  });

  return lines.join('\n');
};

/**
 * Format conversation as SillyTavern JSONL
 */
const formatAsSillyTavernJSONL = (conversation) => {
  const lines = conversation.messages.map((msg) => {
    const entry = {
      name: msg.role === 'user' ? (conversation.persona_name || 'User') : 'Assistant',
      is_user: msg.role === 'user',
      send_date: new Date(msg.timestamp).getTime(),
      mes: msg.content,
    };
    return JSON.stringify(entry);
  });

  return lines.join('\n');
};

export default {
  getConversations,
  getConversation,
  getConversationMessages,
  importChat,
  deleteConversation,
  exportConversation,
};
