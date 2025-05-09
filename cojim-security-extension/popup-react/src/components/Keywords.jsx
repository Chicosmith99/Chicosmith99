import React, { useEffect, useState } from 'react';
import { getStorage, setStorage } from '../../utils/storage.js';

const FLAGGED_WORDS_KEY = 'flaggedWords';

function Keywords() {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    async function loadKeywords() {
      const stored = await getStorage(FLAGGED_WORDS_KEY);
      setKeywords(stored || []);
    }
    loadKeywords();
  }, []);

  const saveKeywords = async (list) => {
    await setStorage(FLAGGED_WORDS_KEY, list);
    setKeywords(list);
  };

  const addKeyword = () => {
    if (newKeyword.trim() === '') return;
    const updated = [...keywords, newKeyword.trim()];
    saveKeywords(updated);
    setNewKeyword('');
  };

  const updateKeyword = (index, value) => {
    const updated = [...keywords];
    updated[index] = value.trim();
    saveKeywords(updated);
  };

  const deleteKeyword = (index) => {
    const updated = keywords.filter((_, i) => i !== index);
    saveKeywords(updated);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Keyword Watchlist</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter keyword or phrase"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={addKeyword}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <ul className="list-disc pl-5 space-y-2">
        {keywords.map((keyword, index) => (
          <li key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => updateKeyword(index, e.target.value)}
              className="border p-1 rounded w-4/5"
            />
            <button
              onClick={() => deleteKeyword(index)}
              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Keywords;
