/**
 * NegotiAI Coach - Content Script
 * Injects overlay UI into video call pages
 */

console.log('🎯 NegotiAI Coach: Extension loaded');

// Configuration
const CONFIG = {
  apiUrl: 'http://localhost:8000',
  wsUrl: 'ws://localhost:8000/ws/live',
  reconnectDelay: 2000,
  maxReconnectAttempts: 5
};

// State
let ws = null;
let reconnectAttempts = 0;
let sessionId = null;
let isConnected = false;
let simulationInterval = null;
let isCapturingAudio = false;

// Test phrases for simulation
const TEST_PHRASES = [
  { speaker: 'counterparty', text: "Je peux vous offrir 10,000€ pour ce contrat.", emotion: 'neutral' },
  { speaker: 'counterparty', text: "C'est mon offre finale, prenez-le ou laissez-le.", emotion: 'firm' },
  { speaker: 'counterparty', text: "Cette offre n'est valable que jusqu'à demain.", emotion: 'urgent' },
  { speaker: 'user', text: "Je dois en discuter avec mon équipe.", emotion: 'hesitant' },
  { speaker: 'counterparty', text: "Il faut décider maintenant.", emotion: 'pushy' },
  { speaker: 'user', text: "Nos tarifs habituels sont bien supérieurs.", emotion: 'confident' },
  { speaker: 'counterparty', text: "Mon patron n'acceptera jamais ces conditions.", emotion: 'firm' },
  { speaker: 'user', text: "Qu'est-ce que vous proposez comme alternative ?", emotion: 'curious' }
];

let currentPhraseIndex = 0;

