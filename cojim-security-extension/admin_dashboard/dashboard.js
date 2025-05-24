import { getStorage, setStorage, STORAGE_KEYS } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const dashboardContent = document.getElementById('dashboard-content');
  const navLinks = document.querySelectorAll('nav ul li a');

  // Enforce dark mode permanently
  document.body.classList.add('dark-mode');

  function renderEmpty(message) {
    dashboardContent.innerHTML = `<p>${message}</p>`;
  }

  function renderList(title, items) {
    let html = `<h2>${title}</h2><ul>`;
    items.forEach((item) => {
      html += `<li>${item}</li>`;
    });
    html += '</ul>';
    dashboardContent.innerHTML = html;
  }

  async function loadYouTubeComments() {
    const comments = await getStorage(STORAGE_KEYS.FLAGGED_COMMENTS);
    if (!comments || comments.length === 0) return renderEmpty('No flagged YouTube comments found.');

    const list = comments
      .filter(c => c.platform === 'YouTube')
      .map(c => `<strong>${c.author || 'Unknown'}</strong>: ${c.text || ''}`);
    renderList('YouTube Comments', list);
  }

  async function loadFacebookComments() {
    const comments = await getStorage(STORAGE_KEYS.FLAGGED_COMMENTS);
    if (!comments || comments.length === 0) return renderEmpty('No flagged Facebook comments found.');

    const list = comments
      .filter(c => c.platform === 'Facebook')
      .map(c => `<strong>${c.author || 'Unknown'}</strong>: ${c.text || ''}`);
    renderList('Facebook Comments', list);
  }

  async function loadLiveStreams() {
    const streams = await getStorage(STORAGE_KEYS.LIVE_STREAMS);
    if (!streams || streams.length === 0) return renderEmpty('No live streams detected.');

    const list = streams.map(stream =>
      `<strong>${stream.platform}</strong>: <a href="${stream.url}" target="_blank">${stream.url}</a> - Detected at ${new Date(stream.timestamp).toLocaleString()}`
    );
    renderList('Live Streams', list);
  }

  async function loadUploadPosts() {
    const posts = await getStorage(STORAGE_KEYS.UPLOAD_POSTS);
    if (!posts || posts.length === 0) return renderEmpty('No upload posts detected.');

    const list = posts.map(post =>
      `<strong>${post.platform}</strong>: <a href="${post.url}" target="_blank">${post.url}</a> - ${post.info} at ${new Date(post.timestamp).toLocaleString()}`
    );
    renderList('Upload Posts', list);
  }

  async function loadWhitelist() {
    const whitelist = await getStorage(STORAGE_KEYS.WHITELIST);
    if (!whitelist || whitelist.length === 0) return renderEmpty('No whitelist entries found.');
    renderList('Whitelist', whitelist);
  }

  async function loadFlaggedWords() {
    const patterns = await getStorage(STORAGE_KEYS.CUSTOM_SPAM_PATTERNS);
    if (!patterns || patterns.length === 0) return renderEmpty('No flagged words found.');
    renderList('Flagged Words', patterns);
  }

  async function loadFlaggedAccounts() {
    const accounts = await getStorage('flaggedAccounts');
    if (!accounts || accounts.length === 0) return renderEmpty('No flagged accounts found.');
    renderList('Flagged Accounts', accounts);
  }

  function setupNavLinks() {
    navLinks.forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const target = link.getAttribute('href').substring(1);
        dashboardContent.innerHTML = `<p>Loading content for ${target}...</p>`;
        switch (target) {
          case 'youtube': await loadYouTubeComments(); break;
          case 'facebook': await loadFacebookComments(); break;
          case 'live-streams': await loadLiveStreams(); break;
          case 'upload-posts': await loadUploadPosts(); break;
          case 'whitelist': await loadWhitelist(); break;
          case 'flagged-words': await loadFlaggedWords(); break;
          case 'accounts': await loadFlaggedAccounts(); break;
          default:
            dashboardContent.innerHTML = '<p>Section not found.</p>';
        }
      });
    });

    // Load first tab on init
    const first = navLinks[0]?.getAttribute('href')?.substring(1);
    if (first) {
      document.querySelector(`a[href="#${first}"]`)?.click();
    }
  }

  setupNavLinks();
});
