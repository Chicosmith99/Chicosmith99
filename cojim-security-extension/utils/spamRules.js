// utils/spamRules.js - Heuristic and pattern-based spam detection rules with dynamic custom rules support

import { getCustomSpamPatterns } from './storage.js';

// Default static spam patterns
const defaultSpamPatterns = [
  /whatsapp/i,
  /send money/i,
  /donate/i,
  /free/i,
  /click here/i,
  /http[s]?:\/\/[^\s]+/i,
  // Add more patterns as needed
];

// Normalize text to catch obfuscations like "s3nd m0ney"
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/g/g, 'a')
    .replace(/\$/g, 's')
    .replace(/[^a-z0-9 ]/g, '');
}

// Async function to get combined spam patterns (custom + default)
async function getSpamPatterns() {
  const customPatternsStrings = await getCustomSpamPatterns();
  let customPatterns = [];
  if (customPatternsStrings && Array.isArray(customPatternsStrings)) {
    customPatterns = customPatternsStrings.map(str => {
      try {
        return new RegExp(str, 'i');
      } catch (e) {
        console.warn('Invalid custom spam pattern:', str);
        return null;
      }
    }).filter(p => p !== null);
  }
  return [...customPatterns, ...defaultSpamPatterns];
}

// Async function to check if text is spam
async function isSpam(text) {
  const normalized = normalizeText(text);
  const patterns = await getSpamPatterns();
  return patterns.some(pattern => pattern.test(normalized));
}

export { isSpam, normalizeText, getSpamPatterns };
