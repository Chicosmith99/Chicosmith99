import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Navigation tab toggle
  function showTab(tabId) {
    tabContents.forEach(tc => tc.classList.toggle('active', tc.id === tabId));
    navButtons.forEach(btn => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('bg-gray-300', isActive);
      btn.classList.toggle('dark:bg-gray-700', isActive);
    });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });

  showTab('dashboard'); // default tab

  // Dark mode toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.className = savedTheme;
    darkModeToggle.checked = savedTheme === 'dark';

    darkModeToggle.addEventListener('change', () => {
      const newTheme = darkModeToggle.checked ? 'dark' : 'light';
      document.documentElement.className = newTheme;
      localStorage.setItem('theme', newTheme);
    });
  }

  // Whitelist management
  const whitelistList = document.getElementById('whitelist-list');
  const addDomainBtn = document.getElementById('add-domain-btn');
  const newDomainInput = document.getElementById('new-domain');

  async function loadWhitelist() {
    const whitelist = await getStorage(STORAGE_KEYS.WHITELIST) || [];
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

  async function saveWhitelist(data) {
    await setStorage(STORAGE_KEYS.WHITELIST, data);
  }

  if (addDomainBtn && newDomainInput) {
    addDomainBtn.addEventListener('click', async () => {
      const domain = newDomainInput.value.trim();
      if (domain) {
        const list = await getStorage(STORAGE_KEYS.WHITELIST) || [];
        list.push(domain);
        await saveWhitelist(list);
        newDomainInput.value = '';
        loadWhitelist();
      }
    });
  }

  // Load whitelist on startup
  loadWhitelist();

  // Flagged comments display
  const flaggedContainer = document.getElementById('flagged-comments-container');

  async function loadFlaggedComments() {
    const comments = await getStorage(STORAGE_KEYS.FLAGGED_COMMENTS) || [];
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

      const platform = document.createElement('p');
      platform.textContent = `Platform: ${comment.platform || 'Unknown'}`;

      const timestamp = document.createElement('p');
      const time = comment.flaggedAt ? new Date(comment.flaggedAt).toLocaleString() : 'Unknown';
      timestamp.textContent = `Flagged At: ${time}`;

      const sentiment = document.createElement('p');
      sentiment.innerHTML = `<strong>Sentiment:</strong> ${comment.sentiment || 'unknown'}`;

      card.appendChild(text);
      card.appendChild(platform);
      card.appendChild(timestamp);
      card.appendChild(sentiment);

      flaggedContainer.appendChild(card);
    });
  }

  // Load flagged comments on startup
  loadFlaggedComments();
});
