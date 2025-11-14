/**
 * NegotiAI Coach - Offscreen Document
 * Has access to Web APIs like SpeechRecognition
 */

console.log('🎯 NegotiAI Offscreen: Document loaded');

// State
let mediaStream = null;
let recognition = null;
let isRecognizing = false;
let lastTranscript = '';
let lastSpeaker = 'counterparty';

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Offscreen received message:', message);

  if (message.action === 'start-recognition') {
    startRecognition(message.stream)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
  else if (message.action === 'stop-recognition') {
    stopRecognition();
    sendResponse({ success: true });
  }
  else {
    sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Start speech recognition
async function startRecognition(streamId) {
  console.log('Starting speech recognition...');

  if (isRecognizing) {
    console.log('Already recognizing');
    return;
  }

  try {
    // Check if Speech Recognition is available
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech Recognition API not available');
    }

    // Create recognition instance
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR'; // French language
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('✅ Speech recognition started');
      isRecognizing = true;
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;
        const confidence = result[0].confidence;

        // Only send final results to avoid spam
        if (isFinal && transcript.trim() !== lastTranscript.trim()) {
          lastTranscript = transcript;

          console.log('📝 Transcript:', transcript, 'Confidence:', confidence);

          // Send to background script
          chrome.runtime.sendMessage({
            action: 'transcript-result',
            data: {
              transcript: transcript,
              speaker: lastSpeaker,
              timestamp: Date.now() / 1000,
              confidence: confidence,
              isFinal: true
            }
          }).catch(err => {
            console.error('Failed to send transcript to background:', err);
          });

          // Alternate speaker (simple heuristic)
          lastSpeaker = lastSpeaker === 'user' ? 'counterparty' : 'user';
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      // Send error to background
      chrome.runtime.sendMessage({
        action: 'recognition-error',
        error: event.error
      }).catch(() => {});

      // Don't stop on network errors or no-speech
      if (event.error === 'aborted' || event.error === 'audio-capture') {
        isRecognizing = false;
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');

      // Auto-restart if we should still be recognizing
      if (isRecognizing) {
        console.log('Restarting speech recognition...');
        setTimeout(() => {
          try {
            if (recognition && isRecognizing) {
              recognition.start();
            }
          } catch (e) {
            console.error('Failed to restart recognition:', e);
            isRecognizing = false;
          }
        }, 100);
      }
    };

    // Start recognition
    recognition.start();

  } catch (error) {
    console.error('Error starting recognition:', error);
    isRecognizing = false;
    throw error;
  }
}

// Stop speech recognition
function stopRecognition() {
  console.log('Stopping speech recognition...');

  isRecognizing = false;

  if (recognition) {
    try {
      recognition.stop();
      recognition = null;
    } catch (e) {
      console.error('Error stopping recognition:', e);
    }
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }

  lastTranscript = '';
  lastSpeaker = 'counterparty';

  console.log('✅ Speech recognition stopped');
}

// Notify background that offscreen is ready
chrome.runtime.sendMessage({ action: 'offscreen-ready' }).catch(() => {});
