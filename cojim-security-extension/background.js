import {
  addFlaggedComment,
  getFlaggedComments,
  removeFlaggedComment,
  autoDeleteOldComments
} from './utils/commentManager.js';
import { notifyAdmin } from './utils/notifier.js';
import { translateText } from './utils/translation.js';

const STORAGE_KEYS = {
  FLAGGED_COMMENTS: 'flaggedComments',
  LIVE_STREAMS: 'flaggedLiveStreams',
  UPLOAD_POSTS: 'flaggedUploadPosts',
};

const adminEmails = ['info@cojim.org', 'christopherorjiministries@gmail.com'];

// Notification queue and throttle control
let notificationQueue = [];
let notificationInProgress = false;
const NOTIFICATION_THROTTLE_MS = 1000; // Minimum delay between notifications

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

function processNotificationQueue() {
  if (notificationInProgress || notificationQueue.length === 0) {
    return;
  }
  notificationInProgress = true;
  const { subject, message } = notificationQueue.shift();
  notifyAdmin(subject, message);
  setTimeout(() => {
    notificationInProgress = false;
    processNotificationQueue();
  }, NOTIFICATION_THROTTLE_MS);
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    const timestampedData = {
      ...message.data,
      flaggedAt: Date.now(),
    };

    switch (message.type) {
      case 'FLAG_COMMENT':
        // Translate comment text before storing and notifying
        const translatedText = await translateText(timestampedData.text);
        timestampedData.translatedText = translatedText;

        await addFlaggedComment(timestampedData);
        const subject = timestampedData.highRisk ? 'High-Risk Flagged Comment Detected' : 'Flagged Comment Detected';
        const notificationMessage = translatedText || timestampedData.text || 'A comment was flagged.';
        // Queue notification for throttling
        notificationQueue.push({ subject, message: notificationMessage });
        processNotificationQueue();

        sendEmail(adminEmails, `COJIM Security Extension - ${subject}`, JSON.stringify(timestampedData, null, 2));
        console.log('Flagged comment processed:', timestampedData);
        sendResponse({ status: 'received' });
        break;

      case 'FLAG_LIVE_STREAM':
        await appendToStorage(STORAGE_KEYS.LIVE_STREAMS, timestampedData);
        notificationQueue.push({ subject: 'Live Stream Detected', message: `Live stream detected on ${timestampedData.platform}` });
        processNotificationQueue();
        sendResponse({ status: 'received' });
        break;

      case 'FLAG_UPLOAD_POST':
        await appendToStorage(STORAGE_KEYS.UPLOAD_POSTS, timestampedData);
        notificationQueue.push({ subject: 'Upload Post Detected', message: `Upload post detected on ${timestampedData.platform}` });
        processNotificationQueue();
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
