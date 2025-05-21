import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const whitelistInput = document.getElementById('whitelistInput');
  const addWhitelistBtn = document.getElementById('addWhitelistBtn');
  const whitelistList = document.getElementById('whitelistList');

  const blacklistInput = document.getElementById('blacklistInput');
  const addBlacklistBtn = document.getElementById('addBlacklistBtn');
  const blacklistList = document.getElementById('blacklistList');

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

  async function addEntry(inputEl, listKey, listElement) {
    const val = inputEl.value.trim();
    if (!val) return;
    const list = (await getStorage(listKey)) || [];
    list.push(val);
    await setStorage(listKey, list);
    inputEl.value = '';
    await loadList(listKey, listElement);
  }

  addWhitelistBtn.addEventListener('click', () =>
    addEntry(whitelistInput, STORAGE_KEYS.WHITELIST, whitelistList)
  );

    addBlacklistBtn.addEventListener('click', () =>
      addEntry(blacklistInput, STORAGE_KEYS.BLACKLIST, blacklistList)
    );
  
  }); // <-- Add this closing brace to end the DOMContentLoaded callback
