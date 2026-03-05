/**
 * Shared Gemini AI client and utilities.
 * All AI module files import from here.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/** Get a Gemini 2.0 Flash model instance */
export function getModel() {
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

/**
 * Clean a Gemini response that may contain markdown code fences.
 * Strips ```json and ``` wrappers, trims whitespace.
 */
export function cleanJsonResponse(text: string): string {
    return text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
}
