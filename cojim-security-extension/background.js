// Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg",
  authDomain: "cojim-social-media-security-e.firebaseapp.com",
  projectId: "cojim-social-media-security-e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Remote Config Loader
import { fetchRemoteConfig } from './utils/remoteConfig.js';
let remoteConfig = {
  adminEmails: ['info@cojim.org'],
  whitelist: [],
  customSpamPatterns: [],
  keywords: [],
  aiModerationEnabled: true
};

async function loadRemoteConfig() {
  const data = await fetchRemoteConfig();
  remoteConfig = { ...remoteConfig, ...data };
  console.log('🔥 Remote config loaded:', remoteConfig);
}

loadRemoteConfig();
setInterval(loadRemoteConfig, 10 * 60 * 1000);

// Core Modules
import {
  addFlaggedComment,
  getFlaggedComments,
  removeFlaggedComment,
  autoDeleteOldComments
} from './utils/commentManager.js';

import { notifyAdmin } from './utils/notifier.js';
import { translateText } from './utils/translation.js';

// Browser compatibility polyfill
if (typeof browser === "undefined") {
  var browser = chrome;
}

// Constants
const GOOGLE_API_KEY = 'AIzaSyBpFdVyshiqKem_8sPF-yNhpSetNbd6Qkg';

const STORAGE_KEYS = {
  FLAGGED_COMMENTS: 'flaggedComments',
  LIVE_STREAMS: 'flaggedLiveStreams',
  UPLOAD_POSTS: 'flaggedUploadPosts'
};

// Local Notification Queue
let notificationQueue = [];
let notificationInProgress = false;
const NOTIFICATION_THROTTLE_MS = 1000;

// Utility: Local storage wrappers
async function getStorage(key) {
  return new Promise(resolve => {
    browser.storage.local.get([key], result => resolve(result[key] || []));
  });
}

async function setStorage(key, value) {
  return new Promise(resolve => {
    browser.storage.local.set({ [key]: value }, () => resolve());
  });
}

async function appendToStorage(key, item) {
  const items = await getStorage(key);
  items.push(item);
  await setStorage(key, items);
}

// Mock Email Notification
function sendEmail(toAddresses, subject, body) {
  console.log('📧 Email to:', toAddresses);
  console.log('📌 Subject:', subject);
  console.log('📝 Body:', body);
}

// Notification Processor
function processNotificationQueue() {
  if (notificationInProgress || notificationQueue.length === 0) return;
  notificationInProgress = true;
  const { subject, message } = notificationQueue.shift();
  notifyAdmin(subject, message);
  setTimeout(() => {
    notificationInProgress = false;
    processNotificationQueue();
  }, NOTIFICATION_THROTTLE_MS);
}

// Background Message Listener
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    const timestampedData = {
      ...message.data,
      flaggedAt: Date.now()
    };

    switch (message.type) {
      case 'FLAG_COMMENT': {
        const translated = await translateText(timestampedData.text, 'en', GOOGLE_API_KEY);
        timestampedData.translatedText = translated.translatedText;

        if (remoteConfig.aiModerationEnabled) {
          const { classifySentiment } = await import('./utils/sentimentClassifier.js');
          timestampedData.sentiment = await classifySentiment(translated.translatedText);
        }

        await addFlaggedComment(timestampedData);
        await addDoc(collection(db, "flaggedLogs"), timestampedData);

        const subject = timestampedData.highRisk
          ? 'High-Risk Flagged Comment Detected'
          : 'Flagged Comment Detected';

        notificationQueue.push({
          subject,
          message: translated.translatedText || timestampedData.text
        });
        processNotificationQueue();

        sendEmail(remoteConfig.adminEmails, `COJIM Security Extension - ${subject}`, JSON.stringify(timestampedData, null, 2));
        console.log('✅ Flagged comment processed:', timestampedData);
        sendResponse({ status: 'received' });
        break;
      }

      case 'FLAG_LIVE_STREAM':
        await appendToStorage(STORAGE_KEYS.LIVE_STREAMS, timestampedData);
        notificationQueue.push({
          subject: 'Live Stream Detected',
          message: `Live stream detected on ${timestampedData.platform}`
        });
        processNotificationQueue();
        sendResponse({ status: 'received' });
        break;

      case 'FLAG_UPLOAD_POST':
        await appendToStorage(STORAGE_KEYS.UPLOAD_POSTS, timestampedData);
        notificationQueue.push({
          subject: 'Upload Post Detected',
          message: `Upload post detected on ${timestampedData.platform}`
        });
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

    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    sendResponse({ status: 'error', message: error.message });
    return true;
  }
});

// Clean-up old logs on startup
autoDeleteOldComments()
  .then(filtered => {
    console.log('🧹 Cleaned old flagged comments:', filtered.length);
  })
  .catch(error => {
    console.error('🧨 Cleanup error:', error);
  });

// 📥 CSV Export Handler
document.getElementById("exportCSV").addEventListener("click", async () => {
  const q = query(collection(db, "flaggedLogs"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    alert("No logs available to export.");
    return;
  }

  const rows = [["Text", "Translated", "Sentiment", "Platform", "Timestamp"]];
  snapshot.forEach(doc => {
    const data = doc.data();
    rows.push([
      `"${data.text || ""}"`,
      `"${data.translatedText || ""}"`,
      data.sentiment || "neutral",
      data.platform || "Unknown",
      new Date(data.timestamp).toLocaleString()
    ]);
  });

  const csvContent = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `cojim_flagged_logs_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
