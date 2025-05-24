import { checkSpamStatus } from '../utils/spamRules.js';
import { getTargetAccounts } from '../utils/storage.js';

const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;

console.log('Facebook Scanner loaded');

async function scanComments() {
  const targetAccounts = await getTargetAccounts();
  if (!window.location.href.includes(targetAccounts.facebook)) {
    console.log('Facebook Scanner: Not target page, skipping scan.');
    return;
  }

  const commentElements = document.querySelectorAll('[aria-label="Comment"] div[dir="auto"] span');
  for (const el of commentElements) {
    const text = el.textContent || '';
    const { spam, highRisk } = await checkSpamStatus(text);
    if (spam) {
      runtime.sendMessage({
        type: 'FLAG_COMMENT',
        data: {
          text,
          platform: 'Facebook',
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
  if (!window.location.href.includes(targetAccounts.facebook)) {
    return;
  }

  const isLive = !!document.querySelector('[aria-label="Live video"]');
  if (isLive) {
    runtime.sendMessage({
      type: 'FLAG_LIVE_STREAM',
      data: {
        platform: 'Facebook',
        url: window.location.href,
        timestamp: Date.now()
      }
    });
  }

  const postTimes = document.querySelectorAll('abbr[data-utime]');
  postTimes.forEach(el => {
    const postTime = parseInt(el.getAttribute('data-utime')) * 1000;
    const hoursAgo = (Date.now() - postTime) / (1000 * 60 * 60);
    if (hoursAgo < 24) {
      runtime.sendMessage({
        type: 'FLAG_UPLOAD_POST',
        data: {
          platform: 'Facebook',
          url: window.location.href,
          timestamp: Date.now(),
          info: `Post uploaded ${Math.floor(hoursAgo)} hours ago`
        }
      });
    }
  });
}

const commentsContainer = document.querySelector('[aria-label="Comments"]');
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
  console.warn('Facebook comments container not found');
}
