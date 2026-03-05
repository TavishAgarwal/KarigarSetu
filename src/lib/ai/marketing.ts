/**
 * AI Marketing Assistant — generates social media and marketplace content.
 */
import { getModel, cleanJsonResponse } from './client';

export interface MarketingContentResult {
    instagramCaption: string;
    whatsappMessage: string;
    marketplaceDescription: string;
    promotionalText: string;
}

export async function generateMarketingContent(
    productTitle: string,
    description: string,
    craftType: string
): Promise<MarketingContentResult> {
    const model = getModel();

    const prompt = `You are a social media marketing expert for handcrafted Indian artisan products.

Generate marketing content for this product:
- Product Title: ${productTitle}
- Description: ${description}
- Craft Type: ${craftType}

You MUST respond with ONLY valid JSON (no markdown, no code blocks):
{
  "instagramCaption": "An engaging Instagram caption with emojis and hashtags (max 200 chars + hashtags)",
  "whatsappMessage": "A catalog-style WhatsApp message for sharing with potential buyers (max 150 words)",
  "marketplaceDescription": "A professional marketplace listing description optimized for search (100-150 words)",
  "promotionalText": "A short promotional tagline for advertising (max 50 words)"
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text)) as MarketingContentResult;
    } catch (error) {
        console.error('Marketing content error:', error);
        return {
            instagramCaption: `✨ Handcrafted ${craftType} | ${productTitle} 🎨\n\nDiscover the beauty of Indian artisan craftsmanship.\n\n#Handmade #IndianCraft #${craftType.replace(/\s/g, '')} #Artisan #KarigarSetu`,
            whatsappMessage: `🎨 *${productTitle}*\n\nBeautiful handcrafted ${craftType} made by skilled Indian artisans. Each piece tells a story of tradition and heritage.\n\n📱 Order now on KarigarSetu`,
            marketplaceDescription: `${description}`,
            promotionalText: `Handcrafted elegance from the heart of India - ${productTitle}`,
        };
    }
}
