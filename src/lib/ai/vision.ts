/**
 * AI Craft Recognition (Vision) — analyzes craft images using Gemini.
 */
import { getModel, cleanJsonResponse } from './client';

export interface VisionAnalysisResult {
    craftType: string;
    category: string;
    tags: string[];
    materials: string;
    suggestedTitle: string;
}

export async function analyzeCraftImage(
    imageBase64: string,
    mimeType: string
): Promise<VisionAnalysisResult> {
    const model = getModel();

    const prompt = `You are an expert in Indian traditional crafts and artisan products.

Analyze this craft image and identify:
1. The craft type (e.g., Madhubani Painting, Blue Pottery, Banarasi Silk, etc.)
2. The product category (e.g., Wall Art, Home Decor, Jewelry, Clothing, etc.)
3. Relevant tags for marketplace listing
4. Materials and techniques visible
5. A suggested product title

You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "craftType": "The specific craft tradition name",
  "category": "Product category",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "materials": "Brief description of materials and techniques visible",
  "suggestedTitle": "A compelling product title"
}`;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType,
                },
            },
        ]);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text)) as VisionAnalysisResult;
    } catch (error) {
        console.error('Vision analysis error:', error);
        return {
            craftType: 'Traditional Craft',
            category: 'Handmade',
            tags: ['handmade', 'artisan', 'traditional', 'indian-craft'],
            materials: 'Traditional materials',
            suggestedTitle: 'Handcrafted Artisan Product',
        };
    }
}
