// spamRules.js - Heuristic and pattern-based spam detection rules

const spamPatterns = [
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
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/[^a-z0-9 ]/g, '');
}

function isSpam(text) {
  const normalized = normalizeText(text);
  return spamPatterns.some(pattern => pattern.test(normalized));
}

export { isSpam, normalizeText, spamPatterns };
