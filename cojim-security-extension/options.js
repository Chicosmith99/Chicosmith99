const browserAPI = window.browser || window.chrome;

const whitelistList = document.getElementById('whitelist');
const blacklistList = document.getElementById('blacklist');

const whitelistInput = document.getElementById('whitelistInput');
const blacklistInput = document.getElementById('blacklistInput');

const WHITELIST_KEY = 'whitelistUsers';
const BLACKLIST_KEY = 'blacklistPatterns';

function saveListToStorage(key, list) {
  browserAPI.storage.local.set({ [key]: list });
}

function loadListFromStorage(key, renderFn) {
  browserAPI.storage.local.get([key], (result) => {
    const items = result[key] || [];
    renderFn(items);
  });
}

function renderList(listElement, items, removeFn) {
  listElement.innerHTML = '';
  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => removeFn(index);
    li.appendChild(removeBtn);
    listElement.appendChild(li);
  });
}

function addWhitelistEntry() {
  const value = whitelistInput.value.trim();
  if (!value) return;
  browserAPI.storage.local.get([WHITELIST_KEY], (result) => {
    const list = result[WHITELIST_KEY] || [];
    list.push(value);
    saveListToStorage(WHITELIST_KEY, list);
    renderList(whitelistList, list, removeWhitelistEntry);
    whitelistInput.value = '';
  });
}

function addBlacklistEntry() {
  const value = blacklistInput.value.trim();
  if (!value) return;
  browserAPI.storage.local.get([BLACKLIST_KEY], (result) => {
    const list = result[BLACKLIST_KEY] || [];
    list.push(value);
    saveListToStorage(BLACKLIST_KEY, list);
    renderList(blacklistList, list, removeBlacklistEntry);
    blacklistInput.value = '';
  });
}

function removeWhitelistEntry(index) {
  browserAPI.storage.local.get([WHITELIST_KEY], (result) => {
    const list = result[WHITELIST_KEY] || [];
    list.splice(index, 1);
    saveListToStorage(WHITELIST_KEY, list);
    renderList(whitelistList, list, removeWhitelistEntry);
  });
}

function removeBlacklistEntry(index) {
  browserAPI.storage.local.get([BLACKLIST_KEY], (result) => {
    const list = result[BLACKLIST_KEY] || [];
    list.splice(index, 1);
    saveListToStorage(BLACKLIST_KEY, list);
    renderList(blacklistList, list, removeBlacklistEntry);
  });
}

// Load lists on page load
loadListFromStorage(WHITELIST_KEY, (items) => renderList(whitelistList, items, removeWhitelistEntry));
loadListFromStorage(BLACKLIST_KEY, (items) => renderList(blacklistList, items, removeBlacklistEntry));
