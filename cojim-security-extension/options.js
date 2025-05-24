import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const whitelistInput = document.getElementById('whitelistInput');
  const addWhitelistBtn = document.getElementById('addWhitelistBtn');
  const whitelistList = document.getElementById('whitelistList');

  const blacklistInput = document.getElementById('blacklistInput');
  const addBlacklistBtn = document.getElementById('addBlacklistBtn');
  const blacklistList = document.getElementById('blacklistList');

  // Load entries for whitelist or blacklist
  async function loadList(listKey, listElement) {
    const list = (await getStorage(listKey)) || [];
    listElement.innerHTML = '';

    list.forEach((entry, index) => {
      const li = document.createElement('li');

      const input = document.createElement('input');
      input.type = 'text';
      input.value = entry;
      input.addEventListener('change', async () => {
        list[index] = input.value.trim();
        await setStorage(listKey, list);
      });

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.style.marginLeft = '8px';
      delBtn.addEventListener('click', async () => {
        list.splice(index, 1);
        await setStorage(listKey, list);
        await loadList(listKey, listElement);
      });

      li.appendChild(input);
      li.appendChild(delBtn);
      listElement.appendChild(li);
    });
  }

  // Add new entry to whitelist or blacklist
  async function addEntry(inputEl, listKey, listElement) {
    const val = inputEl.value.trim();
    if (!val) return;

    const list = (await getStorage(listKey)) || [];
    list.push(val);
    await setStorage(listKey, list);
    inputEl.value = '';
    await loadList(listKey, listElement);
  }

  // Setup listeners
  addWhitelistBtn?.addEventListener('click', () =>
    addEntry(whitelistInput, STORAGE_KEYS.WHITELIST, whitelistList)
  );

  addBlacklistBtn?.addEventListener('click', () =>
    addEntry(blacklistInput, STORAGE_KEYS.BLACKLIST, blacklistList)
  );

  // Initial load
  loadList(STORAGE_KEYS.WHITELIST, whitelistList);
  loadList(STORAGE_KEYS.BLACKLIST, blacklistList);
});
