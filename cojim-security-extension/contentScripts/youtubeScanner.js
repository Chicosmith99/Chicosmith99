import { checkSpamStatus } from '../utils/spamRules.js';
import { getTargetAccounts } from '../utils/storage.js';

const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;

console.log('YouTube Scanner loaded');

async function scanComments() {
  const targetAccounts = await getTargetAccounts();
  if (!window.location.href.includes(targetAccounts.youtube)) {
    console.log('YouTube Scanner: Not target page, skipping scan.');
    return;
  }

  const commentElements = document.querySelectorAll('#contents #content-text');
  for (const el of commentElements) {
    const text = el.textContent || '';
    const { spam, highRisk } = await checkSpamStatus(text);
    if (spam) {
      runtime.sendMessage({
        type: 'FLAG_COMMENT',
        data: {
          text,
          platform: 'YouTube',
          url: window.location.href,
          timestamp: Date.now(),
          info: 'Historical comment',
          highRisk
        }
      });
    }
  }
}

async function detectLiveStreamAndUploads() {
  const targetAccounts = await getTargetAccounts();
  if (!window.location.href.includes(targetAccounts.youtube)) {
    return;
  }

  const isLive = !!document.querySelector('.ytp-live-badge');
  if (isLive) {
    runtime.sendMessage({
      type: 'FLAG_LIVE_STREAM',
      data: {
        platform: 'YouTube',
        url: window.location.href,
        timestamp: Date.now()
      }
    });
  }

  const publishDateEl = document.querySelector('#info-strings yt-formatted-string');
  if (publishDateEl) {
    const publishText = publishDateEl.textContent || '';
    if (publishText.includes('hour') || publishText.includes('minute')) {
      runtime.sendMessage({
        type: 'FLAG_UPLOAD_POST',
        data: {
          platform: 'YouTube',
          url: window.location.href,
          timestamp: Date.now(),
          info: `Video published recently: ${publishText}`
        }
      });
    }
  }
}

const commentsContainer = document.getElementById('comments');
if (commentsContainer) {
  const observer = new MutationObserver(() => {
    scanComments();
    detectLiveStreamAndUploads();
  });

  observer.observe(commentsContainer, { childList: true, subtree: true });

  scanComments();
  detectLiveStreamAndUploads();
  setInterval(scanComments, 5000);
} else {
  console.warn('YouTube comments container not found');
}
