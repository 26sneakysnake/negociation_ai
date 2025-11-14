/**
 * NegotiAI Coach - Popup Script
 */

// Check backend status
async function checkBackendStatus() {
  const dot = document.getElementById('backend-dot');
  const text = document.getElementById('backend-text');

  try {
    const response = await fetch('http://localhost:8000/api/health');
    if (response.ok) {
      dot.classList.remove('disconnected');
      dot.classList.add('connected');
      text.textContent = 'Connected';
    } else {
      throw new Error('Backend not responding');
    }
  } catch (error) {
    dot.classList.remove('connected');
    dot.classList.add('disconnected');
    text.textContent = 'Offline';
  }
}

// Open full app
document.getElementById('open-app').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000' });
});

// Toggle overlay
document.getElementById('toggle-overlay').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'toggle-overlay' });
});

// Check status on load
checkBackendStatus();

// Refresh status every 5 seconds
setInterval(checkBackendStatus, 5000);
