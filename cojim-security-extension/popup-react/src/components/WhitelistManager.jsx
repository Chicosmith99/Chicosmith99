import React, { useEffect, useState } from 'react';
import { getStorage, setStorage, STORAGE_KEYS } from '../../utils/storage.js';

function WhitelistManager() {
  const [whitelist, setWhitelist] = useState([]);
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    async function loadWhitelist() {
      const stored = await getStorage(STORAGE_KEYS.WHITELIST);
      setWhitelist(stored || []);
    }
    loadWhitelist();
  }, []);

  const saveWhitelist = async (list) => {
    await setStorage(STORAGE_KEYS.WHITELIST, list);
    setWhitelist(list);
  };

  const addDomain = () => {
    if (newDomain.trim() === '') return;
    const updated = [...whitelist, newDomain.trim()];
    saveWhitelist(updated);
    setNewDomain('');
  };

  const updateDomain = (index, value) => {
    const updated = [...whitelist];
    updated[index] = value.trim();
    saveWhitelist(updated);
  };

  const deleteDomain = (index) => {
    const updated = whitelist.filter((_, i) => i !== index);
    saveWhitelist(updated);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Whitelist Manager</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter domain or URL"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={addDomain}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <ul className="list-disc pl-5 space-y-2">
        {whitelist.map((domain, index) => (
          <li key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={domain}
              onChange={(e) => updateDomain(index, e.target.value)}
              className="border p-1 rounded w-4/5"
            />
            <button
              onClick={() => deleteDomain(index)}
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

export default WhitelistManager;
