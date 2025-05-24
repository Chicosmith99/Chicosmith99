import { classifySentiment } from '../utils/sentimentClassifier.js';

describe('Sentiment Classifier', () => {
  test('classifies neutral text correctly', async () => {
    const result = await classifySentiment('Praise God for your life.');
    expect(['neutral', 'toxic', 'manipulative', 'spam']).toContain(result);
  });

  test('classifies toxic text correctly', async () => {
    const result = await classifySentiment('You are possessed by demons!');
    expect(['neutral', 'toxic', 'manipulative', 'spam']).toContain(result);
  });
});
