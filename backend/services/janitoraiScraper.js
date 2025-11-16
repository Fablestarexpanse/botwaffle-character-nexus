import { validateJanitorAIUrl } from '../utils/validators.js';
import { PUPPETEER_CONFIG } from '../config/constants.js';
import { logInfo, logError, logWarn } from '../utils/logger.js';
import { sanitizeHtml } from '../utils/helpers.js';

/**
 * JanitorAI Scraper Service
 * Scrapes character data from JanitorAI character pages
 *
 * NOTE: Requires Puppeteer chromium to be installed.
 * If you skipped chromium download during setup, run:
 * cd backend && npm install puppeteer
 */

/**
 * Dynamically import Puppeteer if available
 * @returns {Promise<any|null>} Puppeteer module or null
 */
const loadPuppeteer = async () => {
  try {
    const puppeteer = await import('puppeteer');
    return puppeteer.default;
  } catch (error) {
    logWarn('Puppeteer not installed', { error: error.message });
    return null;
  }
};

/**
 * Check if Puppeteer is available
 * @returns {Promise<boolean>} True if Puppeteer can launch
 */
const isPuppeteerAvailable = async () => {
  try {
    const puppeteer = await loadPuppeteer();
    if (!puppeteer) return false;

    const browser = await puppeteer.launch({ ...PUPPETEER_CONFIG.LAUNCH_OPTIONS, timeout: 5000 });
    await browser.close();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Scrape character data from JanitorAI URL
 * @param {string} url - JanitorAI character URL
 * @returns {Promise<Object>} Character data
 */
export const scrapeJanitorAI = async (url) => {
  // Validate URL
  validateJanitorAIUrl(url);

  logInfo('Starting JanitorAI scrape', { url });

  // Check if Puppeteer is available
  const puppeteerAvailable = await isPuppeteerAvailable();

  if (!puppeteerAvailable) {
    logWarn('Puppeteer chromium not installed - using mock data');

    // Return mock data with instructions
    throw new Error(
      'Puppeteer chromium is not installed. To enable JanitorAI import:\n' +
      '1. Stop the server\n' +
      '2. Run: cd backend && npm install puppeteer\n' +
      '3. Restart the server\n\n' +
      'For now, please create characters manually.'
    );
  }

  let browser;
  try {
    // Load Puppeteer dynamically
    const puppeteer = await loadPuppeteer();
    if (!puppeteer) {
      throw new Error('Puppeteer module not available');
    }

    // Launch browser
    browser = await puppeteer.launch(PUPPETEER_CONFIG.LAUNCH_OPTIONS);
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport(PUPPETEER_CONFIG.VIEWPORT);

    // Set timeout
    page.setDefaultTimeout(PUPPETEER_CONFIG.TIMEOUT);

    // Navigate to URL
    logInfo('Navigating to JanitorAI page');
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for character content to load
    await page.waitForSelector('body');

    // Extract character data
    logInfo('Extracting character data');

    const characterData = await page.evaluate(() => {
      // Helper function to get text content safely
      const getText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : '';
      };

      // Helper function to get attribute safely
      const getAttribute = (selector, attribute) => {
        const element = document.querySelector(selector);
        return element ? element.getAttribute(attribute) : '';
      };

      // Debug: Find what we can extract
      const debug = {
        h1s: Array.from(document.querySelectorAll('h1')).map(el => el.textContent.trim()).slice(0, 3),
        h2s: Array.from(document.querySelectorAll('h2')).map(el => el.textContent.trim()).slice(0, 3),
        metaTitle: document.title,
        metaOgImage: getAttribute('meta[property="og:image"]', 'content'),
        metaOgTitle: getAttribute('meta[property="og:title"]', 'content'),
        metaOgDescription: getAttribute('meta[property="og:description"]', 'content'),
        firstImage: getAttribute('img', 'src'),
      };

      // Try multiple selectors for character name
      const name = getText('h1') ||
                   getText('[data-character-name]') ||
                   debug.metaOgTitle ||
                   debug.h1s[0] ||
                   'Unknown Character';

      // Try meta description for bio
      const bio = getText('[data-character-bio]') ||
                  getText('.character-bio') ||
                  debug.metaOgDescription ||
                  '';

      // Image from meta tags or first image
      const imageUrl = getAttribute('meta[property="og:image"]', 'content') ||
                      getAttribute('img[data-character-image]', 'src') ||
                      getAttribute('.character-image img', 'src') ||
                      debug.firstImage ||
                      '';

      const data = {
        name,
        bio,
        personality: getText('[data-character-personality]') || getText('.character-personality') || '',
        scenario: getText('[data-character-scenario]') || getText('.character-scenario') || '',
        introMessage: getText('[data-character-intro]') || getText('.character-intro') || '',
        imageUrl,
        tags: [],
        contentRating: 'sfw',
        debug, // Include debug info
      };

      // Extract tags if available
      const tagElements = document.querySelectorAll('[data-tag]') ||
                          document.querySelectorAll('.character-tag');
      if (tagElements.length > 0) {
        data.tags = Array.from(tagElements).map(el => el.textContent.trim());
      }

      // Detect NSFW content
      const bodyText = document.body.textContent.toLowerCase();
      if (bodyText.includes('nsfw') || bodyText.includes('18+') || bodyText.includes('adult')) {
        data.contentRating = 'nsfw';
      }

      return data;
    });

    // Log debug information
    logInfo('Page debug info', characterData.debug);

    await browser.close();

    // Remove debug object before sanitizing
    const { debug, ...dataWithoutDebug } = characterData;

    // Sanitize HTML fields
    const sanitizedData = {
      ...dataWithoutDebug,
      bio: sanitizeHtml(dataWithoutDebug.bio),
      personality: sanitizeHtml(dataWithoutDebug.personality),
      scenario: sanitizeHtml(dataWithoutDebug.scenario),
      introMessage: sanitizeHtml(dataWithoutDebug.introMessage),
    };

    logInfo('JanitorAI scrape completed successfully', {
      name: sanitizedData.name,
      hasImage: !!sanitizedData.imageUrl,
      tagCount: sanitizedData.tags.length,
    });

    return {
      ...sanitizedData,
      source: url,
      lastSyncedFrom: url,
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }

    logError('JanitorAI scrape failed', { url, error: error.message });
    throw new Error(`Failed to scrape JanitorAI: ${error.message}`);
  }
};

/**
 * Get mock character data for testing (when Puppeteer is not available)
 * @param {string} url - JanitorAI URL
 * @returns {Object} Mock character data
 */
export const getMockCharacterData = (url) => {
  return {
    name: 'Example Character (Mock Data)',
    bio: 'This is mock data returned because Puppeteer chromium is not installed. To enable real JanitorAI imports, install Puppeteer with chromium.',
    personality: 'Helpful, informative, placeholder',
    scenario: 'Testing the import system without Puppeteer',
    introMessage: 'Hello! I\'m a mock character for testing purposes.',
    imageUrl: '',
    tags: ['mock', 'testing', 'placeholder'],
    contentRating: 'sfw',
    source: url,
    lastSyncedFrom: url,
  };
};

export default {
  scrapeJanitorAI,
  getMockCharacterData,
  isPuppeteerAvailable,
};
