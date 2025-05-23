// pages/api/translate.js
import { translateText } from '../../utils/translation.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, targetLang, sourceLang = null } = req.body;

  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) throw new Error('API key not configured on server.');

    const result = await translateText(text, targetLang, apiKey, sourceLang);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
