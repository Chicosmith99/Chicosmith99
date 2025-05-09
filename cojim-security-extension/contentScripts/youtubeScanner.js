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
}
