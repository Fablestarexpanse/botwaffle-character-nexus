import Joi from 'joi';
import { LIMITS, CONTENT_RATINGS } from '../config/constants.js';
import { ValidationError } from './errorHandler.js';

/**
 * Character Validation Schema
 */
export const characterSchema = Joi.object({
  name: Joi.string().trim().max(LIMITS.CHARACTER_NAME).required(),
  chatName: Joi.string().trim().max(LIMITS.CHAT_NAME).allow('').optional(),
  universe: Joi.string().trim().max(LIMITS.UNIVERSE_NAME).required(),
  image: Joi.string().allow('').optional(),
  bio: Joi.string().max(LIMITS.BIO_LENGTH).allow('').optional(),
  personality: Joi.string().max(LIMITS.PERSONALITY_LENGTH).allow('').optional(),
  scenario: Joi.string().max(LIMITS.SCENARIO_LENGTH).allow('').optional(),
  introMessage: Joi.string().max(LIMITS.INTRO_MESSAGE_LENGTH).allow('').optional(),
  exampleDialogues: Joi.array().items(
    Joi.object({
      user: Joi.string().max(1000),
      bot: Joi.string().max(1000),
    })
  ).optional(),
  tags: Joi.array().items(Joi.string().max(LIMITS.TAG_LENGTH)).max(LIMITS.MAX_TAGS).optional(),
  contentRating: Joi.string().valid(CONTENT_RATINGS.SFW, CONTENT_RATINGS.NSFW).optional(),
  notes: Joi.string().max(LIMITS.NOTES_LENGTH).allow('').optional(),
  relationships: Joi.array().items(
    Joi.object({
      characterId: Joi.string().required(),
      type: Joi.string().required(),
      notes: Joi.string().allow('').optional(),
    })
  ).optional(),
  customTags: Joi.array().items(Joi.string().max(LIMITS.TAG_LENGTH)).optional(),
  source: Joi.string().uri().max(LIMITS.URL_LENGTH).allow('').optional(),
  lastSyncedFrom: Joi.string().uri().max(LIMITS.URL_LENGTH).allow('').optional(),
});

/**
 * Group Validation Schema
 */
export const groupSchema = Joi.object({
  name: Joi.string().trim().max(LIMITS.CHARACTER_NAME).required(),
  universe: Joi.string().trim().max(LIMITS.UNIVERSE_NAME).required(),
  description: Joi.string().max(LIMITS.DESCRIPTION_LENGTH).allow('').optional(),
  characters: Joi.array().items(Joi.string()).optional(),
});

/**
 * Universe Validation Schema
 */
export const universeSchema = Joi.object({
  name: Joi.string().trim().max(LIMITS.UNIVERSE_NAME).required(),
  description: Joi.string().max(LIMITS.DESCRIPTION_LENGTH).allow('').optional(),
});

/**
 * Import URL Validation Schema
 */
export const importUrlSchema = Joi.object({
  url: Joi.string().uri().required(),
});

/**
 * Validate request body middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new ValidationError('Validation failed', { fields: details });
    }

    // Replace req.body with validated and sanitized value
    req.validatedData = value;
    next();
  };
};

/**
 * Validate query parameters middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new ValidationError('Query validation failed', { fields: details });
    }

    req.validatedQuery = value;
    next();
  };
};

export default {
  characterSchema,
  groupSchema,
  universeSchema,
  importUrlSchema,
  validateBody,
  validateQuery,
};
