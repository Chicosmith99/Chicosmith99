// notifier.js - Admin notification logic using browser notifications and Firefox local notifications

function notifyAdmin(title, message) {
  if (typeof browser !== 'undefined' && browser.notifications) {
    // Firefox local notifications
    browser.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon.png',
      title: title,
      message: message,
      priority: 2,
    });
  } else if (typeof chrome !== 'undefined' && chrome.notifications) {
    // Chrome notifications
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
}

export { notifyAdmin };
