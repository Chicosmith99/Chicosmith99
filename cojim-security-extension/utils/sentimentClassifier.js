import axios from 'axios';

const COHERE_API_KEY = 'Wff3K2lpXM9o5gJ9Bq41OwlflJOzSghpvE9TWibs';
const COHERE_API_URL = 'https://api.cohere.ai/v1/classify';

// Our label set
const labels = ['toxic', 'manipulative', 'spam', 'neutral'];

/**
 * Classifies sentiment of a comment using Cohere AI.
 * @param {string} text - The text to classify.
 * @returns {Promise<string>} - One of: toxic, manipulative, spam, neutral
 */
export async function classifySentiment(text) {
  try {
    const response = await axios.post(
      COHERE_API_URL,
      {
        inputs: [text],
        examples: [
          { text: 'You are possessed by demons!', label: 'toxic' },
          { text: 'Sow a seed or suffer forever.', label: 'manipulative' },
          { text: 'Click here for free prayer!', label: 'spam' },
          { text: 'Praise God for your life.', label: 'neutral' }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const classification = response.data.classifications?.[0];
    return classification?.prediction || 'neutral';
  } catch (err) {
    console.warn('Sentiment classification failed:', err.message);
    return 'neutral';
  }
}
