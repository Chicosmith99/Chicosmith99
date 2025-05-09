import {
  addFlaggedComment,
  getFlaggedComments,
  removeFlaggedComment,
  autoDeleteOldComments
} from './utils/commentManager.js';
import { notifyAdmin } from './utils/notifier.js';

const STORAGE_KEYS = {
  FLAGGED_COMMENTS: 'flaggedComments',
  LIVE_STREAMS: 'flaggedLiveStreams',
  UPLOAD_POSTS: 'flaggedUploadPosts',
};

const adminEmails = ['info@cojim.org', 'christopherorjiministries@gmail.com'];

async function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || []);
    });
  });
}

async function setStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}

async function appendToStorage(key, item) {
  const items = await getStorage(key);
  items.push(item);
  await setStorage(key, items);
}

function sendEmail(toAddresses, subject, body) {
  // Replace this with a call to your backend or email service API
  console.log('Pretend email to:', toAddresses);
  console.log('Subject:', subject);
  console.log('Body:', body);
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    const timestampedData = {
      ...message.data,
      flaggedAt: Date.now(),
    };

    switch (message.type) {
      case 'FLAG_COMMENT':
        await addFlaggedComment(timestampedData);
        notifyAdmin('Flagged Comment Detected', timestampedData.text || 'A comment was flagged.');
        sendEmail(adminEmails, 'COJIM Security Extension - Flagged Comment Alert', JSON.stringify(timestampedData, null, 2));
        console.log('Flagged comment processed:', timestampedData);
        sendResponse({ status: 'received' });
        break;

      case 'FLAG_LIVE_STREAM':
        await appendToStorage(STORAGE_KEYS.LIVE_STREAMS, timestampedData);
        notifyAdmin('Live Stream Detected', `Live stream detected on ${timestampedData.platform}`);
        sendResponse({ status: 'received' });
        break;

      case 'FLAG_UPLOAD_POST':
        await appendToStorage(STORAGE_KEYS.UPLOAD_POSTS, timestampedData);
        notifyAdmin('Upload Post Detected', `Upload post detected on ${timestampedData.platform}`);
        sendResponse({ status: 'received' });
        break;

      case 'GET_FLAGGED_COMMENTS':
        const comments = await getFlaggedComments();
        sendResponse({ status: 'success', comments });
        break;

      default:
        sendResponse({ status: 'ignored', reason: 'Unknown message type' });
    }

    return true; // Keeps message channel open for async sendResponse
  } catch (error) {
    console.error('Error handling message:', message.type, error);
    sendResponse({ status: 'error', message: error.message });
    return true;
  }
});

// Cleanup old data
autoDeleteOldComments()
  .then(filtered => {
    console.log('Auto-deleted old flagged comments, remaining:', filtered.length);
  })
  .catch(error => {
    console.error('Error auto-deleting old comments:', error);
  });

console.log('Background script initialized');
