import { checkSpamStatus } from '../utils/spamRules.js';
import { getTargetAccounts } from '../utils/storage.js';

console.log('Facebook Scanner loaded');

async function scanComments() {
  const targetAccounts = await getTargetAccounts();
  if (!window.location.href.includes(targetAccounts.facebook)) {
    console.log('Facebook Scanner: Not target page, skipping scan.');
    return;
  }

  // Scan historical comments on posts
  const historicalComments = document.querySelectorAll('[aria-label="Comment"] div[dir="auto"] span');
  for (const commentEl of historicalComments) {
    const text = commentEl.textContent || '';
    const { spam, highRisk } = await checkSpamStatus(text);
    if (spam) {
      chrome.runtime.sendMessage({
        type: 'FLAG_COMMENT',
        data: {
          text,
          platform: 'Facebook',
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
  if (!window.location.href.includes(targetAccounts.facebook)) {
    console.log('Facebook Scanner: Not target page, skipping live stream/upload detection.');
    return;
  }

  // Detect live stream by checking for live badge or live video player
  const liveBadge = document.querySelector('[aria-label="Live video"]');
  const isLive = liveBadge !== null;

  if (isLive) {
    chrome.runtime.sendMessage({
      type: 'FLAG_LIVE_STREAM',
      data: {
        platform: 'Facebook',
        url: window.location.href,
        timestamp: Date.now(),
      }
    });
  }

  // Detect recent uploads by checking post timestamps on page
  const postTimeElements = document.querySelectorAll('abbr[data-utime]');
  postTimeElements.forEach(postEl => {
    const postTime = postEl.getAttribute('data-utime');
    if (postTime) {
      const postDate = new Date(parseInt(postTime) * 1000);
      const now = new Date();
      const diffHours = (now - postDate) / (1000 * 60 * 60);
      if (diffHours < 24) {
        chrome.runtime.sendMessage({
          type: 'FLAG_UPLOAD_POST',
          data: {
            platform: 'Facebook',
            url: window.location.href,
            timestamp: Date.now(),
            info: `Post uploaded ${Math.floor(diffHours)} hours ago`,
          }
        });
      }
    }
  });
}

const commentForms = document.querySelectorAll('[aria-label="Write a comment"] form');
commentForms.forEach(form => {
  form.addEventListener('submit', () => {
    setTimeout(() => {
      scanComments();
    }, 1000);
  });
});

const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    scanComments();
    detectLiveStreamAndUploads();
  });
});

const commentsContainer = document.querySelector('[aria-label="Comments"]');
if (commentsContainer) {
  observer.observe(commentsContainer, { childList: true, subtree: true });
  scanComments();
  detectLiveStreamAndUploads();

  // Periodic scan every 5 seconds to ensure timely detection
  setInterval(scanComments, 5000);
} else {
  console.warn('Facebook comments container not found');
}
