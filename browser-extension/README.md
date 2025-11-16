# Botwaffle Chat Capture Browser Extension

A lightweight browser extension that captures chat data from JanitorAI.com and sends it directly to your local Botwaffle Character Nexus application.

## Features

- **One-Click Capture**: Automatically intercepts and captures chat messages as you browse JanitorAI
- **Direct Integration**: Sends chat data directly to your local Botwaffle server (no manual JSON downloads!)
- **Real-time Counter**: Shows how many messages have been captured
- **Smart Extraction**: Automatically extracts character names, user names, and message data
- **Privacy-First**: All data stays local - sent directly from your browser to localhost:3000

## How It Works

```
┌─────────────────┐
│  JanitorAI.com  │  ← You browse and chat normally
│   (chat page)   │
└────────┬────────┘
         │
    ┌────▼─────────────────┐
    │ [Send to Botwaffle]  │  ← Click when ready to save
    │   Button (23 msgs)   │
    └────┬─────────────────┘
         │ HTTP POST
    ┌────▼─────────────────┐
    │  localhost:3000      │  ← Your Botwaffle app saves it
    │  Botwaffle Backend   │
    └──────────────────────┘
```

## Installation

### Prerequisites

1. **Botwaffle Character Nexus must be running locally**
   ```bash
   # In the botwaffle-character-nexus directory
   cd backend && npm run dev    # Terminal 1
   cd frontend && npm run dev   # Terminal 2
   ```

2. Make sure your Botwaffle backend is accessible at `http://localhost:3000`

### Chrome Installation

1. Open Chrome and navigate to `chrome://extensions/`

2. Enable **Developer mode** (toggle in the top-right corner)

3. Click **Load unpacked**

4. Select the `browser-extension` folder from your Botwaffle project:
   ```
   /path/to/botwaffle-character-nexus/browser-extension
   ```

5. The extension should now appear in your extensions list!

### Firefox Installation

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`

2. Click **Load Temporary Add-on...**

3. Navigate to the `browser-extension` folder and select the `manifest.json` file:
   ```
   /path/to/botwaffle-character-nexus/browser-extension/manifest.json
   ```

4. The extension will be loaded temporarily (valid until Firefox restarts)

**Note**: For permanent installation in Firefox, you'll need to package and sign the extension through Mozilla's Add-ons platform.

### Edge Installation

1. Open Edge and navigate to `edge://extensions/`

2. Enable **Developer mode** (toggle in the bottom-left corner)

3. Click **Load unpacked**

4. Select the `browser-extension` folder from your Botwaffle project

## Usage

1. **Start Botwaffle**: Make sure your Botwaffle backend and frontend are running locally

2. **Visit JanitorAI**: Navigate to https://janitorai.com and open any chat

3. **Browse Normally**: The extension automatically captures messages as JanitorAI loads them
   - The purple "Send to Botwaffle" button will appear in the bottom-right corner
   - The counter shows how many messages have been captured

4. **Send to Botwaffle**: Click the "Send to Botwaffle" button when ready
   - A success notification will appear
   - Your chat is now saved in Botwaffle!
   - View it in the Botwaffle app under the "Chats" tab

5. **View in Botwaffle**: Open http://localhost:5173 and click the "Chats" tab to see your imported chats

## Troubleshooting

### Button Not Appearing

- Wait a few seconds after page load (button appears after 2 seconds)
- Refresh the JanitorAI page
- Check browser console for errors (F12 → Console tab)

### "Failed to send chat to Botwaffle"

**Error**: `Failed to fetch` or `Is Botwaffle running on localhost:3000?`

**Solution**:
1. Make sure Botwaffle backend is running:
   ```bash
   cd backend && npm run dev
   ```
2. Check that the backend is accessible at http://localhost:3000
3. Look for backend logs showing the server started successfully

**Error**: `HTTP 500: Internal Server Error`

**Solution**:
1. Check backend terminal for error logs
2. Verify database is initialized (should see "✅ Database schema initialized")
3. Try restarting the backend server

### No Messages Captured (Counter Shows 0)

