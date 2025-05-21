import React, { useEffect, useState } from 'react';
import { getCustomSpamPatterns, setCustomSpamPatterns } from '../../utils/storage.js';

function SpamRuleManager() {
  const [patterns, setPatterns] = useState([]);
  const [newPattern, setNewPattern] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPatterns() {
      const storedPatterns = await getCustomSpamPatterns();
      setPatterns(storedPatterns);
    }
    fetchPatterns();
  }, []);

  const addPattern = async () => {
    if (!newPattern.trim()) {
      setError('Pattern cannot be empty');
      return;
    }
    try {
      new RegExp(newPattern);
    } catch (e) {
      setError('Invalid regex pattern');
      return;
    }
    const updatedPatterns = [...patterns, newPattern.trim()];
    setPatterns(updatedPatterns);
    setNewPattern('');
    setError('');
    await setCustomSpamPatterns(updatedPatterns);
  };

  const removePattern = async (index) => {
    const updatedPatterns = patterns.filter((_, i) => i !== index);
    setPatterns(updatedPatterns);
    await setCustomSpamPatterns(updatedPatterns);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Spam Rule Management</h2>
      <div>
        <input
          type="text"
          placeholder="Enter regex pattern"
          value={newPattern}
          onChange={(e) => setNewPattern(e.target.value)}
          className="border p-1 mr-2"
        />
        <button onClick={addPattern} className="bg-blue-500 text-white px-3 py-1 rounded">
          Add
        </button>
      </div>
      {error && <div className="text-red-600 mt-1">{error}</div>}
      <ul className="mt-3 list-disc list-inside">
        {patterns.map((pattern, index) => (
          <li key={index} className="flex justify-between items-center">
            <span>{pattern}</span>
            <button
              onClick={() => removePattern(index)}
              className="text-red-600 hover:text-red-800 ml-4"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SpamRuleManager;
