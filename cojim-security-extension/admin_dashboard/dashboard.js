import { getStorage, setStorage } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const dashboardContent = document.getElementById('dashboard-content');
  const navLinks = document.querySelectorAll('nav ul li a');
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Load dark mode preference from localStorage
  // Always enable dark mode
  document.body.classList.add('dark-mode');

  // Disable the dark mode toggle button
  if (darkModeToggle) {
    darkModeToggle.disabled = true;
    darkModeToggle.title = "Dark mode is permanently enabled";
    }
  });

  async function loadYouTubeComments() {
    const comments = await getStorage('flaggedComments');
    if (!comments || comments.length === 0) {
      dashboardContent.innerHTML = '<p>No flagged YouTube comments found.</p>';
      return;
    }
    let html = '<h2>YouTube Comments</h2><ul>';
    comments.forEach((comment) => {
      if (comment.platform === 'YouTube') {
        html += `<li><strong>${comment.author || 'Unknown'}</strong>: ${comment.text || ''}</li>`;
      }
    });
    html += '</ul>';
    dashboardContent.innerHTML = html;
  }

  async function loadFacebookComments() {
    const comments = await getStorage('flaggedComments');
    if (!comments || comments.length === 0) {
      dashboardContent.innerHTML = '<p>No flagged Facebook comments found.</p>';
      return;
    }
    let html = '<h2>Facebook Comments</h2><ul>';
    comments.forEach((comment) => {
      if (comment.platform === 'Facebook') {
        html += `<li><strong>${comment.author || 'Unknown'}</strong>: ${comment.text || ''}</li>`;
      }
    });
    html += '</ul>';
    dashboardContent.innerHTML = html;
  }

  async function loadLiveStreams() {
    const liveStreams = await getStorage('flaggedLiveStreams');
    if (!liveStreams || liveStreams.length === 0) {
      dashboardContent.innerHTML = '<p>No live streams detected.</p>';
      return;
    }
    let html = '<h2>Live Streams</h2><ul>';
    liveStreams.forEach((stream) => {
      html += `<li><strong>${stream.platform}</strong>: <a href="${stream.url}" target="_blank">${stream.url}</a> - Detected at ${new Date(stream.timestamp).toLocaleString()}</li>`;
    });
    html += '</ul>';
    dashboardContent.innerHTML = html;
  }

  async function loadUploadPosts() {
    const uploadPosts = await getStorage('flaggedUploadPosts');
    if (!uploadPosts || uploadPosts.length === 0) {
      dashboardContent.innerHTML = '<p>No upload posts detected.</p>';
      return;
    }
    let html = '<h2>Upload Posts</h2><ul>';
    uploadPosts.forEach((post) => {
      html += `<li><strong>${post.platform}</strong>: <a href="${post.url}" target="_blank">${post.url}</a> - Info: ${post.info || ''} - Detected at ${new Date(post.timestamp).toLocaleString()}</li>`;
    });
    html += '</ul>';
    dashboardContent.innerHTML = html;
  }

  async function loadWhitelist() {
    const whitelist = await getStorage('whitelist');
    if (!whitelist || whitelist.length === 0) {
      dashboardContent.innerHTML = '<p>No whitelist entries found.</p>';
      return;
    }
    let html = '<h2>Whitelist Manager</h2><ul>';
    whitelist.forEach((entry) => {
      html += `<li>${entry}</li>`;
    });
    html += '</ul>';
    dashboardContent.innerHTML = html;
  }

  async function loadFlaggedWords() {
    const flaggedWords = await getStorage('flaggedWords');
    if (!flaggedWords || flaggedWords.length === 0) {
      dashboardContent.innerHTML = '<p>No flagged words found.</p>';
      return;
    }
    let html = '<h2>Flagged Words</h2><ul>';
    flaggedWords.forEach((word) => {
      html += `<li>${word}</li>`;
    });
    html += '</ul>';
    dashboardContent.innerHTML = html;

    // Also render flagged words in the flagged words manager UI
    renderFlaggedWordsList(flaggedWords);
  }

  // Render flagged words list in the flagged words manager UI
  function renderFlaggedWordsList(words) {
    const flaggedWordsList = document.getElementById('flaggedWordsList');
    if (!flaggedWordsList) return;
    flaggedWordsList.innerHTML = '';
    words.forEach(word => {
      const li = document.createElement('li');
      li.textContent = word;
      flaggedWordsList.appendChild(li);
    });
  }

  // Add event listener for adding new flagged word
  const addFlaggedWordBtn = document.getElementById('addFlaggedWordBtn');
  const newFlaggedWordInput = document.getElementById('newFlaggedWord');

  if (addFlaggedWordBtn && newFlaggedWordInput) {
    addFlaggedWordBtn.addEventListener('click', async () => {
      const newWord = newFlaggedWordInput.value.trim();
      if (!newWord) return;

      let flaggedWords = await getStorage('flaggedWords') || [];
      if (!flaggedWords.includes(newWord)) {
        flaggedWords.push(newWord);
        await setStorage('flaggedWords', flaggedWords);
        renderFlaggedWordsList(flaggedWords);
        newFlaggedWordInput.value = '';
      }
    });
  }

  async function loadFlaggedAccounts() {
    const flaggedAccounts = await getStorage('flaggedAccounts');
    if (!flaggedAccounts || flaggedAccounts.length === 0) {
      dashboardContent.innerHTML = '<p>No flagged accounts found.</p>';
      return;
    }
    let html = '<h2>Flagged Accounts</h2><ul>';
    flaggedAccounts.forEach((account) => {
      html += `<li>${account}</li>`;
    });
    html += '</ul>';
    dashboardContent.innerHTML = html;
  }

  // New function to render whitelist entries in the whitelist manager UI
  async function renderWhitelistEntries() {
    const whitelist = await getStorage('whitelist') || [];
    const whitelistEntries = document.getElementById('whitelistEntries');
    whitelistEntries.innerHTML = '';
    whitelist.forEach((entry) => {
      const li = document.createElement('li');
      li.textContent = entry;
      whitelistEntries.appendChild(li);
    });
  }

  // Add event listener for adding new whitelist domain
  const addWhitelistDomainBtn = document.getElementById('addWhitelistDomainBtn');
  const newWhitelistDomainInput = document.getElementById('newWhitelistDomain');

  addWhitelistDomainBtn.addEventListener('click', async () => {
    const newDomain = newWhitelistDomainInput.value.trim();
    if (!newDomain) return;

    let whitelist = await getStorage('whitelist') || [];
    if (!whitelist.includes(newDomain)) {
      whitelist.push(newDomain);
      await setStorage('whitelist', whitelist);
      await renderWhitelistEntries();
      newWhitelistDomainInput.value = '';
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const target = e.target.getAttribute('href').substring(1);
      dashboardContent.innerHTML = `<p>Loading content for ${target}...</p>`;
      switch (target) {
        case 'youtube':
          await loadYouTubeComments();
          break;
        case 'facebook':
          await loadFacebookComments();
          break;
        case 'live-streams':
          await loadLiveStreams();
          break;
        case 'upload-posts':
          await loadUploadPosts();
          break;
        case 'whitelist':
          await loadWhitelist();
          break;
        case 'flagged-words':
          await loadFlaggedWords();
          break;
        case 'accounts':
          await loadFlaggedAccounts();
          break;
        default:
          dashboardContent.innerHTML = '<p>Content not found.</p>';
      }
    });
  });

  // Initial render of whitelist entries
  renderWhitelistEntries();

  if (navLinks.length > 0) {
    const defaultTarget = navLinks[0].getAttribute('href').substring(1);
    switch (defaultTarget) {
      case 'youtube':
        loadYouTubeComments();
        break;
      case 'facebook':
        loadFacebookComments();
        break;
      case 'live-streams':
        loadLiveStreams();
        break;
      case 'upload-posts':
        loadUploadPosts();
        break;
      case 'whitelist':
        loadWhitelist();
        break;
      case 'flagged-words':
        loadFlaggedWords();
        break;
      case 'accounts':
        loadFlaggedAccounts();
        break;
      default:
        dashboardContent.innerHTML = '<p>Content not found.</p>';
    }
  }
