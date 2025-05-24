// notifier.js – Cross-browser admin notification utility

function notifyAdmin(title, message) {
  try {
    const notificationOptions = {
      type: 'basic',
      iconUrl: 'icons/icon.png', // Ensure this icon exists
      title,
      message,
      priority: 2
    };

    if (typeof browser !== 'undefined' && browser.notifications) {
      browser.notifications.create(notificationOptions);
    } else if (typeof chrome !== 'undefined' && chrome.notifications) {
      chrome.notifications.create('', notificationOptions);
    } else {
      console.warn('Browser does not support notifications API.');
    }
  } catch (err) {
    console.error('Notification error:', err);
  }
}

export { notifyAdmin };
