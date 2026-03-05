/**
 * AI Product Listing Generator — creates compelling marketplace listings.
 */
import { getModel, cleanJsonResponse } from './client';

export interface AIListingResult {
    title: string;
    description: string;
    story: string;
    tags: string[];
    suggestedPrice: number;
}

export async function generateListing(
    imageUrl: string,
    craftDescription: string,
    craftType: string,
    visionContext?: {
        detectedCraft?: string;
        category?: string;
        materials?: string;
        suggestedTitle?: string;
        tags?: string[];
    }
): Promise<AIListingResult> {
    const model = getModel();

    const visionSection = visionContext
        ? `\nAI Vision Analysis of the product image:
- Detected Craft: ${visionContext.detectedCraft || 'N/A'}
- Category: ${visionContext.category || 'N/A'}
- Materials & Techniques: ${visionContext.materials || 'N/A'}
- Suggested Title: ${visionContext.suggestedTitle || 'N/A'}
- Auto-detected Tags: ${visionContext.tags?.join(', ') || 'N/A'}`
        : '';

    const descriptionSection = craftDescription
        ? `- Description from Artisan: ${craftDescription}`
        : '- No description provided by artisan (rely on image analysis above)';

    const prompt = `You are an expert craft storyteller and marketplace marketer specializing in Indian artisan crafts. 

Given the following information about a handcrafted item:
- Craft Type (from artisan profile): ${craftType}
${descriptionSection}
- Image URL: ${imageUrl}${visionSection}

Generate a compelling product listing for this artisan craft. The listing should celebrate the heritage, skill, and cultural significance of the craft. Use the vision analysis data to create accurate, detailed descriptions.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "title": "A compelling, descriptive product title (max 80 chars)",
  "description": "A detailed product description highlighting materials, techniques, dimensions, and unique qualities (150-250 words)",
  "story": "A rich cultural narrative about this craft - its origins, the artisan's journey, the tradition behind it, and why it matters. Written in an engaging, storytelling style (150-200 words)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "suggestedPrice": 0
}

For suggestedPrice, suggest a fair price in INR (Indian Rupees) based on the craft type, complexity, and market value. The price should be realistic for Indian artisan crafts.

The tags should be relevant marketplace tags like craft type, material, region, style, and use case.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text)) as AIListingResult;
    } catch (error) {
        console.error('AI Generation Error:', error);
        return {
            title: visionContext?.suggestedTitle || `Handcrafted ${craftType}`,
            description: craftDescription || `A beautiful handcrafted ${craftType} made by a skilled artisan.`,
            story: `This ${craftType} represents generations of traditional craftsmanship passed down through artisan families.`,
            tags: visionContext?.tags || [craftType.toLowerCase(), 'handmade', 'artisan', 'traditional', 'indian-craft'],
            suggestedPrice: 999,
        };
    }
}
