// utils/analytics.js - User behavior analytics for identifying potential spammers or malicious accounts

import { getStorage, setStorage, STORAGE_KEYS } from './storage.js';

const USER_BEHAVIOR_KEY = 'userBehaviorData';

// Record a user action such as posting a comment
async function recordUserAction(userId, actionType, metadata = {}) {
  const data = await getStorage(USER_BEHAVIOR_KEY) || {};
  if (!data[userId]) {
    data[userId] = {
      actions: [],
      flaggedCount: 0,
      lastActionTimestamp: null,
    };
  }
  data[userId].actions.push({
    type: actionType,
    metadata,
    timestamp: Date.now(),
  });
  data[userId].lastActionTimestamp = Date.now();
  await setStorage(USER_BEHAVIOR_KEY, data);
}

// Increment flagged count for a user
async function incrementFlaggedCount(userId) {
  const data = await getStorage(USER_BEHAVIOR_KEY) || {};
  if (!data[userId]) {
    data[userId] = {
      actions: [],
      flaggedCount: 0,
      lastActionTimestamp: null,
    };
  }
  data[userId].flaggedCount += 1;
  await setStorage(USER_BEHAVIOR_KEY, data);
}

// Analyze user behavior to detect suspicious patterns
async function analyzeUserBehavior(userId) {
  const data = await getStorage(USER_BEHAVIOR_KEY) || {};
  const userData = data[userId];
  if (!userData) return { suspicious: false, reasons: [] };

  const reasons = [];
  // Example heuristic: flagged count threshold
  if (userData.flaggedCount > 5) {
    reasons.push('High number of flagged comments');
  }
  // Example heuristic: rapid posting (actions within short intervals)
  const now = Date.now();
  const recentActions = userData.actions.filter(a => now - a.timestamp < 60000); // last 1 min
  if (recentActions.length > 10) {
    reasons.push('High frequency of actions in last minute');
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}

// Get all user behavior data (for analytics dashboard)
async function getAllUserBehaviorData() {
  return await getStorage(USER_BEHAVIOR_KEY) || {};
}

export {
  recordUserAction,
  incrementFlaggedCount,
  analyzeUserBehavior,
  getAllUserBehaviorData,
};
