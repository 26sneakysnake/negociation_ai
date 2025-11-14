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
        <button id="negotiai-connect" class="negotiai-btn-primary">Connect</button>
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
  if (ws) {
    ws.close();
    ws = null;
  }
  isConnected = false;
  updateStatus('disconnected', 'Disconnected');
  updateConnectButton(false);
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

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle-overlay') {
    const overlay = document.getElementById('negotiai-overlay');
    if (overlay) {
      overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
    }
  }
  sendResponse({ success: true });
});
