/**
 * NegotiAI Coach - Background Service Worker
 */

console.log('🎯 NegotiAI Coach: Background service worker loaded');

// State
let activeCaptures = new Map(); // tabId -> { stream }
let offscreenDocumentCreated = false;

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle overlay
  chrome.tabs.sendMessage(tab.id, { action: 'toggle-overlay' });
});

// Handle messages from content scripts and offscreen document
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  if (request.action === 'notification') {
    // Show browser notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/icon48.png',
      title: 'NegotiAI Coach',
      message: request.message,
      priority: request.priority || 0
    });
    sendResponse({ success: true });
  }
  else if (request.action === 'start-audio-capture') {
    // Start capturing audio from tab
    startAudioCapture(sender.tab.id)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
  else if (request.action === 'stop-audio-capture') {
    stopAudioCapture(sender.tab.id);
    sendResponse({ success: true });
  }
  else if (request.action === 'transcript-result') {
    // Forward transcript from offscreen to content script
    forwardTranscriptToContentScript(request.data);
    sendResponse({ success: true });
  }
  else if (request.action === 'recognition-error') {
    // Forward error from offscreen to content script
    forwardErrorToContentScript(request.error);
    sendResponse({ success: true });
  }
  else if (request.action === 'offscreen-ready') {
    console.log('Offscreen document is ready');
    sendResponse({ success: true });
  }
  else {
    sendResponse({ success: true });
  }
});

// Create offscreen document if needed
async function setupOffscreenDocument() {
  if (offscreenDocumentCreated) {
    return;
  }

  // Check if offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) {
    console.log('Offscreen document already exists');
    offscreenDocumentCreated = true;
    return;
  }

  // Create offscreen document
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'], // Using media streams
    justification: 'Speech recognition for real-time transcription'
  });

  offscreenDocumentCreated = true;
  console.log('✅ Offscreen document created');
}

// Start audio capture for a tab
async function startAudioCapture(tabId) {
  console.log('Starting audio capture for tab:', tabId);

  // Check if already capturing
  if (activeCaptures.has(tabId)) {
    console.log('Already capturing audio for this tab');
    return;
  }

  try {
    // Ensure offscreen document exists
    await setupOffscreenDocument();

    // Capture tab audio
    const stream = await new Promise((resolve, reject) => {
      chrome.tabCapture.capture({
        audio: true,
        video: false
      }, (stream) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!stream) {
          reject(new Error('Failed to capture tab audio'));
        } else {
          resolve(stream);
        }
      });
    });

    console.log('✅ Audio stream captured');

    // Store stream
    activeCaptures.set(tabId, { stream, tabId });

    // Send message to offscreen document to start recognition
    await chrome.runtime.sendMessage({
      action: 'start-recognition',
      stream: stream.id
    });

    console.log('✅ Speech recognition request sent to offscreen');

  } catch (error) {
    console.error('Error starting audio capture:', error);
    throw error;
  }
}

// Stop audio capture for a tab
async function stopAudioCapture(tabId) {
  const capture = activeCaptures.get(tabId);

  if (capture) {
    console.log('Stopping audio capture for tab:', tabId);

    // Stop offscreen recognition
    try {
      await chrome.runtime.sendMessage({
        action: 'stop-recognition'
      });
    } catch (e) {
      console.error('Error stopping recognition:', e);
    }

    // Stop stream
    if (capture.stream) {
      capture.stream.getTracks().forEach(track => track.stop());
    }

    activeCaptures.delete(tabId);
    console.log('✅ Audio capture stopped');
  }
}

// Forward transcript from offscreen to content script
function forwardTranscriptToContentScript(data) {
  // Find the tab that has an active capture
  for (const [tabId, capture] of activeCaptures.entries()) {
    chrome.tabs.sendMessage(tabId, {
      action: 'audio-transcript',
      data: data
    }).catch(err => {
      console.error('Failed to send transcript to content script:', err);
    });
  }
}

// Forward error from offscreen to content script
function forwardErrorToContentScript(error) {
  for (const [tabId, capture] of activeCaptures.entries()) {
    chrome.tabs.sendMessage(tabId, {
      action: 'audio-error',
      error: error
    }).catch(() => {});
  }
}

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeCaptures.has(tabId)) {
    stopAudioCapture(tabId);
  }
});
