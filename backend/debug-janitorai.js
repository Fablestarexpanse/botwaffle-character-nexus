#!/usr/bin/env node

/**
 * Debug script to inspect JanitorAI page structure
 * Run with: node debug-janitorai.js
 */

import puppeteer from 'puppeteer';

const url = process.argv[2] || 'https://janitorai.com/characters/e334f2ea-755d-43e0-911b-15c19dc98817_character-ronan-voss-x-black-ops';

console.log('🔍 Inspecting JanitorAI page:', url);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('📡 Navigating to page...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('✅ Page loaded\n');

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    // Extract all possible character data
    const pageData = await page.evaluate(() => {
      const results = {
        title: document.title,
        h1: Array.from(document.querySelectorAll('h1')).map(el => ({ text: el.textContent.trim(), classes: el.className })),
        h2: Array.from(document.querySelectorAll('h2')).map(el => ({ text: el.textContent.trim(), classes: el.className })),
        metaTags: {},
        images: [],
        textAreas: [],
        divs: [],
        attributes: [],
      };

      // Get meta tags
      document.querySelectorAll('meta').forEach(meta => {
        const property = meta.getAttribute('property') || meta.getAttribute('name');
        const content = meta.getAttribute('content');
        if (property && content) {
          results.metaTags[property] = content;
        }
      });

      // Get images
      document.querySelectorAll('img').forEach(img => {
        if (img.src && img.src.includes('http')) {
          results.images.push({
            src: img.src,
            alt: img.alt,
            classes: img.className,
          });
        }
      });

      // Get textareas (might contain character data)
      document.querySelectorAll('textarea').forEach(textarea => {
        if (textarea.value) {
          results.textAreas.push({
            value: textarea.value.substring(0, 200),
            id: textarea.id,
            name: textarea.name,
            classes: textarea.className,
          });
        }
      });

      // Look for elements with data attributes
      document.querySelectorAll('[data-character], [data-name], [data-bio], [data-personality]').forEach(el => {
        results.attributes.push({
          tag: el.tagName,
          text: el.textContent.substring(0, 100),
          attributes: Array.from(el.attributes).map(attr => ({ name: attr.name, value: attr.value })),
        });
      });

      // Get all divs with class containing "character", "bio", "description", "personality"
      document.querySelectorAll('div').forEach(div => {
        const className = div.className;
        if (className && (
          className.includes('character') ||
          className.includes('bio') ||
          className.includes('description') ||
          className.includes('personality') ||
          className.includes('scenario') ||
          className.includes('name')
        )) {
          const text = div.textContent.trim();
          if (text && text.length > 0 && text.length < 500) {
            results.divs.push({
              classes: className,
              text: text.substring(0, 200),
            });
          }
        }
      });

      return results;
    });

    console.log('📋 PAGE DATA:\n');
    console.log('Title:', pageData.title);
    console.log('\n━━━ H1 ELEMENTS ━━━');
    console.log(JSON.stringify(pageData.h1, null, 2));

    console.log('\n━━━ H2 ELEMENTS ━━━');
    console.log(JSON.stringify(pageData.h2, null, 2));

    console.log('\n━━━ META TAGS ━━━');
    console.log(JSON.stringify(pageData.metaTags, null, 2));

    console.log('\n━━━ IMAGES (first 5) ━━━');
    console.log(JSON.stringify(pageData.images.slice(0, 5), null, 2));

    console.log('\n━━━ TEXT AREAS ━━━');
    console.log(JSON.stringify(pageData.textAreas, null, 2));

    console.log('\n━━━ DATA ATTRIBUTES ━━━');
    console.log(JSON.stringify(pageData.attributes, null, 2));

    console.log('\n━━━ RELEVANT DIVS (first 10) ━━━');
    console.log(JSON.stringify(pageData.divs.slice(0, 10), null, 2));

    // Take a screenshot
    await page.screenshot({ path: '/tmp/janitorai-debug.png', fullPage: false });
    console.log('\n📸 Screenshot saved to: /tmp/janitorai-debug.png');

    await browser.close();
    console.log('\n✅ Inspection complete!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
