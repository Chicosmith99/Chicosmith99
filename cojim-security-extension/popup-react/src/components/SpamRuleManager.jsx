
import React, { useEffect, useState } from 'react';
import { getCustomSpamPatterns, setCustomSpamPatterns } from '../../utils/storage.js';
import { translateText } from '../../utils/translation.js';

function SpamRuleManager() {
  const [patterns, setPatterns] = useState([]);
  const [translatedPatterns, setTranslatedPatterns] = useState([]);
  const [newPattern, setNewPattern] = useState('');
  const [error, setError] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [apiKey, setApiKey] = useState(''); // Google Translate API key input by user

  useEffect(() => {
    async function fetchPatterns() {
      const storedPatterns = await getCustomSpamPatterns();
      setPatterns(storedPatterns);
    }
    fetchPatterns();
  }, []);

  useEffect(() => {
    async function translatePatterns() {
      if (!autoTranslate || !apiKey) {
        setTranslatedPatterns([]);
        return;
      }
      try {
        const translations = await Promise.all(
          patterns.map(async (pattern) => {
            try {
              return await translateText(pattern, 'en', apiKey);
            } catch (error) {
              return `[Translation error: ${error.message}]`;
            }
          })
        );
        setTranslatedPatterns(translations);
      } catch {
        setTranslatedPatterns([]);
      }
    }
    translatePatterns();
  }, [patterns, autoTranslate, apiKey]);

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
      <div className="mb-2">
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
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-4">
        <label className="mr-2">
          <input
            type="checkbox"
            checked={autoTranslate}
            onChange={(e) => setAutoTranslate(e.target.checked)}
          />
          {' '}Enable Auto-Translate to English
        </label>
        {autoTranslate && (
          <input
            type="text"
            placeholder="Enter Google Translate API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="border p-1 ml-2 w-64"
          />
        )}
      </div>
      <ul className="mt-3 list-disc list-inside">
        {patterns.map((pattern, index) => (
          <li key={index} className="flex justify-between items-center">
            <span>
              {pattern}
              {autoTranslate && translatedPatterns[index] && (
                <em className="ml-2 text-gray-500">({translatedPatterns[index]})</em>
              )}
            </span>
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
