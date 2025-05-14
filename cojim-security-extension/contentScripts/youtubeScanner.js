import { isSpam } from '../utils/spamRules.js';
import { getTargetAccounts } from '../utils/storage.js';

console.log('YouTube Scanner loaded');

async function scanComments() {
  const targetAccounts = await getTargetAccounts();
  if (!window.location.href.includes(targetAccounts.youtube)) {
    console.log('YouTube Scanner: Not target channel, skipping scan.');
    return;
  }

  const commentElements = document.querySelectorAll('#contents #content-text');

  commentElements.forEach(commentEl => {
    const text = commentEl.textContent || '';
    if (isSpam(text)) {
      chrome.runtime.sendMessage({
        type: 'FLAG_COMMENT',
        data: {
          text,
          platform: 'YouTube',
          url: window.location.href,
          timestamp: Date.now(),
        }
      });
    }
  });
}

// Detect live stream status and uploads
async function detectLiveStreamAndUploads() {
  const targetAccounts = await getTargetAccounts();
  if (!window.location.href.includes(targetAccounts.youtube)) {
    console.log('YouTube Scanner: Not target channel, skipping live stream/upload detection.');
    return;
  }

  // Detect live stream by checking for live badge or live video player
  const liveBadge = document.querySelector('.ytp-live-badge');
  const isLive = liveBadge !== null;

  if (isLive) {
    chrome.runtime.sendMessage({
      type: 'FLAG_LIVE_STREAM',
      data: {
        platform: 'YouTube',
        url: window.location.href,
        timestamp: Date.now(),
      }
    });
  }

  // Detect recent uploads by checking video upload date elements on channel page
  // This is a simplified example; real implementation may require more complex logic
  const uploadElements = document.querySelectorAll('#contents ytd-grid-video-renderer #metadata-line span:nth-child(2)');
  uploadElements.forEach(uploadEl => {
    const uploadText = uploadEl.textContent || '';
    if (uploadText.includes('ago')) {
      chrome.runtime.sendMessage({
        type: 'FLAG_UPLOAD_POST',
        data: {
          platform: 'YouTube',
          url: window.location.href,
          timestamp: Date.now(),
          info: uploadText,
        }
      });
    }
  });
}

const commentForm = document.querySelector('ytd-comment-simplebox-renderer form');
if (commentForm) {
  commentForm.addEventListener('submit', () => {
    setTimeout(() => {
      scanComments();
    }, 1000);
  });
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    scanComments();
    detectLiveStreamAndUploads();
  });
});

const commentsContainer = document.getElementById('contents');
if (commentsContainer) {
  observer.observe(commentsContainer, { childList: true, subtree: true });
  scanComments();
  detectLiveStreamAndUploads();

  // Periodic scan every 5 seconds to ensure timely detection
  setInterval(scanComments, 5000);
} else {
  console.warn('YouTube comments container not found');
  removeScanningIndicator();
}

const commentsContainer = document.getElementById('contents');
if (commentsContainer) {
  observer.observe(commentsContainer, { childList: true, subtree: true });
  async function scanComments() {
  const targetAccounts = await getTargetAccounts();
  if (!window.location.href.includes(targetAccounts.youtube)) {
    console.log('YouTube Scanner: Not target channel, skipping scan.');
    removeScanningIndicator();
    return;
  }

  addScanningIndicator();

  const commentElements = document.querySelectorAll('#contents #content-text');

  commentElements.forEach(commentEl => {
    const text = commentEl.textContent || '';
    if (isSpam(text)) {
      chrome.runtime.sendMessage({
        type: 'FLAG_COMMENT',
        data: {
          text,
          platform: 'YouTube',
          url: window.location.href,
          timestamp: Date.now(),
        }
      });
    }
  });
}

  detectLiveStreamAndUploads();

  // Periodic scan every 5 seconds to ensure timely detection
  setInterval(scanComments, 5000);
} else {
  console.warn('YouTube comments container not found');
}
// Add a visible scanning indicator to the page
function addScanningIndicator() {
  let indicator = document.getElementById('cojim-scanning-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'cojim-scanning-indicator';
    indicator.style.position = 'fixed';
    indicator.style.bottom = '10px';
    indicator.style.right = '10px';
    indicator.style.padding = '5px 10px';
    indicator.style.backgroundColor = 'rgba(0, 123, 255, 0.8)';
    indicator.style.color = 'white';
    indicator.style.fontSize = '12px';
    indicator.style.borderRadius = '4px';
    indicator.style.zIndex = '10000';
    indicator.style.fontFamily = 'Arial, sans-serif';
    indicator.textContent = 'COJIM Scanning Comments...';
    document.body.appendChild(indicator);
  }
}

// Remove the scanning indicator from the page
function removeScanningIndicator() {
  const indicator = document.getElementById('cojim-scanning-indicator');
  if (indicator) {
    indicator.remove();
  }
}
