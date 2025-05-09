import React, { useEffect, useState } from 'react';
import { getStorage, setStorage, STORAGE_KEYS } from '../../utils/storage.js';

function BlockedAccounts() {
  const [blockedAccounts, setBlockedAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState('');

  useEffect(() => {
    async function loadBlockedAccounts() {
      const stored = await getStorage(STORAGE_KEYS.BLACKLIST);
      setBlockedAccounts(stored || []);
    }
    loadBlockedAccounts();
  }, []);

  const saveBlockedAccounts = async (list) => {
    await setStorage(STORAGE_KEYS.BLACKLIST, list);
    setBlockedAccounts(list);
  };

  const addAccount = () => {
    if (newAccount.trim() === '') return;
    const updated = [...blockedAccounts, newAccount.trim()];
    saveBlockedAccounts(updated);
    setNewAccount('');
  };

  const updateAccount = (index, value) => {
    const updated = [...blockedAccounts];
    updated[index] = value.trim();
    saveBlockedAccounts(updated);
  };

  const deleteAccount = (index) => {
    const updated = blockedAccounts.filter((_, i) => i !== index);
    saveBlockedAccounts(updated);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Blocked Accounts</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter account ID or name"
          value={newAccount}
          onChange={(e) => setNewAccount(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={addAccount}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <ul className="list-disc pl-5 space-y-2">
        {blockedAccounts.map((account, index) => (
          <li key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={account}
              onChange={(e) => updateAccount(index, e.target.value)}
              className="border p-1 rounded w-4/5"
            />
            <button
              onClick={() => deleteAccount(index)}
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

export default BlockedAccounts;
