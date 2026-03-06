/**
 * AI Personal Shopper — parses buyer intent and generates conversational responses.
 * Supports streaming responses for chatbot UX when Vertex AI is configured.
 */
import { getModel, cleanJsonResponse, generateStreamingContent } from './client';

export interface ShopperIntent {
    budgetMin: number;
    budgetMax: number;
    occasion: string;
    category: string;
    stylePreferences: string[];
    region: string;
    keywords: string[];
}

export interface ShopperProduct {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    category: string;
    description: string;
    artisanName: string;
    craftType: string;
}

export async function parseShopperIntent(query: string): Promise<ShopperIntent> {
    const model = getModel();

    const prompt = `You are a shopping assistant for an Indian handcraft marketplace called KarigarSetu.

A buyer said: "${query}"

Parse their intent and return ONLY valid JSON (no markdown, no code fences):
{
  "budgetMin": <number or 0 if not specified>,
  "budgetMax": <number or 999999 if not specified>,
  "occasion": "<occasion like wedding, birthday, home decor, gift, festival, or general>",
  "category": "<craft category like Pottery, Textiles, Woodwork, Jewelry, Painting, Embroidery, Metalwork, Leather, Bamboo, or empty string if not specified>",
  "stylePreferences": ["<style keywords>"],
  "region": "<region preference or empty string>",
  "keywords": ["<search keywords extracted from query>"]
}

Important:
- If no budget is mentioned, use 0 and 999999
- If budget is mentioned like "under 2000", set budgetMin=0, budgetMax=2000
- If budget is "between 1000 and 5000", set budgetMin=1000, budgetMax=5000
- Extract all relevant keywords for product search`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text));
    } catch (error) {
        console.error('Parse shopper intent error:', error);
        return {
            budgetMin: 0,
            budgetMax: 999999,
            occasion: 'general',
            category: '',
            stylePreferences: [],
            region: '',
            keywords: query.split(' ').filter(w => w.length > 2),
        };
    }
}

export async function generateShopperResponse(
    query: string,
    products: ShopperProduct[]
): Promise<string> {
    const model = getModel();

    const productList = products.map((p, i) =>
        `${i + 1}. "${p.title}" — ₹${p.price} (${p.category} by ${p.artisanName}): ${p.description.substring(0, 100)}...`
    ).join('\n');

    const prompt = `You are a friendly, knowledgeable personal shopper for KarigarSetu, an Indian handcraft marketplace.

The buyer asked: "${query}"

Here are the matching products I found:
${productList || 'No exact matches found.'}

Write a warm, conversational response (2-4 paragraphs) that:
1. Acknowledges what they're looking for
2. Explains why these products are great choices for their needs
3. Highlights unique handmade qualities and artisan stories
4. If no products found, suggest what they could search for instead

Keep it natural and helpful, like a knowledgeable friend. Use emojis sparingly. Don't use markdown headers. Keep paragraphs short.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Shopper response error:', error);
        if (products.length > 0) {
            return `I found some beautiful handcrafted items that match what you're looking for! Each piece is made with care by talented Indian artisans. Take a look at these recommendations — I think you'll love them! 🎨`;
        }
        return `I couldn't find exact matches for your query right now, but I'd recommend browsing our Marketplace for a wide range of handcrafted treasures. Try searching with different keywords or explore our craft categories!`;
    }
}

/**
 * Generate a streaming shopper response for real-time chatbot UX.
 * Uses Vertex AI streaming when available, falls back to full response.
 */
export async function* generateShopperResponseStream(
    query: string,
    products: ShopperProduct[]
): AsyncGenerator<string> {
    const productList = products.map((p, i) =>
        `${i + 1}. "${p.title}" — ₹${p.price} (${p.category} by ${p.artisanName}): ${p.description.substring(0, 100)}...`
    ).join('\n');

    const prompt = `You are a friendly, knowledgeable personal shopper for KarigarSetu, an Indian handcraft marketplace.

The buyer asked: "${query}"

Here are the matching products I found:
${productList || 'No exact matches found.'}

Write a warm, conversational response (2-4 paragraphs) that:
1. Acknowledges what they're looking for
2. Explains why these products are great choices for their needs
3. Highlights unique handmade qualities and artisan stories
4. If no products found, suggest what they could search for instead

Keep it natural and helpful, like a knowledgeable friend. Use emojis sparingly. Don't use markdown headers. Keep paragraphs short.`;

    yield* generateStreamingContent(prompt);
}
