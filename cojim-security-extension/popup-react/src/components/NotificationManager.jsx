import React, { useEffect, useState } from 'react';
import { listenFlaggedComments, listenModerationActions } from '../../utils/firebaseClient.js';

function NotificationManager() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const flaggedUnsub = listenFlaggedComments((data) => {
      setNotifications((prev) => [
        { id: Date.now(), message: `New flagged comment on ${data.platform}: ${data.text}`, timestamp: Date.now() },
        ...prev,
      ]);
    });

    const moderationUnsub = listenModerationActions((data) => {
      setNotifications((prev) => [
        { id: Date.now(), message: `Moderation action: ${data.action} on item ${data.itemId}`, timestamp: Date.now() },
        ...prev,
      ]);
    });

    return () => {
      flaggedUnsub && flaggedUnsub();
      moderationUnsub && moderationUnsub();
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 10, right: 10, width: 300, zIndex: 1000 }}>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <ul>
          {notifications.map((notif) => (
            <li key={notif.id} style={{ backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', padding: '10px', marginBottom: '5px', borderRadius: '4px' }}>
              {notif.message}
              <div style={{ fontSize: '0.8em', color: '#721c24' }}>{new Date(notif.timestamp).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationManager;
