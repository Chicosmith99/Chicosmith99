import { addFlaggedComment, getFlaggedComments, removeFlaggedComment, autoDeleteOldComments } from './utils/commentManager.js';
import { notifyAdmin } from './utils/notifier.js';

const STORAGE_KEYS = {
  FLAGGED_COMMENTS: 'flaggedComments',
  LIVE_STREAMS: 'flaggedLiveStreams',
  UPLOAD_POSTS: 'flaggedUploadPosts',
};

async function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || []);
    });
  });
}

async function setStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}

async function addFlaggedLiveStream(liveStream) {
  const liveStreams = await getStorage(STORAGE_KEYS.LIVE_STREAMS);
  liveStreams.push(liveStream);
  await setStorage(STORAGE_KEYS.LIVE_STREAMS, liveStreams);
}

async function addFlaggedUploadPost(uploadPost) {
  const uploadPosts = await getStorage(STORAGE_KEYS.UPLOAD_POSTS);
  uploadPosts.push(uploadPost);
  await setStorage(STORAGE_KEYS.UPLOAD_POSTS, uploadPosts);
}

function sendEmail(toAddresses, subject, body) {
  console.log('Sending email to:', toAddresses);
  console.log('Subject:', subject);
  console.log('Body:', body);
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'FLAG_COMMENT') {
    const flaggedComment = {
      ...message.data,
      flaggedAt: Date.now(),
    };
    await addFlaggedComment(flaggedComment);
    notifyAdmin('Flagged Comment Detected', flaggedComment.text || 'A comment was flagged.');
    const adminEmails = ['info@cojim.org', 'christopherorjiministries@gmail.com'];
    const subject = 'COJIM Security Extension - Flagged Comment Alert';
    const body = `A comment was flagged:\n\n${JSON.stringify(flaggedComment, null, 2)}`;
    sendEmail(adminEmails, subject, body);
    console.log('Flagged comment processed:', flaggedComment);
    sendResponse({ status: 'received' });
    return true;
  }
  if (message.type === 'FLAG_LIVE_STREAM') {
    const flaggedLiveStream = {
      ...message.data,
      flaggedAt: Date.now(),
    };
    await addFlaggedLiveStream(flaggedLiveStream);
    notifyAdmin('Live Stream Detected', `Live stream detected on ${flaggedLiveStream.platform}`);
    sendResponse({ status: 'received' });
    return true;
  }
  if (message.type === 'FLAG_UPLOAD_POST') {
    const flaggedUploadPost = {
      ...message.data,
      flaggedAt: Date.now(),
    };
    await addFlaggedUploadPost(flaggedUploadPost);
    notifyAdmin('Upload Post Detected', `Upload post detected on ${flaggedUploadPost.platform}`);
    sendResponse({ status: 'received' });
    return true;
  }
  if (message.type === 'GET_FLAGGED_COMMENTS') {
    const comments = await getFlaggedComments();
    sendResponse({ status: 'success', comments });
    return true;
  }
  return false;
});

autoDeleteOldComments().then((filtered) => {
  console.log('Auto-deleted old flagged comments, remaining:', filtered.length);
});

console.log('Background service worker initialized');
