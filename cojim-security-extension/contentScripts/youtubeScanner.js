import { checkSpamStatus } from '../utils/spamRules.js';
import { getTargetAccounts } from '../utils/storage.js';

console.log('YouTube Scanner loaded');

async function scanComments() {
  const targetAccounts = await getTargetAccounts();
  if (!window.location.href.includes(targetAccounts.youtube)) {
    console.log('YouTube Scanner: Not target page, skipping scan.');
    return;
  }

  // Scan historical comments on videos
  const historicalComments = document.querySelectorAll('#contents #content-text');
  for (const commentEl of historicalComments) {
    const text = commentEl.textContent || '';
    const { spam, highRisk } = await checkSpamStatus(text);
    if (spam) {
      chrome.runtime.sendMessage({
        type: 'FLAG_COMMENT',
        data: {
          text,
          platform: 'YouTube',
          url: window.location.href,
          timestamp: Date.now(),
          info: 'Historical comment',
          highRisk,
        }
      });
    }
  }
}

// Detect live stream status and uploads
async function detectLiveStreamAndUploads() {
  const targetAccounts = await getTargetAccounts();
  if (!window.location.href.includes(targetAccounts.youtube)) {
    console.log('YouTube Scanner: Not target page, skipping live stream/upload detection.');
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

  // Detect recent uploads by checking video publish date
  const publishDateEl = document.querySelector('#info-strings yt-formatted-string');
  if (publishDateEl) {
    const publishText = publishDateEl.textContent || '';
    // Simple heuristic: if published within last 24 hours
    if (publishText.includes('hour') || publishText.includes('minute')) {
      chrome.runtime.sendMessage({
        type: 'FLAG_UPLOAD_POST',
        data: {
          platform: 'YouTube',
          url: window.location.href,
          timestamp: Date.now(),
          info: `Video published recently: ${publishText}`,
        }
      });
    }
  }
}

const commentObserver = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    scanComments();
    detectLiveStreamAndUploads();
  });
});

const commentsContainer = document.getElementById('comments');
if (commentsContainer) {
  commentObserver.observe(commentsContainer, { childList: true, subtree: true });
  scanComments();
  detectLiveStreamAndUploads();

  // Periodic scan every 5 seconds to ensure timely detection
  setInterval(scanComments, 5000);
} else {
  console.warn('YouTube comments container not found');
}
