/**
 * AI Translation — translates text to target languages.
 */
import { getModel } from './client';

export async function translateText(
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