// Create overlay UI
function createOverlay() {
  // Check if overlay already exists
  if (document.getElementById('negotiai-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'negotiai-overlay';
  overlay.className = 'negotiai-overlay negotiai-minimized';

  overlay.innerHTML = `
    <div class="negotiai-header">
      <div class="negotiai-title">
        <span class="negotiai-icon">🎯</span>
        <span>NegotiAI Coach</span>
      </div>
      <div class="negotiai-controls">
        <button id="negotiai-toggle" class="negotiai-btn-icon" title="Minimize/Maximize">
          <span class="maximize-icon">⬆️</span>
          <span class="minimize-icon">⬇️</span>
        </button>
        <button id="negotiai-close" class="negotiai-btn-icon" title="Close">✕</button>
      </div>
    </div>

    <div class="negotiai-content">
      <div class="negotiai-status">
        <div class="negotiai-connection">
          <span class="negotiai-status-dot"></span>
          <span class="negotiai-status-text">Disconnected</span>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="negotiai-connect" class="negotiai-btn-primary">Connect</button>
          <button id="negotiai-start-audio" class="negotiai-btn-secondary" disabled>🎤 Start Audio</button>
          <button id="negotiai-simulate" class="negotiai-btn-secondary" disabled>Start Sim</button>
        </div>
      </div>

      <div class="negotiai-suggestions" id="negotiai-suggestions">
        <div class="negotiai-empty">
          <p>Waiting for suggestions...</p>
          <p class="negotiai-hint">Click "Connect" to start receiving AI recommendations</p>
        </div>
      </div>

      <div class="negotiai-transcript" id="negotiai-transcript">
        <h4>Live Transcript</h4>
        <div class="negotiai-transcript-list"></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Setup event listeners
  setupEventListeners();

  console.log('✅ NegotiAI Overlay created');
}

// Setup event listeners
function setupEventListeners() {
  const toggleBtn = document.getElementById('negotiai-toggle');
  const closeBtn = document.getElementById('negotiai-close');
  const connectBtn = document.getElementById('negotiai-connect');
  const startAudioBtn = document.getElementById('negotiai-start-audio');
  const simulateBtn = document.getElementById('negotiai-simulate');
  const overlay = document.getElementById('negotiai-overlay');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      overlay.classList.toggle('negotiai-minimized');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  }

  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      if (isConnected) {
        disconnect();
      } else {
        await connect();
      }
    });
  }

  if (startAudioBtn) {
    startAudioBtn.addEventListener('click', () => {
      if (isCapturingAudio) {
        stopAudioCapture();
      } else {
        startAudioCapture();
      }
    });
  }

  if (simulateBtn) {
    simulateBtn.addEventListener('click', () => {
      if (simulationInterval) {
        stopSimulation();
      } else {
        startSimulation();
      }
    });
  }

  // Make draggable
  makeOverlayDraggable();
}

// Make overlay draggable
function makeOverlayDraggable() {
  const overlay = document.getElementById('negotiai-overlay');
  const header = overlay.querySelector('.negotiai-header');

  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;

  header.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;

    isDragging = true;
    initialX = e.clientX - overlay.offsetLeft;
    initialY = e.clientY - overlay.offsetTop;

    header.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    overlay.style.left = currentX + 'px';
    overlay.style.top = currentY + 'px';
    overlay.style.right = 'auto';
    overlay.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = 'grab';
    }
  });
}

// Connect to backend
async function connect() {
  try {
    updateStatus('connecting', 'Connecting...');

    // Get or create session
    sessionId = await getOrCreateSession();

    if (!sessionId) {
      throw new Error('Failed to create session');
    }

    // Connect WebSocket
    connectWebSocket(sessionId);

  } catch (error) {
    console.error('Connection failed:', error);
    updateStatus('error', 'Connection failed');
    showNotification('Failed to connect. Is the backend running?', 'error');
  }
}

// Get or create session
async function getOrCreateSession() {
  try {
    // Check if we have a stored session
    const stored = await chrome.storage.local.get(['sessionId']);
    if (stored.sessionId) {
      // Verify session is still valid
      const response = await fetch(`${CONFIG.apiUrl}/api/session/${stored.sessionId}`);
      if (response.ok) {
        return stored.sessionId;
      }
    }

    // Create new session
    const context = {
      target_outcome: "Successful negotiation",
      minimum_acceptable: "Acceptable terms",
      red_lines: [],
      batna: "Walk away",
      initial_position: "Opening position",
      counterparty_info: {},
      expected_tactics: [],
      relevant_patterns: [],
      prepared_responses: {}
    };

    const response = await fetch(`${CONFIG.apiUrl}/api/prepare/brief?session_id=browser_${Date.now()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context)
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    const data = await response.json();
    const newSessionId = data.session_id;

    // Store session
    await chrome.storage.local.set({ sessionId: newSessionId });

    return newSessionId;

  } catch (error) {
    console.error('Session creation failed:', error);
    return null;
  }
}

// Connect WebSocket
function connectWebSocket(sessId) {
  const wsUrl = `${CONFIG.wsUrl}/${sessId}`;

  console.log('Connecting to WebSocket:', wsUrl);

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('✅ WebSocket connected');
    isConnected = true;
    reconnectAttempts = 0;
    updateStatus('connected', 'Connected');
    updateConnectButton(true);
    updateSimulateButton(true);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleMessage(data);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateStatus('error', 'Connection error');
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    isConnected = false;
    updateStatus('disconnected', 'Disconnected');
    updateConnectButton(false);

    // Auto-reconnect
    if (reconnectAttempts < CONFIG.maxReconnectAttempts) {
      reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... (${reconnectAttempts}/${CONFIG.maxReconnectAttempts})`);
        connectWebSocket(sessId);
      }, CONFIG.reconnectDelay * reconnectAttempts);
    }
  };
}

// Disconnect
function disconnect() {
  stopSimulation();

  // Stop audio capture if running
  if (isCapturingAudio) {
    stopAudioCapture();
  }

  if (ws) {
    ws.close();
    ws = null;
  }
  isConnected = false;
  updateStatus('disconnected', 'Disconnected');
  updateConnectButton(false);
  updateSimulateButton(false);
}

// Start simulation
function startSimulation() {
  if (!isConnected || !ws) {
    showNotification('Connect to backend first!', 'warning');
    return;
  }

  console.log('🎬 Starting simulation...');
  currentPhraseIndex = 0;

  // Send first phrase immediately
  sendNextPhrase();

  // Then send phrases every 5 seconds
  simulationInterval = setInterval(() => {
    sendNextPhrase();
  }, 5000);

  updateSimulateButton(true, true);
  showNotification('Simulation started - sending test phrases', 'info');
}

// Stop simulation
function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    updateSimulateButton(true, false);
    console.log('⏹️ Simulation stopped');
  }
}

// Send next test phrase
function sendNextPhrase() {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    stopSimulation();
    return;
  }

  const phrase = TEST_PHRASES[currentPhraseIndex];

  // Create transcript message
  const transcript = {
    transcript: phrase.text,
    speaker: phrase.speaker,
    timestamp: Date.now() / 1000,
    emotion: phrase.emotion,
    confidence_level: 0.85,
    conversation_phase: 'negotiation',
    detected_patterns: [],
    manipulation_score: 0,
    opportunity_score: 0,
    hesitation_markers: [],
    power_dynamics: 0.5,
    stalemate_risk: 0.3,
    session_id: sessionId
  };

  // Send to backend
  ws.send(JSON.stringify({
    type: 'transcript',
    data: transcript
  }));

  console.log(`📤 Sent phrase ${currentPhraseIndex + 1}/${TEST_PHRASES.length}:`, phrase.text);

  // Display locally immediately
  displayTranscript(transcript);

  // Move to next phrase
  currentPhraseIndex = (currentPhraseIndex + 1) % TEST_PHRASES.length;
}

// Handle WebSocket messages
function handleMessage(data) {
  const { type, data: messageData } = data;

  switch (type) {
    case 'suggestion':
      displaySuggestion(messageData);
      break;

    case 'transcript':
      displayTranscript(messageData);
      break;

    case 'alert':
      showNotification(messageData.message || 'Alert', 'warning');
      break;

    case 'status':
      console.log('Status:', messageData);
      break;

    default:
      console.log('Unknown message type:', type);
  }
}

// Display suggestion
function displaySuggestion(suggestion) {
  const container = document.getElementById('negotiai-suggestions');

  // Remove empty state
  const empty = container.querySelector('.negotiai-empty');
  if (empty) {
    empty.remove();
  }

  const suggestionEl = document.createElement('div');
  suggestionEl.className = `negotiai-suggestion negotiai-priority-${suggestion.priority}`;

  const typeIcons = {
    counter: '🛡️',
    question: '❓',
    warning: '⚠️',
    opportunity: '✨',
    close: '🎯'
  };

  suggestionEl.innerHTML = `
    <div class="negotiai-suggestion-header">
      <span class="negotiai-suggestion-icon">${typeIcons[suggestion.type] || '💡'}</span>
      <span class="negotiai-suggestion-type">${suggestion.type}</span>
      <span class="negotiai-suggestion-priority">${suggestion.priority}</span>
    </div>
    <div class="negotiai-suggestion-text">${suggestion.text}</div>
    <div class="negotiai-suggestion-reasoning">
      <strong>Why:</strong> ${suggestion.reasoning}
    </div>
    ${suggestion.auto_pilot_available ? '<div class="negotiai-autopilot-badge">🤖 Auto-Pilot Available</div>' : ''}
    <div class="negotiai-suggestion-footer">
      <span class="negotiai-confidence">Confidence: ${Math.round(suggestion.confidence * 100)}%</span>
      <span class="negotiai-timestamp">${new Date().toLocaleTimeString()}</span>
    </div>
  `;

  // Add to top
  container.insertBefore(suggestionEl, container.firstChild);

  // Keep only last 5 suggestions
  const suggestions = container.querySelectorAll('.negotiai-suggestion');
  if (suggestions.length > 5) {
    suggestions[suggestions.length - 1].remove();
  }

  // Show notification for critical suggestions
  if (suggestion.priority === 'critical') {
    showNotification(suggestion.text, 'critical');
  }
}

// Display transcript
function displayTranscript(transcript) {
  const container = document.querySelector('.negotiai-transcript-list');

  const transcriptEl = document.createElement('div');
  transcriptEl.className = `negotiai-transcript-item negotiai-speaker-${transcript.speaker}`;

  transcriptEl.innerHTML = `
    <div class="negotiai-transcript-header">
      <span class="negotiai-speaker">${transcript.speaker === 'user' ? 'You' : 'Counterparty'}</span>
      <span class="negotiai-time">${new Date(transcript.timestamp * 1000).toLocaleTimeString()}</span>
    </div>
    <div class="negotiai-transcript-text">${transcript.transcript}</div>
    ${transcript.emotion ? `<span class="negotiai-emotion">${transcript.emotion}</span>` : ''}
  `;

  container.insertBefore(transcriptEl, container.firstChild);

  // Keep only last 10 transcripts
  const transcripts = container.querySelectorAll('.negotiai-transcript-item');
  if (transcripts.length > 10) {
    transcripts[transcripts.length - 1].remove();
  }
}

// Update status
function updateStatus(status, text) {
  const dot = document.querySelector('.negotiai-status-dot');
  const statusText = document.querySelector('.negotiai-status-text');

  if (dot) {
    dot.className = `negotiai-status-dot negotiai-status-${status}`;
  }

  if (statusText) {
    statusText.textContent = text;
  }
}

// Update connect button
function updateConnectButton(connected) {
  const btn = document.getElementById('negotiai-connect');
  if (btn) {
    btn.textContent = connected ? 'Disconnect' : 'Connect';
    btn.className = connected ? 'negotiai-btn-danger' : 'negotiai-btn-primary';
  }

  // Enable/disable audio button based on connection
  const audioBtn = document.getElementById('negotiai-start-audio');
  if (audioBtn) {
    audioBtn.disabled = !connected;
  }
}

// Update simulate button
function updateSimulateButton(enabled, running = false) {
  const btn = document.getElementById('negotiai-simulate');
  if (btn) {
    btn.disabled = !enabled;
    btn.textContent = running ? 'Stop Sim' : 'Start Sim';
    btn.className = running ? 'negotiai-btn-danger' : 'negotiai-btn-secondary';
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `negotiai-notification negotiai-notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'negotiai-slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createOverlay);
} else {
  createOverlay();
}

// Start real audio capture
function startAudioCapture() {
  if (!isConnected) {
    showNotification('Connect to backend first!', 'warning');
    return;
  }

  console.log('🎤 Starting audio capture...');

  // Request background script to start capturing
  chrome.runtime.sendMessage({ action: 'start-audio-capture' }, (response) => {
    if (response && response.success) {
      isCapturingAudio = true;
      updateAudioButton(true);
      showNotification('Audio capture started - listening to Google Meet', 'info');
      console.log('✅ Audio capture started');
    } else {
      showNotification('Failed to start audio capture: ' + (response?.error || 'Unknown error'), 'error');
      console.error('Failed to start audio capture:', response);
    }
  });
}

// Stop audio capture
function stopAudioCapture() {
  console.log('⏹️ Stopping audio capture...');

  chrome.runtime.sendMessage({ action: 'stop-audio-capture' }, (response) => {
    isCapturingAudio = false;
    updateAudioButton(false);
    showNotification('Audio capture stopped', 'info');
    console.log('✅ Audio capture stopped');
  });
}

// Update audio button state
function updateAudioButton(capturing) {
  const btn = document.getElementById('negotiai-start-audio');
  if (btn) {
    btn.textContent = capturing ? '🎤 Stop Audio' : '🎤 Start Audio';
    btn.className = capturing ? 'negotiai-btn-danger' : 'negotiai-btn-secondary';
  }
}

// Listen for messages from background script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle-overlay') {
    const overlay = document.getElementById('negotiai-overlay');
    if (overlay) {
      overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
    }
    sendResponse({ success: true });
  }
  else if (request.action === 'audio-transcript') {
    // Received transcript from background script
    handleAudioTranscript(request.data);
    sendResponse({ success: true });
  }
  else if (request.action === 'audio-error') {
    console.error('Audio capture error:', request.error);
    showNotification('Audio error: ' + request.error, 'error');

    // Stop capture on error
    if (isCapturingAudio) {
      isCapturingAudio = false;
      updateAudioButton(false);
    }
    sendResponse({ success: true });
  }
  else {
    sendResponse({ success: true });
  }
});

// Handle audio transcript from background script
function handleAudioTranscript(data) {
  console.log('📝 Received audio transcript:', data);

  // Create transcript object for backend
  const transcript = {
    transcript: data.transcript,
    speaker: data.speaker,
    timestamp: data.timestamp,
    emotion: 'neutral', // Could be enhanced with emotion detection
    confidence_level: data.confidence || 0.8,
    conversation_phase: 'negotiation',
    detected_patterns: [],
    manipulation_score: 0,
    opportunity_score: 0,
    hesitation_markers: [],
    power_dynamics: 0.5,
    stalemate_risk: 0.3,
    session_id: sessionId
  };

  // Display transcript locally
  displayTranscript(transcript);

  // Send to backend if WebSocket is connected
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'transcript',
      data: transcript
    }));
    console.log('📤 Sent transcript to backend');
  } else {
    console.warn('WebSocket not connected, cannot send transcript');
  }
}
