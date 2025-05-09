// notifier.js - Admin notification logic using browser notifications and Firefox local notifications

function notifyAdmin(title, message) {
  try {
    if (typeof browser !== 'undefined' && browser.notifications) {
      browser.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon.png',
        title: title,
        message: message,
        priority: 2,
      });
    } else if (typeof chrome !== 'undefined' && chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon.png',
        title: title,
        message: message,
        priority: 2,
      });
    } else {
      console.warn('Notifications API not available');
    }
  } catch (err) {
    console.error('Failed to show notification:', err);
  }
}

export { notifyAdmin };
