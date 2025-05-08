document.addEventListener('DOMContentLoaded', function() {
  // Dark mode toggle functionality
  const darkModeToggle = document.querySelector('.switch input');
  
  darkModeToggle.addEventListener('change', function() {
    document.body.classList.toggle('dark-mode', this.checked);
    // Save preference to storage
    chrome.storage.sync.set({ darkMode: this.checked });
  });
  
  // Load saved dark mode preference
  chrome.storage.sync.get('darkMode', function(data) {
    if (data.darkMode !== undefined) {
      darkModeToggle.checked = data.darkMode;
      document.body.classList.toggle('dark-mode', data.darkMode);
    }
  });
  
  // Menu item click handlers
  const menuItems = document.querySelectorAll('.sidebar-menu li');
  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      
      // In a real implementation, you would switch views here
      // For now, we'll just log the clicked item
      console.log('Navigated to:', this.querySelector('span').textContent);
    });
  });
  
  // Comment action buttons
  const actionButtons = document.querySelectorAll('.action-btn');
  actionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const action = this.textContent.toLowerCase();
      const commentCard = this.closest('.comment-card');
      const commentTitle = commentCard.querySelector('h3').textContent;
      
      console.log(`Action "${action}" performed on comment: "${commentTitle}"`);
      
      // In a real implementation, you would handle the action here
      // For demonstration, we'll just show what would happen
      if (action === 'delete') {
        commentCard.style.opacity = '0.5';
        setTimeout(() => {
          commentCard.style.display = 'none';
        }, 1000);
      }
    });
  });
});
