import * as characterService from '../services/characterService.js';
import * as janitoraiScraper from '../services/janitoraiScraper.js';
import * as imageService from '../services/imageService.js';
import { HTTP_STATUS } from '../config/constants.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logInfo, logError } from '../utils/logger.js';

/**
 * Import Controller
 * Handles character import from external sources
 */

/**
 * POST /api/import/janitorai
 * Import character from JanitorAI URL
 */
export const importFromJanitorAI = asyncHandler(async (req, res) => {
  const { url } = req.validatedData;

  logInfo('Starting JanitorAI import', { url });

  try {
    // Step 1: Scrape character data from JanitorAI
    const scrapedData = await janitoraiScraper.scrapeJanitorAI(url);

    // Step 2: Download and process character image (if available)
    let imageFilename = null;
    if (scrapedData.imageUrl) {
      try {
        logInfo('Downloading character image', { imageUrl: scrapedData.imageUrl });
        imageFilename = await imageService.downloadAndSaveImage(scrapedData.imageUrl);
        logInfo('Character image saved', { filename: imageFilename });
      } catch (imageError) {
        // Log image error but continue with character creation
        logError('Failed to download character image', {
          imageUrl: scrapedData.imageUrl,
          error: imageError.message,
        });
        // Don't throw - we can still create the character without an image
      }
    }

    // Step 3: Prepare character data
    const characterData = {
      name: scrapedData.name,
      chatName: scrapedData.chatName || scrapedData.name,
      universe: scrapedData.universe || 'JanitorAI',
      image: imageFilename,
      bio: scrapedData.bio,
      personality: scrapedData.personality,
      scenario: scrapedData.scenario,
      introMessage: scrapedData.introMessage,
      exampleDialogues: scrapedData.exampleDialogues || [],
      tags: scrapedData.tags || [],
      contentRating: scrapedData.contentRating || 'sfw',
      source: scrapedData.source,
      lastSyncedFrom: scrapedData.lastSyncedFrom,
    };

    // Step 4: Create character in database
    const character = await characterService.createCharacter(characterData);

    logInfo('Character imported successfully', {
      id: character.id,
      name: character.name,
      hasImage: !!imageFilename,
    });

    // Step 5: Return created character
    res.status(HTTP_STATUS.CREATED).json({
      data: character,
      message: `Character "${character.name}" imported successfully from JanitorAI`,
    });
  } catch (error) {
    logError('JanitorAI import failed', { url, error: error.message });

    // Provide helpful error message
    if (error.message.includes('Puppeteer')) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'JanitorAI import requires Puppeteer chromium',
        code: 'PUPPETEER_NOT_INSTALLED',
        details: {
          message: error.message,
          solution: 'Run: cd backend && npm install puppeteer',
        },
      });
    } else {
      throw error;
    }
  }
});

/**
 * POST /api/import/json
 * Import character from JSON data (bulk import)
 */
export const importFromJSON = asyncHandler(async (req, res) => {
  const { characters } = req.body;

  if (!Array.isArray(characters) || characters.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Invalid JSON data. Expected array of characters.',
    });
  }

  const results = {
    success: [],
    failed: [],
  };

  // Import each character
  for (const characterData of characters) {
    try {
      const character = await characterService.createCharacter(characterData);
      results.success.push({
        id: character.id,
        name: character.name,
      });
    } catch (error) {
      results.failed.push({
        name: characterData.name || 'Unknown',
        error: error.message,
      });
    }
  }

  logInfo('Bulk import completed', {
    total: characters.length,
    success: results.success.length,
    failed: results.failed.length,
  });

  res.status(HTTP_STATUS.OK).json({
    data: results,
    message: `Imported ${results.success.length} of ${characters.length} characters`,
  });
});

export default {
  importFromJanitorAI,
  importFromJSON,
};
