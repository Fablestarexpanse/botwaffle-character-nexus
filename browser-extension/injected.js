// This script runs in the page context to intercept network requests
// It captures chat data from JanitorAI's API responses

(function() {
  'use strict';

  console.log('[Botwaffle] Injected script loaded');

  // Store captured chat data
  window.botwaffleData = {
    messages: [],
    characterInfo: null,
    userInfo: null
  };

  // XHR Interception
  const XHR = XMLHttpRequest.prototype;
  const originalOpen = XHR.open;
  const originalSend = XHR.send;

  XHR.open = function(method, url) {
    this._method = method;
    this._url = url;
    return originalOpen.apply(this, arguments);
  };

  XHR.send = function(postData) {
    this.addEventListener('load', function() {
      try {
        const url = this._url;

        // Check if this is a chat/message API endpoint
        if (url && (url.includes('/chat') || url.includes('/message') || /\/\d+$/.test(url))) {
          console.log('[Botwaffle] Captured XHR:', this._method, url);

          const responseData = this.responseText;
          if (responseData) {
            try {
              const data = JSON.parse(responseData);

              // Send to content script
              window.postMessage({
                type: 'BOTWAFFLE_XHR_CAPTURE',
                url: url,
                method: this._method,
                data: data
              }, '*');
            } catch (e) {
              console.log('[Botwaffle] Response not JSON:', e);
            }
          }
        }
      } catch (err) {
        console.error('[Botwaffle] Error in XHR interception:', err);
      }
    });

    return originalSend.apply(this, arguments);
  };

  // Fetch Interception
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch(...args);

    try {
      const url = args[0];

      // Check if this is a chat/message API endpoint
      if (url && (url.includes('/chat') || url.includes('/message'))) {
        console.log('[Botwaffle] Captured Fetch:', url);

        const clonedResponse = response.clone();
        const responseText = await clonedResponse.text();

        if (responseText.trim()) {
          try {
            const data = JSON.parse(responseText);

            // Send to content script
            window.postMessage({
              type: 'BOTWAFFLE_FETCH_CAPTURE',
              url: url,
              data: data
            }, '*');
          } catch (e) {
            console.log('[Botwaffle] Response not JSON:', e);
          }
        }
      }
    } catch (err) {
      console.error('[Botwaffle] Error in Fetch interception:', err);
    }

    return response;
  };

  console.log('[Botwaffle] Network interception active');
})();
