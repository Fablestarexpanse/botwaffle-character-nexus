// Content script for Botwaffle Chat Capture
// Runs in the extension context and communicates with the page

(function() {
  'use strict';

  console.log('[Botwaffle] Content script loaded');

  // Storage for captured data
  let capturedMessages = [];
  let capturedCharacterInfo = null;
  let capturedUserInfo = null;
  let sendButton = null;

  // Configuration
  const BOTWAFFLE_API = 'http://localhost:3000/api/chats/import';

  // Inject the interception script into the page
  function injectScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected.js');
    script.onload = function() {
      this.remove();
      console.log('[Botwaffle] Injected script loaded into page');
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Listen for messages from the injected script
  window.addEventListener('message', function(event) {
    // Only accept messages from the same window
    if (event.source !== window) return;

    const message = event.data;

    if (message.type === 'BOTWAFFLE_XHR_CAPTURE' || message.type === 'BOTWAFFLE_FETCH_CAPTURE') {
      console.log('[Botwaffle] Received captured data:', message);
      processApiResponse(message.url, message.data);
      updateButtonBadge();
    }
  });

  // Process API responses and extract relevant data
  function processApiResponse(url, data) {
    if (!data) return;

    // Try to extract messages
    if (Array.isArray(data)) {
      // Array of messages
      data.forEach(msg => addMessage(msg));
    } else if (data.messages && Array.isArray(data.messages)) {
      // Object with messages array
      data.messages.forEach(msg => addMessage(msg));
    } else if (data.message || data.text || data.content) {
      // Single message
      addMessage(data);
    }

    // Try to extract character info
    if (data.character) {
      capturedCharacterInfo = data.character;
    } else if (data.bot || data.ai) {
      capturedCharacterInfo = data.bot || data.ai;
    }

    // Try to extract user info
    if (data.user) {
      capturedUserInfo = data.user;
    }
  }

  // Add a message to the captured messages array
  function addMessage(msg) {
    if (!msg) return;

    const normalizedMsg = {
      role: determineRole(msg),
      content: msg.message || msg.text || msg.content || '',
      timestamp: msg.created_at || msg.timestamp || msg.createdAt || new Date().toISOString(),
      metadata: {
        id: msg.id || msg._id,
        original: msg
      }
    };

    // Avoid duplicates
    const isDuplicate = capturedMessages.some(m =>
      m.content === normalizedMsg.content &&
      m.timestamp === normalizedMsg.timestamp
    );

    if (!isDuplicate && normalizedMsg.content) {
      capturedMessages.push(normalizedMsg);
      console.log('[Botwaffle] Message captured:', normalizedMsg);
    }
  }

  // Determine message role (user or assistant)
  function determineRole(msg) {
    if (msg.role) return msg.role;
    if (msg.isUser || msg.is_user) return 'user';
    if (msg.isBot || msg.is_bot || msg.isAI) return 'assistant';
    if (msg.sender === 'user' || msg.from === 'user') return 'user';
    if (msg.sender === 'bot' || msg.from === 'bot') return 'assistant';

    // Default to assistant if unclear
    return 'assistant';
  }

  // Create and inject the "Send to Botwaffle" button
  function createSendButton() {
    // Don't create multiple buttons
    if (sendButton) return;

    sendButton = document.createElement('button');
    sendButton.id = 'botwaffle-send-btn';
    sendButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>Send to Botwaffle</span>
      <span class="badge">0</span>
    `;

    // Styling
    Object.assign(sendButton.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '10000',
      padding: '12px 20px',
      backgroundColor: '#8B5CF6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });

    // Badge styling
    const badge = sendButton.querySelector('.badge');
    Object.assign(badge.style, {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    });

    // Hover effect
    sendButton.addEventListener('mouseenter', () => {
      sendButton.style.backgroundColor = '#7C3AED';
      sendButton.style.transform = 'translateY(-2px)';
      sendButton.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
    });

    sendButton.addEventListener('mouseleave', () => {
      sendButton.style.backgroundColor = '#8B5CF6';
      sendButton.style.transform = 'translateY(0)';
      sendButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    });

    // Click handler
    sendButton.addEventListener('click', handleSendToBottwaffle);

    document.body.appendChild(sendButton);
    console.log('[Botwaffle] Send button created');
  }

  // Update the badge count on the button
  function updateButtonBadge() {
    if (!sendButton) return;
    const badge = sendButton.querySelector('.badge');
    if (badge) {
      badge.textContent = capturedMessages.length;
    }
  }

  // Handle sending data to Botwaffle
  async function handleSendToBottwaffle() {
    if (capturedMessages.length === 0) {
      showNotification('No messages captured yet. Browse the chat to capture messages.', 'warning');
      return;
    }

    // Disable button during send
    sendButton.disabled = true;
    sendButton.style.opacity = '0.6';
    sendButton.querySelector('span').textContent = 'Sending...';

    try {
      // Try to extract character and user names from the page
      const characterName = extractCharacterName();
      const userName = extractUserName();

      // Build the chat data payload
      const chatData = {
        title: characterName ? `Chat with ${characterName}` : 'JanitorAI Chat',
        characterName: characterName,
        personaName: userName,
        sourceUrl: window.location.href,
        messages: capturedMessages.map((msg, index) => ({
          ...msg,
          order_index: index
        })),
        metadata: {
          capturedAt: new Date().toISOString(),
          source: 'JanitorAI',
          extension: 'Botwaffle Chat Capture v1.0.0',
          characterInfo: capturedCharacterInfo,
          userInfo: capturedUserInfo
        }
      };

      console.log('[Botwaffle] Sending chat data:', chatData);

      // Send to Botwaffle API
      const response = await fetch(BOTWAFFLE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatData })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[Botwaffle] Success:', result);

      showNotification(`Chat sent successfully! ${capturedMessages.length} messages imported.`, 'success');

      // Clear captured data after successful send
      capturedMessages = [];
      updateButtonBadge();

    } catch (error) {
      console.error('[Botwaffle] Error sending chat:', error);

      let errorMessage = 'Failed to send chat to Botwaffle. ';
      if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Is Botwaffle running on localhost:3000?';
      } else {
        errorMessage += error.message;
      }

      showNotification(errorMessage, 'error');
    } finally {
      // Re-enable button
      sendButton.disabled = false;
      sendButton.style.opacity = '1';
      sendButton.querySelector('span').textContent = 'Send to Botwaffle';
    }
  }

  // Extract character name from the page
  function extractCharacterName() {
    // Try various selectors
    const selectors = [
      'h1',
      'h2',
      '[data-character-name]',
      '.character-name',
      '[class*="character"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    return capturedCharacterInfo?.name || 'Unknown Character';
  }

  // Extract user name from the page
  function extractUserName() {
    // Try to find username from various locations
    const selectors = [
      '[data-username]',
      '.username',
      '[class*="user-name"]',
      '[class*="profile"] span'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    return capturedUserInfo?.name || capturedUserInfo?.username || 'User';
  }

  // Show notification to user
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'botwaffle-notification';
    notification.textContent = message;

    // Styling based on type
    const colors = {
      success: { bg: '#10B981', text: '#fff' },
      error: { bg: '#EF4444', text: '#fff' },
      warning: { bg: '#F59E0B', text: '#fff' },
      info: { bg: '#3B82F6', text: '#fff' }
    };

    const color = colors[type] || colors.info;

    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '10001',
      padding: '16px 24px',
      backgroundColor: color.bg,
      color: color.text,
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      maxWidth: '400px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      animation: 'slideIn 0.3s ease'
    });

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Initialize the extension
  function init() {
    console.log('[Botwaffle] Initializing content script...');

    // Inject the interception script
    injectScript();

    // Create the send button after a short delay to ensure page is loaded
    setTimeout(createSendButton, 2000);

    console.log('[Botwaffle] Content script initialized');
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
