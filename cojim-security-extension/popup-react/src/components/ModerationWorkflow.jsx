import React, { useEffect, useState } from 'react';
import { getStorage, setStorage, STORAGE_KEYS } from '../../utils/storage.js';

const MODERATION_DATA_KEY = 'moderationData';

function ModerationWorkflow() {
  const [flaggedItems, setFlaggedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [actionHistory, setActionHistory] = useState({});

  useEffect(() => {
    async function fetchFlagged() {
      const data = await getStorage(MODERATION_DATA_KEY) || [];
      setFlaggedItems(data);
    }
    fetchFlagged();
  }, []);

  const selectItem = (item) => {
    setSelectedItem(item);
    setReviewComment('');
  };

  const saveReview = async (action) => {
    if (!selectedItem) return;
    const updatedItems = flaggedItems.map(item => {
      if (item.id === selectedItem.id) {
        const history = item.history || [];
        history.push({
          action,
          comment: reviewComment,
          timestamp: Date.now(),
        });
        return { ...item, history, status: action === 'approve' ? 'approved' : 'rejected' };
      }
      return item;
    });
    setFlaggedItems(updatedItems);
    setSelectedItem(null);
    setReviewComment('');
    await setStorage(MODERATION_DATA_KEY, updatedItems);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Collaborative Moderation</h2>
      <div className="flex">
        <div className="w-1/3 border-r border-gray-300 pr-4">
          <h3 className="text-lg font-medium mb-2">Flagged Items</h3>
          <ul>
            {flaggedItems.length === 0 && <li>No flagged items.</li>}
            {flaggedItems.map(item => (
              <li key={item.id} className="cursor-pointer mb-1" onClick={() => selectItem(item)}>
                <div>
                  <strong>{item.platform}</strong>: {item.text?.slice(0, 50) || 'No text'}
                  <br />
                  Status: {item.status || 'pending'}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 pl-4">
          {selectedItem ? (
            <div>
              <h3 className="text-lg font-medium mb-2">Review Item</h3>
              <p><strong>Platform:</strong> {selectedItem.platform}</p>
              <p><strong>Text:</strong> {selectedItem.text}</p>
              <textarea
                className="w-full border border-gray-300 rounded p-2 mt-2"
                rows={4}
                placeholder="Add review comment"
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
              />
              <div className="mt-2">
                <button
                  className="bg-green-500 text-white px-4 py-2 mr-2 rounded"
                  onClick={() => saveReview('approve')}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => saveReview('reject')}
                >
                  Reject
                </button>
                <button
                  className="ml-2 px-4 py-2 rounded border border-gray-300"
                  onClick={() => setSelectedItem(null)}
                >
                  Cancel
                </button>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold">Action History</h4>
                {selectedItem.history && selectedItem.history.length > 0 ? (
                  <ul>
                    {selectedItem.history.map((h, idx) => (
                      <li key={idx}>
                        [{new Date(h.timestamp).toLocaleString()}] {h.action} - {h.comment}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No actions taken yet.</p>
                )}
              </div>
            </div>
          ) : (
            <p>Select a flagged item to review.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModerationWorkflow;
