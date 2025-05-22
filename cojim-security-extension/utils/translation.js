/**
 * utils/translation.js
 * Utility functions to translate text using Google Cloud Translation API.
 */

const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

/**
 * Translate text to target language using Google Cloud Translation API.
 * @param {string} text - Text to translate.
 * @param {string} targetLang - Target language code (e.g., 'en' for English).
 * @param {string} apiKey - Google Cloud API key.
 * @returns {Promise<string>} - Translated text.
 */
export async function translateText(text, targetLang = 'en', apiKey) {
  if (!apiKey) {
    throw new Error('Google Cloud API key is required for translation.');
  }

  const url = `${GOOGLE_TRANSLATE_API_URL}?key=${apiKey}`;
  const body = {
    q: text,
    target: targetLang,
    format: 'text',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Translation API error: ${errorData.error.message}`);
  }

  const data = await response.json();
  if (data && data.data && data.data.translations && data.data.translations.length > 0) {
    return data.data.translations[0].translatedText;
  }

  throw new Error('Translation API returned unexpected response.');
}
