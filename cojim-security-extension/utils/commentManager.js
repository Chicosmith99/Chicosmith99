// utils/commentManager.js

const STORAGE_KEYS = {
  FLAGGED_COMMENTS: 'flaggedComments',
  WHITELIST: 'whitelistUsers',
  BLACKLIST: 'blacklistPatterns'
};

// Utility to get data from storage
async function getFromStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || []);
    });
  });
}

async function setInStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}

export async function addFlaggedComment(comment) {
  const whitelist = await getFromStorage(STORAGE_KEYS.WHITELIST);
  const blacklist = await getFromStorage(STORAGE_KEYS.BLACKLIST);

  const isWhitelisted = whitelist.includes(comment.username);
  const isBlacklisted = blacklist.some(pattern => new RegExp(pattern, 'i').test(comment.text));

  if (isWhitelisted) {
    console.log(`Skipped whitelisted user: ${comment.username}`);
    return;
  }

  if (!isBlacklisted) {
    console.log(`Comment did not match any blacklist pattern.`);
    return;
  }

  const comments = await getFromStorage(STORAGE_KEYS.FLAGGED_COMMENTS);
  comments.push(comment);
  await setInStorage(STORAGE_KEYS.FLAGGED_COMMENTS, comments);
}

export async function getFlaggedComments() {
  return await getFromStorage(STORAGE_KEYS.FLAGGED_COMMENTS);
}

export async function removeFlaggedComment(index) {
  const comments = await getFromStorage(STORAGE_KEYS.FLAGGED_COMMENTS);
  comments.splice(index, 1);
  await setInStorage(STORAGE_KEYS.FLAGGED_COMMENTS, comments);
}

export async function autoDeleteOldComments(days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const comments = await getFromStorage(STORAGE_KEYS.FLAGGED_COMMENTS);
  const filtered = comments.filter(c => c.flaggedAt > cutoff);
  await setInStorage(STORAGE_KEYS.FLAGGED_COMMENTS, filtered);
  return filtered;
}

// Utility functions to manage whitelist/blacklist
export async function updateWhitelist(users) {
  await setInStorage(STORAGE_KEYS.WHITELIST, users);
}

export async function updateBlacklist(patterns) {
  await setInStorage(STORAGE_KEYS.BLACKLIST, patterns);
}

export async function getWhitelist() {
  return await getFromStorage(STORAGE_KEYS.WHITELIST);
}

export async function getBlacklist() {
  return await getFromStorage(STORAGE_KEYS.BLACKLIST);
}
