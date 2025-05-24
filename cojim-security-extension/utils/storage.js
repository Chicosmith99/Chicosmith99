const STORAGE_KEYS = {
  CUSTOM_SPAM_PATTERNS: 'customSpamPatterns',
  WHITELIST: 'whitelist',
  BLACKLIST: 'blacklist',
};

// Polyfill: browser fallback
const storage = typeof browser !== 'undefined' ? browser.storage.local : chrome.storage.local;

async function getCustomSpamPatterns() {
  return new Promise((resolve) => {
    storage.get([STORAGE_KEYS.CUSTOM_SPAM_PATTERNS], (result) => {
      resolve(result[STORAGE_KEYS.CUSTOM_SPAM_PATTERNS] || []);
    });
  });
}

async function setCustomSpamPatterns(patterns) {
  return new Promise((resolve) => {
    storage.set({ [STORAGE_KEYS.CUSTOM_SPAM_PATTERNS]: patterns }, () => {
      resolve();
    });
  });
}

async function getStorage(key) {
  return new Promise((resolve) => {
    storage.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

async function setStorage(key, value) {
  return new Promise((resolve) => {
    storage.set({ [key]: value }, () => {
      resolve();
    });
  });
}

export {
  getCustomSpamPatterns,
  setCustomSpamPatterns,
  getStorage,
  setStorage,
  STORAGE_KEYS
};
