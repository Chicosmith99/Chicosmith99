import React, { useEffect, useState, useRef } from 'react';
import { getStorage, setStorage, STORAGE_KEYS } from '../../utils/storage.js';
import { notifyAdmin } from '../../utils/notifier.js';

function FlaggedComments() {
  const [comments, setComments] = useState([]);
  const timerRefs = useRef({});

  useEffect(() => {
    async function loadComments() {
      const stored = await getStorage(STORAGE_KEYS.FLAGGED_COMMENTS);
      const now = Date.now();
      // Filter out comments older than 24 hours (86400000 ms)
      const filtered = (stored || []).filter(c => now - c.flaggedAt < 86400000);
      if (filtered.length !== (stored || []).length) {
        await setStorage(STORAGE_KEYS.FLAGGED_COMMENTS, filtered);
      }
      setComments(filtered);
    }
    loadComments();
  }, []);

  useEffect(() => {
    // Set interval timers for countdown and auto-delete
    comments.forEach((comment) => {
      if (timerRefs.current[comment.id]) return; // already has timer
      timerRefs.current[comment.id] = setInterval(() => {
        const now = Date.now();
        if (now - comment.flaggedAt >= 86400000) {
          removeCommentById(comment.id);
          clearInterval(timerRefs.current[comment.id]);
          delete timerRefs.current[comment.id];
        } else {
          // Force update to show countdown
          setComments((prev) => [...prev]);
        }
      }, 60000); // update every minute
    });
    return () => {
      Object.values(timerRefs.current).forEach(clearInterval);
      timerRefs.current = {};
    };
  }, [comments]);

  const removeCommentById = async (id) => {
    const updated = comments.filter(c => c.id !== id);
    await setStorage(STORAGE_KEYS.FLAGGED_COMMENTS, updated);
    setComments(updated);
  };

  const approveComment = async (id) => {
    // For now, just remove from flagged comments
    await removeCommentById(id);
    notifyAdmin('Comment Approved', `Comment ID ${id} approved.`);
  };

  const ignoreComment = async (id) => {
    // For now, just remove from flagged comments
    await removeCommentById(id);
    notifyAdmin('Comment Ignored', `Comment ID ${id} ignored.`);
  };

  const formatTimeSince = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatTimeLeft = (timestamp) => {
    const now = Date.now();
    const diff = 86400000 - (now - timestamp);
    if (diff <= 0) return '0m left';
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    if (hours > 0) return `${hours}h ${remMinutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Flagged Comments</h2>
      {comments.length === 0 ? (
        <p>No flagged comments.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment, index) => (
            <li key={comment.id || index} className="border p-4 rounded bg-gray-50 dark:bg-gray-800">
              <p><strong>Comment:</strong> {comment.text || '[No text]'}</p>
              <p><strong>Platform:</strong> {comment.platform || 'Unknown'}</p>
              <p><strong>Flagged At:</strong> {new Date(comment.flaggedAt).toLocaleString()}</p>
              <p><strong>Time Since:</strong> {formatTimeSince(comment.flaggedAt)}</p>
              <p><strong>Auto-delete in:</strong> {formatTimeLeft(comment.flaggedAt)}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => approveComment(comment.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => ignoreComment(comment.id)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                >
                  Ignore
                </button>
                <button
                  onClick={() => removeCommentById(comment.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FlaggedComments;
