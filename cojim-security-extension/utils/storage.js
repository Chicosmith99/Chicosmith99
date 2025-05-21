const STORAGE_KEYS = {
  CUSTOM_SPAM_PATTERNS: 'customSpamPatterns',
  WHITELIST: 'whitelist',
  BLACKLIST: 'blacklist', // <-- New
};

// Use local storage instead of sync
async function getCustomSpamPatterns() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.CUSTOM_SPAM_PATTERNS], (result) => {
      resolve(result[STORAGE_KEYS.CUSTOM_SPAM_PATTERNS] || []);
    });
  });
}

async function setCustomSpamPatterns(patterns) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_SPAM_PATTERNS]: patterns }, () => {
      resolve();
    });
  });
}

async function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
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

export { getCustomSpamPatterns, setCustomSpamPatterns, getStorage, setStorage, STORAGE_KEYS };
