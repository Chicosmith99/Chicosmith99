import { addFlaggedComment, getFlaggedComments, removeFlaggedComment, autoDeleteOldComments } from './utils/commentManager.js';
import { notifyAdmin } from './utils/notifier.js';

// Background script for COJIM Social Media Security Extension

// Placeholder function to send email - to be implemented with an email API
function sendEmail(toAddresses, subject, body) {
  console.log('Sending email to:', toAddresses);
  console.log('Subject:', subject);
  console.log('Body:', body);
  // TODO: Integrate with an email sending service API
}

// Listener for messages from content scripts and popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'FLAG_COMMENT') {
    const flaggedComment = {
      ...message.data,
      flaggedAt: Date.now(),
    };
    // Store flagged comment
    await addFlaggedComment(flaggedComment);

    // Send browser notification
    notifyAdmin('Flagged Comment Detected', flaggedComment.text || 'A comment was flagged.');

    // Send email to admin addresses
    const adminEmails = ['info@cojim.org', 'christopherorjiministries@gmail.com'];
    const subject = 'COJIM Security Extension - Flagged Comment Alert';
    const body = `A comment was flagged:\n\n${JSON.stringify(flaggedComment, null, 2)}`;
    sendEmail(adminEmails, subject, body);

    console.log('Flagged comment processed:', flaggedComment);
    sendResponse({ status: 'received' });
    return true; // Keep the message channel open for async response
  }
  if (message.type === 'GET_FLAGGED_COMMENTS') {
    const comments = await getFlaggedComments();
    sendResponse({ status: 'success', comments });
    return true;
  }
  if (message.type === 'REMOVE_FLAGGED_COMMENT') {
    await removeFlaggedComment(message.index);
    sendResponse({ status: 'removed' });
    return true;
  }
  return false;
});

// Auto-delete old comments on startup
autoDeleteOldComments().then((filtered) => {
  console.log('Auto-deleted old flagged comments, remaining:', filtered.length);
});

console.log('Background script initialized');

