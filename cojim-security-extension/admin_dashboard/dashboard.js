document.addEventListener('DOMContentLoaded', () => {
  const dashboardContent = document.getElementById('dashboard-content');
  const navLinks = document.querySelectorAll('nav ul li a');

  const contentMap = {
    youtube: `
      <h2>YouTube Comments</h2>
      <p>List of flagged YouTube comments will be displayed here.</p>
      <!-- Add actual YouTube comments content here -->
    `,
    facebook: `
      <h2>Facebook Comments</h2>
      <p>List of flagged Facebook comments will be displayed here.</p>
      <!-- Add actual Facebook comments content here -->
    `,
    whitelist: `
      <h2>Whitelist Manager</h2>
      <p>Manage your whitelist entries here.</p>
      <!-- Add whitelist management content here -->
    `,
    'flagged-words': `
      <h2>Flagged Words</h2>
      <p>List of flagged words will be displayed here.</p>
      <!-- Add flagged words content here -->
    `,
    accounts: `
      <h2>Flagged Accounts</h2>
      <p>List of flagged accounts will be displayed here.</p>
      <!-- Add flagged accounts content here -->
    `
  };

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target.getAttribute('href').substring(1);
      dashboardContent.innerHTML = `<p>Loading content for ${target}...</p>`;
      setTimeout(() => {
        dashboardContent.innerHTML = contentMap[target] || '<p>Content not found.</p>';
      }, 300);
    });
  });

  // Load default tab content on page load
  if (navLinks.length > 0) {
    const defaultTarget = navLinks[0].getAttribute('href').substring(1);
    dashboardContent.innerHTML = contentMap[defaultTarget] || '<p>Content not found.</p>';
  }
});