**Possible causes**:
1. **JanitorAI hasn't loaded messages yet**: Scroll through the chat to trigger message loading
2. **API endpoints changed**: JanitorAI may have updated their API structure
3. **Extension not injected**: Check browser console for "[Botwaffle] Injected script loaded" message

**Debug steps**:
1. Open browser console (F12 → Console)
2. Look for `[Botwaffle]` log messages
3. Refresh the page and try again
4. If you see "Captured XHR" or "Captured Fetch" logs, the extension is working

### Character Name Shows as "Unknown Character"

This is normal if JanitorAI's page structure doesn't include the character name in expected locations. The extension tries multiple selectors but may not always find it.

**Workaround**: After importing, you can edit the chat in Botwaffle and link it to the correct character manually.

## Privacy & Security

- **Local Only**: All captured data is sent directly from your browser to localhost:3000 (your own computer)
- **No External Servers**: Nothing is sent to external servers or the cloud
- **No Tracking**: The extension doesn't collect analytics or telemetry
- **Open Source**: All code is visible and auditable in this repository

## How Data is Captured

The extension uses two techniques:

1. **XHR Interception**: Captures data from traditional XMLHttpRequest API calls
2. **Fetch Interception**: Captures data from modern Fetch API calls

When JanitorAI loads chat messages from its backend, the extension intercepts these network requests and extracts the message data. This is similar to viewing network traffic in browser DevTools, but automated.

## Limitations

- **Temporary Installation**: In Firefox, the extension is temporary and must be reloaded after browser restart
- **API Changes**: If JanitorAI changes their API structure, the extension may need updates
- **Message Deduplication**: The extension tries to avoid duplicates, but some may slip through
- **Character Detection**: Character name extraction depends on JanitorAI's page structure and may not always work

## Data Format

The extension sends data to Botwaffle in this format:

```json
{
  "chatData": {
    "title": "Chat with Character Name",
    "characterName": "Character Name",
    "personaName": "Your Username",
    "sourceUrl": "https://janitorai.com/chats/...",
    "messages": [
      {
        "role": "user",
        "content": "Hello!",
        "timestamp": "2025-01-16T10:30:00.000Z",
        "order_index": 0,
        "metadata": {
          "id": "msg_123",
          "original": { /* original API response */ }
        }
      },
      {
        "role": "assistant",
        "content": "Hi there!",
        "timestamp": "2025-01-16T10:30:15.000Z",
        "order_index": 1,
        "metadata": { /* ... */ }
      }
    ],
    "metadata": {
      "capturedAt": "2025-01-16T10:35:00.000Z",
      "source": "JanitorAI",
      "extension": "Botwaffle Chat Capture v1.0.0"
    }
  }
}
```

## Development

### File Structure

```
browser-extension/
├── manifest.json        # Extension configuration
├── content.js          # Main content script (button UI, data management)
├── injected.js         # Page context script (network interception)
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension icon (128x128)
└── README.md           # This file
```

### Making Changes

1. Edit the extension files
2. Go to `chrome://extensions/` (or your browser's equivalent)
3. Click the **Reload** button (🔄) on the extension card
4. Refresh any open JanitorAI tabs to test changes

### Debugging

**Browser Console**: Open DevTools (F12) and look for `[Botwaffle]` log messages

**Check Injected Script**:
```javascript
// In browser console on JanitorAI page
console.log(window.botwaffleData);
```

**Test Network Interception**:
```javascript
// In browser console
// Should see [Botwaffle] logs when you browse the chat
```

## Future Enhancements

Potential improvements for future versions:

- [ ] Export to multiple formats (EPUB, Markdown, TXT) directly from extension
- [ ] Bulk capture (grab all chats, not just current one)
- [ ] Character auto-linking (match to existing Botwaffle characters)
- [ ] Settings panel (configure API URL, auto-send, etc.)
- [ ] Firefox permanent installation (signed extension)
- [ ] Chrome Web Store / Firefox Add-ons publication

## Support

If you encounter issues:

1. Check this README's Troubleshooting section
2. Open browser console (F12) and look for error messages
3. Check Botwaffle backend logs for API errors
4. Create an issue in the Botwaffle Character Nexus repository

## License

This extension is part of the Botwaffle Character Nexus project and shares the same license.

---

**Made with 💜 for the Botwaffle Character Nexus project**
