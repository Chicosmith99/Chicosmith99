// utils/translation.js
import axios from 'axios';

const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

/**
 * Translates text using Google Cloud Translation API.
 * @param {string} text - Text to translate.
 * @param {string} targetLang - Target language code (e.g., 'en').
 * @param {string} apiKey - Google Cloud API key.
 * @param {string|null} sourceLang - Optional source language code.
 * @returns {Promise<{ translatedText: string, detectedSourceLanguage?: string }>}
 */
export async function translateText(text, targetLang = 'en', apiKey, sourceLang = null) {
  if (!apiKey) throw new Error('Missing Google API key.');
  if (!text || typeof text !== 'string') throw new Error('Text to translate must be a string.');
  if (!targetLang || typeof targetLang !== 'string') throw new Error('Target language must be a string.');

  try {
    const response = await axios.post(
      GOOGLE_TRANSLATE_API_URL,
      {
        q: text,
        target: targetLang,
        format: 'text',
        ...(sourceLang && { source: sourceLang }),
      },
      {
        params: { key: apiKey },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const translation = response.data?.data?.translations?.[0];
    if (!translation) throw new Error('No translation returned.');

    return {
      translatedText: translation.translatedText,
      detectedSourceLanguage: translation.detectedSourceLanguage,
    };
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    throw new Error(`Google Translate API Error: ${msg}`);
  }
}
