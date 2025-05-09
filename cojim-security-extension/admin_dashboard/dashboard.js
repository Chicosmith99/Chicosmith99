// Basic JavaScript for COJIM Security Admin Dashboard

document.addEventListener('DOMContentLoaded', () => {
  const dashboardContent = document.getElementById('dashboard-content');
  const navLinks = document.querySelectorAll('nav ul li a');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target.getAttribute('href').substring(1);
      dashboardContent.innerHTML = `<p>Loading content for ${target}...</p>`;
      // Placeholder for loading actual content dynamically
      setTimeout(() => {
        dashboardContent.innerHTML = `<h2>${target.charAt(0).toUpperCase() + target.slice(1)} Section</h2><p>Content for ${target} will be displayed here.</p>`;
      }, 500);
    });
  });
});
