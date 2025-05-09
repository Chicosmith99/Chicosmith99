async function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || []);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const dashboardContent = document.getElementById('dashboard-content');
  const navLinks = document.querySelectorAll('nav ul li a');

  async function loadYouTubeComments() {
    const comments = await getStorage('flaggedComments');
    if (comments.length === 0) {
      dashboardContent.innerHTML = '<p>No flagged YouTube comments found.</p>';
      return;
    }
    let html = '<h2>YouTube Comments</h2><ul>';
    comments.forEach((comment, index) => {
      html += `<li><strong>${comment.author || 'Unknown'}</strong>: ${comment.text || ''}</li>`;
    });
    html += '</ul>';
    dashboardContent.innerHTML = html;
  }

  async function loadFacebookComments() {
    // Assuming Facebook comments stored similarly, adjust key if different
    const comments = await getStorage('flaggedComments');
    if (comments.length === 0) {
      dashboardContent.innerHTML = '<p>No flagged Facebook comments found.</p>';
      return;
    }
    let html = '<h2>Facebook Comments</h2><ul>';
    comments.forEach((comment, index) => {
      html += `<li><strong>${comment.author || 'Unknown'}</strong>: ${comment.text || ''}</li>`;
    });
    html += '</ul>';
    dashboardContent.innerHTML = html;
  }

  async function loadWhitelist() {
    const whitelist = await getStorage('whitelist');
    if (whitelist.length === 0) {
      dashboardContent.innerHTML = '<p>Whitelist is empty.</p>';
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
    const blacklist = await getStorage('blacklist');
    if (blacklist.length === 0) {
      dashboardContent.innerHTML = '<p>No flagged words found.</p>';
      return;
    }
    let html = '<h2>Flagged Words</h2><ul>';
    blacklist.forEach((word) => {
      html += `<li>${word}</li>`;
    });
    html += '</ul>';
    dashboardContent.innerHTML = html;
  }

  async function loadFlaggedAccounts() {
    const accounts = await getStorage('targetAccounts');
    if (!accounts || (Object.keys(accounts).length === 0)) {
      dashboardContent.innerHTML = '<p>No flagged accounts found.</p>';
      return;
    }
    let html = '<h2>Flagged Accounts</h2><ul>';
    for (const [platform, account] of Object.entries(accounts)) {
      html += `<li><strong>${platform}:</strong> ${account}</li>`;
    }
    html += '</ul>';
    dashboardContent.innerHTML = html;
  }

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

  // Load default tab content on page load
  if (navLinks.length > 0) {
    const defaultTarget = navLinks[0].getAttribute('href').substring(1);
    switch (defaultTarget) {
      case 'youtube':
        loadYouTubeComments();
        break;
      case 'facebook':
        loadFacebookComments();
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
});
