/**
 * AI Trend Insights & Craft Trend Prediction — market analysis for artisans.
 */
import { getModel, cleanJsonResponse } from './client';

export interface CraftTrendPredictionResult {
    trendSummary: string;
    recommendedStyles: string[];
    recommendedColors: string[];
    targetMarkets: string[];
}

export async function generateTrendInsights(
    categories: string[],
    productCount: number
): Promise<{
    trends: { title: string; description: string; growth: string }[];
    popularColors: string[];
    exportDemand: { country: string; demand: string }[];
}> {
    const model = getModel();

    const prompt = `You are a craft market analyst. Based on current global trends for Indian artisan crafts, generate trend insights.

Available craft categories on the platform: ${categories.join(', ')}
Total products listed: ${productCount}

You MUST respond with ONLY valid JSON (no markdown, no code blocks):
{
  "trends": [
    { "title": "Trend name", "description": "Brief description", "growth": "+XX%" },
    { "title": "Trend name", "description": "Brief description", "growth": "+XX%" },
    { "title": "Trend name", "description": "Brief description", "growth": "+XX%" }
  ],
  "popularColors": ["color1", "color2", "color3", "color4"],
  "exportDemand": [
    { "country": "Country", "demand": "High/Medium/Growing" },
    { "country": "Country", "demand": "High/Medium/Growing" },
    { "country": "Country", "demand": "High/Medium/Growing" }
  ]
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text));
    } catch (error) {
        console.error('Trend insights error:', error);
        return {
            trends: [
                { title: 'Minimalist Designs', description: 'Clean, modern interpretations of traditional patterns', growth: '+35%' },
                { title: 'Sustainable Crafts', description: 'Eco-friendly materials gaining traction', growth: '+28%' },
                { title: 'Home Décor Revival', description: 'Artisan home accessories trending globally', growth: '+42%' },
            ],
            popularColors: ['Indigo Blue', 'Terracotta', 'Earth Tones', 'Gold Accents'],
            exportDemand: [
                { country: 'United States', demand: 'High' },
                { country: 'United Kingdom', demand: 'Growing' },
                { country: 'Germany', demand: 'Medium' },
            ],
        };
    }
}

export async function generateCraftTrendPrediction(
    craftType: string
): Promise<CraftTrendPredictionResult> {
    const model = getModel();

    const prompt = `You are an ecommerce market analyst specializing in handmade Indian crafts. Generate demand insights for this specific craft type.

Craft type: ${craftType}

You MUST respond with ONLY valid JSON (no markdown, no code blocks):
{
  "trendSummary": "2-3 sentence summary of current market demand trends for this craft type globally",
  "recommendedStyles": ["style1", "style2", "style3", "style4"],
  "recommendedColors": ["color1", "color2", "color3", "color4"],
  "targetMarkets": ["market1 with brief reason", "market2 with brief reason", "market3 with brief reason"]
}

Provide realistic, actionable insights that the artisan can use to adapt their craft for better sales.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text));
    } catch (error) {
        console.error('Craft trend prediction error:', error);
        return {
            trendSummary: `Demand insights temporarily unavailable. ${craftType} crafts generally see strong interest in both domestic and international markets.`,
            recommendedStyles: ['Minimalist Modern', 'Traditional Heritage', 'Fusion Contemporary', 'Eco-Sustainable'],
            recommendedColors: ['Indigo Blue', 'Terracotta', 'Natural Earth Tones', 'Gold Accents'],
            targetMarkets: ['United States — strong demand for authentic handmade goods', 'Europe — growing interest in sustainable crafts', 'Japan — appreciation for traditional artistry'],
        };
    }
}
