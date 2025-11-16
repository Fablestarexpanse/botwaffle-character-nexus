import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateUUID } from '../utils/helpers.js';
import { IMAGE_CONFIG } from '../config/constants.js';
import config from '../config/environment.js';
import { logInfo, logError } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Image Service
 * Handles image download, processing, and storage with security measures
 */

/**
 * Download image from URL
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<Buffer>} Image buffer
 */
export const downloadImage = async (imageUrl) => {
  try {
    logInfo('Downloading image', { url: imageUrl });

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logInfo('Image downloaded successfully', { size: buffer.length });

    return buffer;
  } catch (error) {
    logError('Error downloading image', { url: imageUrl, error: error.message });
    throw new Error(`Failed to download image: ${error.message}`);
  }
};

/**
 * Process and save image with security measures
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} mimeType - MIME type (optional, will be detected if not provided)
 * @returns {Promise<string>} Saved filename
 */
export const processAndSaveImage = async (imageBuffer, mimeType = null) => {
  try {
    // Validate file size
    if (imageBuffer.length > IMAGE_CONFIG.MAX_SIZE) {
      throw new Error(
        `Image too large. Maximum size is ${IMAGE_CONFIG.MAX_SIZE / (1024 * 1024)}MB`
      );
    }

    // Detect image format
    const metadata = await sharp(imageBuffer).metadata();
    logInfo('Processing image', {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: imageBuffer.length,
    });

    // Validate format
    const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    if (!validFormats.includes(metadata.format)) {
      throw new Error(`Invalid image format: ${metadata.format}. Allowed: ${validFormats.join(', ')}`);
    }

    // Process image with Sharp
    // - Strip ALL metadata including EXIF (privacy protection)
    // - Auto-rotate based on EXIF orientation
    // - Resize if too large
    // - Convert to WebP for compression
    const processedImage = await sharp(imageBuffer)
      .withMetadata(false) // Strip EXIF and all metadata
      .rotate() // Auto-rotate based on EXIF orientation (before stripping)
      .resize(IMAGE_CONFIG.MAX_DIMENSION, IMAGE_CONFIG.MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: IMAGE_CONFIG.OUTPUT_QUALITY })
      .toBuffer();

    // Generate UUID filename
    const filename = `${generateUUID()}.${IMAGE_CONFIG.OUTPUT_FORMAT}`;
    const filepath = path.join(config.IMAGE_DIR, filename);

    // Verify path is safe (prevent path traversal)
    const resolvedPath = path.resolve(filepath);
    const resolvedDir = path.resolve(config.IMAGE_DIR);

    if (!resolvedPath.startsWith(resolvedDir)) {
      throw new Error('Invalid file path - possible path traversal attempt');
    }

    // Ensure directory exists
    await fs.mkdir(config.IMAGE_DIR, { recursive: true });

    // Save file
    await fs.writeFile(resolvedPath, processedImage);

    logInfo('Image saved successfully', {
      filename,
      originalSize: imageBuffer.length,
      processedSize: processedImage.length,
      compression: ((1 - processedImage.length / imageBuffer.length) * 100).toFixed(2) + '%',
    });

    return filename;
  } catch (error) {
    logError('Error processing image', { error: error.message });
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

/**
 * Download image from URL and save it
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string>} Saved filename
 */
export const downloadAndSaveImage = async (imageUrl) => {
  try {
    const imageBuffer = await downloadImage(imageUrl);
    const filename = await processAndSaveImage(imageBuffer);
    return filename;
  } catch (error) {
    logError('Error downloading and saving image', { url: imageUrl, error: error.message });
    throw error;
  }
};

/**
 * Delete image file
 * @param {string} filename - Filename to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteImage = async (filename) => {
  try {
    if (!filename) return false;

    const filepath = path.join(config.IMAGE_DIR, filename);

    // Verify path is safe
    const resolvedPath = path.resolve(filepath);
    const resolvedDir = path.resolve(config.IMAGE_DIR);

    if (!resolvedPath.startsWith(resolvedDir)) {
      throw new Error('Invalid file path');
    }

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      logInfo('Image file not found, skipping deletion', { filename });
      return false;
    }

    // Delete file
    await fs.unlink(filepath);

    logInfo('Image deleted successfully', { filename });

    return true;
  } catch (error) {
    logError('Error deleting image', { filename, error: error.message });
    return false;
  }
};

/**
 * Get image path
 * @param {string} filename - Filename
 * @returns {string} Full file path
 */
export const getImagePath = (filename) => {
  return path.join(config.IMAGE_DIR, filename);
};

export default {
  downloadImage,
  processAndSaveImage,
  downloadAndSaveImage,
  deleteImage,
  getImagePath,
};
