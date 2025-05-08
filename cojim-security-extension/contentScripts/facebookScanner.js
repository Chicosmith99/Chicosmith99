import { isSpam } from '../utils/spamRules.js';
import { getTargetAccounts } from '../utils/storage.js';

console.log('Facebook Scanner loaded');

async function scanComments() {
  const targetAccounts = await getTargetAccounts();
  // Check if current page URL matches target Facebook page URL
  if (!window.location.href.includes(targetAccounts.facebook)) {
    console.log('Facebook Scanner: Not target page, skipping scan.');
    return;
  }

  // Select comment elements - example selector for Facebook comments
  const commentElements = document.querySelectorAll('[aria-label="Comment"] div[dir="auto"] span');

  commentElements.forEach(commentEl => {
    const text = commentEl.textContent || '';
    if (isSpam(text)) {
      // Send flagged comment to background script
      chrome.runtime.sendMessage({
        type: 'FLAG_COMMENT',
        data: {
          text,
          platform: 'Facebook',
          url: window.location.href,
          timestamp: Date.now(),
        }
      });
    }
  });
}

// Hook into comment submission for immediate detection
const commentForms = document.querySelectorAll('[aria-label="Write a comment"] form');
commentForms.forEach(form => {
  form.addEventListener('submit', () => {
    setTimeout(() => {
      scanComments();
    }, 1000); // Delay to allow comment to appear in DOM
  });
});

// Observe for new comments added dynamically
const observer = new MutationObserver((mutations) => {
  mutations.forEach(() => {
    scanComments();
  });
});

// Start observing the comments container
const commentsContainer = document.querySelector('[aria-label="Comments"]');
if (commentsContainer) {
  observer.observe(commentsContainer, { childList: true, subtree: true });
  // Initial scan
  scanComments();
} else {
  console.warn('Facebook comments container not found');
}
