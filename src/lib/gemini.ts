import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'placeholder_gemini_key') {
  console.warn('[GirraStudy] GEMINI_API_KEY is not configured. AI note parsing will be disabled.');
}

export const geminiClient = apiKey && apiKey !== 'placeholder_gemini_key'
  ? new GoogleGenerativeAI(apiKey)
  : null;

/**
 * Returns the Gemini model instance, or null if the key is not configured.
 */
export function getGeminiModel(modelName = 'gemini-2.0-flash') {
  if (!geminiClient) return null;
  return geminiClient.getGenerativeModel({ model: modelName });
}
