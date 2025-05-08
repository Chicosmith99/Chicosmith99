// storage.js - Modular storage logic for flagged data and settings

const STORAGE_KEYS = {
  FLAGGED_COMMENTS: 'flaggedComments',
  WHITELIST: 'whitelist',
  BLACKLIST: 'blacklist',
  SETTINGS: 'settings',
  TARGET_ACCOUNTS: 'targetAccounts',
};

async function getTargetAccounts() {
  return (await getStorage(STORAGE_KEYS.TARGET_ACCOUNTS)) || { youtube: '', facebook: '' };
}

async function setTargetAccounts(accounts) {
  await setStorage(STORAGE_KEYS.TARGET_ACCOUNTS, accounts);
}

async function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || null);
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

async function addFlaggedComment(comment) {
  const comments = (await getStorage(STORAGE_KEYS.FLAGGED_COMMENTS)) || [];
  comments.push(comment);
  await setStorage(STORAGE_KEYS.FLAGGED_COMMENTS, comments);
}

async function getFlaggedComments() {
  return (await getStorage(STORAGE_KEYS.FLAGGED_COMMENTS)) || [];
}

export {
  STORAGE_KEYS,
  getStorage,
  setStorage,
  addFlaggedComment,
  getFlaggedComments,
};
