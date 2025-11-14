/**
 * NegotiAI Coach - Background Service Worker
 */

console.log('🎯 NegotiAI Coach: Background service worker loaded');

// State
let activeCaptures = new Map(); // tabId -> { stream, recognition }

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle overlay
  chrome.tabs.sendMessage(tab.id, { action: 'toggle-overlay' });
});

// Handle messages from content scripts
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
  else {
    sendResponse({ success: true });
  }
});

// Start audio capture for a tab
async function startAudioCapture(tabId) {
  console.log('Starting audio capture for tab:', tabId);

  // Check if already capturing
  if (activeCaptures.has(tabId)) {
    console.log('Already capturing audio for this tab');
    return;
  }

  try {
    // Capture tab audio
    const stream = await chrome.tabCapture.capture({
      audio: true,
      video: false
    });

    if (!stream) {
      throw new Error('Failed to capture tab audio');
    }

    console.log('✅ Audio stream captured');

    // Create Web Speech API recognizer
    const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR'; // French language for negotiation

    let lastTranscript = '';
    let lastSpeaker = 'counterparty'; // Assume counterparty by default

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        const confidence = event.results[i][0].confidence;

        // Only send final results to avoid spam
        if (isFinal && transcript.trim() !== lastTranscript.trim()) {
          lastTranscript = transcript;

          console.log('📝 Transcript:', transcript);

          // Send transcript to content script
          chrome.tabs.sendMessage(tabId, {
            action: 'audio-transcript',
            data: {
              transcript: transcript,
              speaker: lastSpeaker,
              timestamp: Date.now() / 1000,
              confidence: confidence,
              isFinal: true
            }
          }).catch(err => {
            console.error('Failed to send transcript to content script:', err);
          });

          // Alternate speaker assumption (simple heuristic)
          // In reality, you'd need more sophisticated speaker detection
          lastSpeaker = lastSpeaker === 'user' ? 'counterparty' : 'user';
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      // Notify content script of error
      chrome.tabs.sendMessage(tabId, {
        action: 'audio-error',
        error: event.error
      }).catch(() => {});
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');

      // Auto-restart if still capturing
      if (activeCaptures.has(tabId)) {
        console.log('Restarting speech recognition...');
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    // Store capture state
    activeCaptures.set(tabId, { stream, recognition });

    // Start recognition
    recognition.start();

    console.log('✅ Speech recognition started');

  } catch (error) {
    console.error('Error starting audio capture:', error);
    throw error;
  }
}

// Stop audio capture for a tab
function stopAudioCapture(tabId) {
  const capture = activeCaptures.get(tabId);

  if (capture) {
    console.log('Stopping audio capture for tab:', tabId);

    // Stop recognition
    if (capture.recognition) {
      capture.recognition.stop();
    }

    // Stop stream
    if (capture.stream) {
      capture.stream.getTracks().forEach(track => track.stop());
    }

    activeCaptures.delete(tabId);
    console.log('✅ Audio capture stopped');
  }
}

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeCaptures.has(tabId)) {
    stopAudioCapture(tabId);
  }
});
