/**
 * AI Fair Price Estimator — recommends pricing based on craft, materials, and market data.
 */
import { getModel, cleanJsonResponse } from './client';

export interface PriceEstimateResult {
    recommendedPriceMin: number;
    recommendedPriceMax: number;
    recommendedPrice: number;
    globalAveragePrice: number;
    reasoning: string;
    demandLevel: string;
    targetMarkets: string[];
}

export async function estimateFairPrice(input: {
    craftType: string;
    materials?: string;
    techniques?: string;
    experienceYears?: number;
    productionCapacity?: number;
    imageUrl?: string;
}): Promise<PriceEstimateResult> {
    const model = getModel();

    const prompt = `You are an expert craft pricing analyst with deep knowledge of global artisan marketplaces (Etsy, Amazon Handmade, Novica, IndiaMART, GoCoop).

Analyze the following craft details and estimate a fair selling price in Indian Rupees (₹):

Craft Type: ${input.craftType}
Materials Used: ${input.materials || 'Not specified'}
Techniques: ${input.techniques || 'Traditional'}
Artisan Experience: ${input.experienceYears || 'Unknown'} years
Production Capacity: ${input.productionCapacity || 'Unknown'} items/month

Consider these factors:
1. Raw material costs in India for the specified materials
2. Labor time and skill level required for the technique
3. Rarity and uniqueness of the craft tradition
4. Artisan's experience premium
5. Global marketplace pricing for similar handmade items
6. Domestic vs international buyer expectations
7. Fair trade pricing principles ensuring artisan livelihood

Return ONLY valid JSON (no markdown, no code fences):
{
  "recommendedPriceMin": <number in INR>,
  "recommendedPriceMax": <number in INR>,
  "recommendedPrice": <number in INR, the sweet spot>,
  "globalAveragePrice": <number in INR, what similar items sell for globally>,
  "reasoning": "<2-3 sentence explanation of pricing logic>",
  "demandLevel": "<High|Medium|Low>",
  "targetMarkets": ["<market 1 with context>", "<market 2 with context>", "<market 3 with context>"]
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text));
    } catch (error) {
        console.error('Price estimation error:', error);
        return {
            recommendedPriceMin: 500,
            recommendedPriceMax: 2500,
            recommendedPrice: 1200,
            globalAveragePrice: 1800,
            reasoning: 'Price estimation temporarily unavailable. Default range provided based on average artisan craft pricing.',
            demandLevel: 'Medium',
            targetMarkets: ['India — strong domestic demand', 'United States — growing handmade market', 'Europe — fair trade interest'],
        };
    }
}
