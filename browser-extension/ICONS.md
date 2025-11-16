# Extension Icons

The browser extension requires three icon sizes for proper display:

- **icon16.png** - 16x16 pixels (toolbar icon)
- **icon48.png** - 48x48 pixels (extensions management page)
- **icon128.png** - 128x128 pixels (Chrome Web Store, installation)

## Quick Setup Options

### Option 1: Use Placeholder Icons (Temporary)

The extension will work without custom icons - browsers will display a default puzzle piece icon. This is fine for development and personal use.

### Option 2: Create Simple Icons Online

Use a free online tool to create simple icons:

1. Go to https://www.favicon-generator.org/
2. Upload any image or logo you want to use
3. Download the generated icons
4. Rename them to match our requirements:
   - `favicon-16x16.png` → `icon16.png`
   - `favicon-32x32.png` → `icon48.png` (will resize)
   - `android-chrome-192x192.png` → `icon128.png` (will resize)
5. Place all three files in the `browser-extension` folder

### Option 3: Create Icons with ImageMagick

If you have ImageMagick installed, run these commands from the `browser-extension` directory:

```bash
# Create a simple purple icon with "BW" text
convert -size 128x128 xc:"#8B5CF6" \
  -gravity center \
  -pointsize 64 \
  -fill white \
  -annotate +0+0 "BW" \
  icon128.png

# Resize for other sizes
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

### Option 4: Use Existing Botwaffle Logo

If you have a Botwaffle logo or brand image:

```bash
# Replace 'your-logo.png' with your actual logo file
convert your-logo.png -resize 128x128 icon128.png
convert your-logo.png -resize 48x48 icon48.png
convert your-logo.png -resize 16x16 icon16.png
```

## Design Suggestions

For best results:

- **Colors**: Use Botwaffle's purple theme (#8B5CF6)
- **Style**: Simple, recognizable at small sizes
- **Content**: "BW" initials, waffle icon, or bookmark icon
- **Background**: Solid color or transparent (PNG with alpha channel)

## Testing Without Icons

You can test the extension immediately without icons:

1. Load the extension (see main README)
2. The browser will show a default icon
3. All functionality will work normally
4. Add proper icons later when ready

Icons are only cosmetic - the extension functionality is not affected by their absence.
