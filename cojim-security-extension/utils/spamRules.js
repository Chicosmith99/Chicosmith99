import { getCustomSpamPatterns } from './storage.js';

// Default general spam patterns (URLs, scams, promos)
const defaultSpamPatterns = [
  /whatsapp/i,
  /send money/i,
  /donate/i,
  /free/i,
  /click here/i,
  /http[s]?:\/\/[^\s]+/i,
  // Extend as needed
];

// High-risk patterns (religious exploitation, sensitive terms)
const highRiskPatterns = [
  /pray/i,
  /demonic/i,
  /spiritual attack/i,
  /breakthrough/i,
  /evil people/i,
  /power of evil/i,
  /prayers/i,
  /miracle/i,
  /blessing/i,
  /deliverance/i,
  /satan/i,
  /curse/i,
  /witchcraft/i,
  /prophecy/i,
  /anointing/i,
  /salvation/i,
  /healing/i,
  /spiritual realm/i,
  /spiritual warfare/i,
  /spiritual battle/i,
  /spiritual forces/i,
  /prayer request/i,
  /pray for/i,
  /pray against/i,
  /pray to/i,
  /pray with/i,
  /pray over/i,
  /pray up/i,
  /pray down/i,
  /pray hard/i,
  /pray loud/i,
  /pray strong/i,
  /pray power/i,
  /pray blessing/i,
  /pray miracle/i,
  /pray deliverance/i,
  /pray salvation/i,
  /pray healing/i,

];

// Normalize obfuscated characters in spam text (e.g. “s3nd m0ney”)
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

// Combine default and custom patterns
async function getSpamPatterns() {
  const customStrings = await getCustomSpamPatterns();
  const custom = Array.isArray(customStrings)
    ? customStrings
        .map(str => {
          try {
            return new RegExp(str, 'i');
          } catch (e) {
            console.warn('Invalid custom spam pattern:', str);
            return null;
          }
        })
        .filter(Boolean)
    : [];

  return [...custom, ...defaultSpamPatterns];
}

// Main detection methods
async function isSpam(text) {
  const normalized = normalizeText(text);
  const patterns = await getSpamPatterns();
  return patterns.some(p => p.test(normalized));
}

async function isHighRiskSpam(text) {
  const normalized = normalizeText(text);
  return highRiskPatterns.some(p => p.test(normalized));
}

async function checkSpamStatus(text) {
  const normalized = normalizeText(text);

  const patterns = await getSpamPatterns();

  const emotionalTriggers = [
    /please.*help/i,
    /i am (in )?(pain|tears|suffering|sick)/i,
    /i am dying/i,
    /i am devastated/i,
    /help me with.*(money|drugs|treatment|medical)/i,
    /\d{10}/, // Likely bank account number
    /account.*number/i,
    /zenith bank/i,
    /bank.*details/i
  ];

  const religiousTriggers = [
    /in jesus name/i,
    /god.*bless/i,
    /in gods name/i,
    /by his grace/i,
    /i beg.*in.*god/i
  ];

  const financialTriggers = [
    /help me with.*\d+/i,
    /need.*money/i,
    /send.*money/i,
    /no.*money/i,
    /donation/i
  ];

  const highRisk = [...emotionalTriggers, ...religiousTriggers, ...financialTriggers].some(p => p.test(normalized));
  const spam = patterns.some(p => p.test(normalized)) || highRisk;

  return { spam, highRisk };
}

export {
  isSpam,
  normalizeText,
  getSpamPatterns,
  isHighRiskSpam,
  checkSpamStatus
};
