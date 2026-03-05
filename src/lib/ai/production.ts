/**
 * AI Production Planning — helps artisans decide what to produce next.
 */
import { getModel, cleanJsonResponse } from './client';

export interface ProductionPlanResult {
    recommendedProducts: {
        productType: string;
        estimatedDemand: string;
        suggestedQuantity: number;
        targetMarkets: string[];
        reasonForRecommendation: string;
    }[];
    demandSignals: string[];
    productionStrategy: string;
    confidenceScore: number;
}

export async function generateProductionPlan(input: {
    craftType: string;
    experienceYears: number;
    productionCapacity: number;
    trendData?: string;
    existingSales?: string;
}): Promise<ProductionPlanResult> {
    const model = getModel();

    const prompt = `You are a production planning expert for Indian handcraft artisans on KarigarSetu marketplace.

Artisan Profile:
- Craft Type: ${input.craftType}
- Experience: ${input.experienceYears} years
- Monthly Production Capacity: ${input.productionCapacity} items

${input.trendData ? `Current Market Trends:\n${input.trendData}` : ''}
${input.existingSales ? `Recent Sales Data:\n${input.existingSales}` : ''}

Based on current global market demand, seasonal trends, and the artisan's capabilities, recommend what products they should produce next month.

Consider:
- Popular demand in global markets (US, Europe, Japan, India)
- Seasonal trends and upcoming festivals
- Artisan's craft specialization and experience
- Production capacity constraints
- Price-to-demand ratio for maximum revenue

Return ONLY valid JSON (no markdown, no code fences):
{
  "recommendedProducts": [
    {
      "productType": "<specific product name>",
      "estimatedDemand": "High|Medium|Low",
      "suggestedQuantity": <number within capacity>,
      "targetMarkets": ["<market 1>", "<market 2>"],
      "reasonForRecommendation": "<why this product>"
    }
  ],
  "demandSignals": [
    "<signal 1: e.g. 'Cotton textiles trending in Europe'>",
    "<signal 2>",
    "<signal 3>"
  ],
  "productionStrategy": "<2-3 sentence strategy paragraph for next month>",
  "confidenceScore": <number 0-100>
}

Recommend 4-6 products. Ensure total suggested quantities don't exceed production capacity.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text));
    } catch (error) {
        console.error('Production plan error:', error);
        return {
            recommendedProducts: [
                {
                    productType: `Traditional ${input.craftType} pieces`,
                    estimatedDemand: 'Medium',
                    suggestedQuantity: Math.floor(input.productionCapacity * 0.4),
                    targetMarkets: ['India', 'USA'],
                    reasonForRecommendation: 'Steady demand for traditional items',
                },
                {
                    productType: `Contemporary ${input.craftType} designs`,
                    estimatedDemand: 'High',
                    suggestedQuantity: Math.floor(input.productionCapacity * 0.3),
                    targetMarkets: ['Europe', 'USA'],
                    reasonForRecommendation: 'Growing interest in fusion designs',
                },
            ],
            demandSignals: [
                'General demand for handcrafted items remains steady',
                'Eco-friendly crafts gaining popularity globally',
            ],
            productionStrategy: `Focus on a mix of traditional and contemporary ${input.craftType} pieces. Prioritize quality over quantity to maintain your artisan brand value.`,
            confidenceScore: 65,
        };
    }
}
