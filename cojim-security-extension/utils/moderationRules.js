// utils/moderationRules.js - Automated moderation rules and actions

import { getStorage, setStorage, STORAGE_KEYS } from './storage.js';

const MODERATION_RULES_KEY = 'moderationRules';

// Default moderation rules
const defaultRules = [
  {
    id: 'autoDeleteSpam',
    description: 'Automatically delete comments flagged as spam',
    action: 'delete',
    condition: { type: 'flaggedAsSpam' },
    enabled: true,
  },
  {
    id: 'autoFlagRepeatedSpammer',
    description: 'Automatically flag users with repeated spam behavior',
    action: 'flag',
    condition: { type: 'userBehavior', threshold: 5 },
    enabled: true,
  },
];

// Get moderation rules from storage or default
async function getModerationRules() {
  const rules = await getStorage(MODERATION_RULES_KEY);
  if (!rules) {
    await setStorage(MODERATION_RULES_KEY, defaultRules);
    return defaultRules;
  }
  return rules;
}

// Save moderation rules to storage
async function setModerationRules(rules) {
  await setStorage(MODERATION_RULES_KEY, rules);
}

// Evaluate moderation rules against an event
async function evaluateRules(event) {
  const rules = await getModerationRules();
  const actions = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;

    if (rule.condition.type === 'flaggedAsSpam' && event.type === 'flaggedComment') {
      actions.push(rule.action);
    } else if (rule.condition.type === 'userBehavior' && event.type === 'userBehavior') {
      if (event.flaggedCount >= rule.condition.threshold) {
        actions.push(rule.action);
      }
    }
  }

  return actions;
}

export {
  getModerationRules,
  setModerationRules,
  evaluateRules,
};
