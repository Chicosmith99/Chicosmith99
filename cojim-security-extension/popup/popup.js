import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function showTab(tabId) {
    tabContents.forEach(tc => {
      tc.classList.toggle('active', tc.id === tabId);
    });
    navButtons.forEach(btn => {
      btn.classList.toggle('bg-gray-300', btn.dataset.tab === tabId);
    });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showTab(btn.dataset.tab);
    });
  });

  // Show dashboard tab by default
  showTab('dashboard');

  // Initialize dark mode toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.className = savedTheme;
    darkModeToggle.checked = savedTheme === 'dark';

    darkModeToggle.addEventListener('change', () => {
      const theme = darkModeToggle.checked ? 'dark' : 'light';
      document.documentElement.className = theme;
      localStorage.setItem('theme', theme);
    });
  }

  // Whitelist management logic
  const whitelistList = document.getElementById('whitelist-list');
  const addDomainBtn = document.getElementById('add-domain-btn');
  const newDomainInput = document.getElementById('new-domain');

  async function loadWhitelist() {
    const whitelist = (await getStorage(STORAGE_KEYS.WHITELIST)) || [];
    whitelistList.innerHTML = '';
    whitelist.forEach((domain, index) => {
      const li = document.createElement('li');
      const input = document.createElement('input');
      input.type = 'text';
      input.value = domain;
      input.className = 'border p-1 rounded w-4/5 mr-2';
      input.addEventListener('change', () => {
        whitelist[index] = input.value.trim();
        saveWhitelist(whitelist);
      });
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700';
      deleteBtn.addEventListener('click', () => {
        whitelist.splice(index, 1);
        saveWhitelist(whitelist);
        loadWhitelist();
      });
      li.appendChild(input);
      li.appendChild(deleteBtn);
      whitelistList.appendChild(li);
    });
  }

  async function saveWhitelist(whitelist) {
    await setStorage(STORAGE_KEYS.WHITELIST, whitelist);
  }

  addDomainBtn.addEventListener('click', async () => {
    const domain = newDomainInput.value.trim();
    if (domain) {
      const whitelist = (await getStorage(STORAGE_KEYS.WHITELIST)) || [];
      whitelist.push(domain);
      await saveWhitelist(whitelist);
      newDomainInput.value = '';
      loadWhitelist();
    }
  });

  loadWhitelist();

  // Load flagged comments into the flagged tab
  const flaggedContainer = document.getElementById('flagged-comments-container');

  async function loadFlaggedComments() {
    const comments = await getStorage('flaggedComments') || [];
    flaggedContainer.innerHTML = '';
    if (comments.length === 0) {
      flaggedContainer.textContent = 'No flagged comments.';
      return;
    }
    comments.forEach(comment => {
      const card = document.createElement('div');
      card.className = 'border p-4 rounded mb-4 bg-gray-50 dark:bg-gray-800';
      const text = document.createElement('p');
      text.textContent = `Comment: ${comment.text || '[No text]'}`;
      card.appendChild(text);
      const platform = document.createElement('p');
      platform.textContent = `Platform: ${comment.platform || 'Unknown'}`;
      card.appendChild(platform);
      const timestamp = document.createElement('p');
      timestamp.textContent = `Flagged At: ${new Date(comment.flaggedAt).toLocaleString()}`;
      card.appendChild(timestamp);
      flaggedContainer.appendChild(card);
    });
  }

  loadFlaggedComments();
});
