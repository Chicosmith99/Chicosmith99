// commentManager.js - centralized management of flagged comments

const STORAGE_KEY = 'flaggedComments';

// Get all flagged comments from storage
export async function getFlaggedComments() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || []);
    });
  });
}

// Save flagged comments to storage
export async function saveFlaggedComments(comments) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: comments }, () => {
      resolve();
    });
  });
}

// Add a new flagged comment
export async function addFlaggedComment(comment) {
  const comments = await getFlaggedComments();
  comments.push(comment);
  await saveFlaggedComments(comments);
}

// Remove a flagged comment by index
export async function removeFlaggedComment(index) {
  const comments = await getFlaggedComments();
  comments.splice(index, 1);
  await saveFlaggedComments(comments);
}

// Auto-delete comments older than 30 days
export async function autoDeleteOldComments() {
  const comments = await getFlaggedComments();
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const filtered = comments.filter(c => now - c.flaggedAt < THIRTY_DAYS);
  if (filtered.length !== comments.length) {
    await saveFlaggedComments(filtered);
  }
  return filtered;
}
