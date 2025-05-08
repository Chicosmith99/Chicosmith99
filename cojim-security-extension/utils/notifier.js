// notifier.js - Admin notification logic using browser notifications

function notifyAdmin(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon.png',
    title: title,
    message: message,
    priority: 2,
  });
}

export { notifyAdmin };
