import { isSpam } from '../utils/spamRules.js';
import { getTargetAccounts } from '../utils/storage.js';

console.log('YouTube Scanner loaded');

async function scanComments() {
  const targetAccounts = await getTargetAccounts();
  // Check if current page URL matches target YouTube channel or video under that channel
  if (!window.location.href.includes(targetAccounts.youtube)) {
    console.log('YouTube Scanner: Not target channel, skipping scan.');
    return;
  }

  // Select comment elements - example selector for YouTube video comments
  const commentElements = document.querySelectorAll('#contents #content-text');

  commentElements.forEach(commentEl => {
    const text = commentEl.textContent || '';
    if (isSpam(text)) {
      // Send flagged comment to background script
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

// Hook into comment submission for immediate detection
const commentForm = document.querySelector('ytd-comment-simplebox-renderer form');
if (commentForm) {
  commentForm.addEventListener('submit', () => {
    setTimeout(() => {
      scanComments();
    }, 1000); // Delay to allow comment to appear in DOM
  });
}

// Observe for new comments added dynamically
const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    scanComments();
  });
});

// Start observing the comments container
const commentsContainer = document.getElementById('contents');
if (commentsContainer) {
  observer.observe(commentsContainer, { childList: true, subtree: true });
  // Initial scan
  scanComments();
} else {
  console.warn('YouTube comments container not found');
}
