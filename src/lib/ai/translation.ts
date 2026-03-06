/**
 * AI Translation — translates text to target languages.
 * Uses Google Translate API when available, falls back to Gemini AI translation.
 */
import { getModel } from './client';
import { isTranslateAPIEnabled } from '../featureFlags';

/**
 * Translate text to target language.
 * Priority: Google Translate API → Gemini AI
 */
export async function translateText(
    text: string,
    targetLanguage: string
): Promise<string> {
    // Try Google Translate API first
    if (isTranslateAPIEnabled()) {
        try {
            const { translateWithAPI } = await import('../translateApi');
            return await translateWithAPI(text, targetLanguage);
        } catch (error) {
            console.warn('[Translation] Google Translate API failed, falling back to AI:', error);
        }
    }

    // Fallback: Gemini AI translation
    return translateWithAI(text, targetLanguage);
}

/**
 * Gemini AI-based translation (fallback).
 */
async function translateWithAI(
    text: string,
    targetLanguage: string
): Promise<string> {
    const model = getModel();

    const prompt = `Translate the following text to ${targetLanguage}. 
Respond with ONLY the translated text, nothing else. No quotes, no explanation.

Text to translate:
${text}`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Return original on failure
    }
}
