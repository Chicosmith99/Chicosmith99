import React, { useEffect, useState } from 'react';
import { getStorage, setStorage } from '../../utils/storage.js';

function FlaggedComments() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    async function loadComments() {
      const stored = await getStorage('flaggedComments');
      setComments(stored || []);
    }
    loadComments();
  }, []);

  const removeComment = async (index) => {
    const updated = [...comments];
    updated.splice(index, 1);
    await setStorage('flaggedComments', updated);
    setComments(updated);
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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Flagged Comments</h2>
      {comments.length === 0 ? (
        <p>No flagged comments.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment, index) => (
            <li key={index} className="border p-4 rounded bg-gray-50 dark:bg-gray-800">
              <p><strong>Comment:</strong> {comment.text || '[No text]'}</p>
              <p><strong>Platform:</strong> {comment.platform || 'Unknown'}</p>
              <p><strong>Flagged At:</strong> {new Date(comment.flaggedAt).toLocaleString()}</p>
              <p><strong>Time Since:</strong> {formatTimeSince(comment.flaggedAt)}</p>
              <div className="mt-2 space-x-2">
                <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Review</button>
                <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Mark as Safe</button>
                <button
                  onClick={() => removeComment(index)}
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
