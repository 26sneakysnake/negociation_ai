/**
 * NegotiAI Coach - Background Service Worker
 */

console.log('🎯 NegotiAI Coach: Background service worker loaded');

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
  }

  sendResponse({ success: true });
});
