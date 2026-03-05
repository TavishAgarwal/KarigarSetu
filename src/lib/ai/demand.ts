/**
 * AI Global Craft Demand Analysis — analyzes demand across global markets.
 */
import { getModel, cleanJsonResponse } from './client';

export interface GlobalDemandRegion {
    region: string;
    country: string;
    demandLevel: string;
    popularStyles: string[];
    popularColors: string[];
    avgPrice: number;
}

export interface GlobalDemandResult {
    regions: GlobalDemandRegion[];
    globalTrendSummary: string;
    recommendedProducts: string[];
    recommendedColors: string[];
    recommendedMarkets: string[];
}

export async function generateGlobalCraftDemand(craftType: string): Promise<GlobalDemandResult> {
    const model = getModel();

    const prompt = `You are a global craft market analyst with expertise in artisan goods trade.

Analyze global demand for the craft type: "${craftType}"

Provide demand analysis for these 8 regions/countries:
1. India (South Asia)
2. United States (North America)
3. Japan (East Asia)
4. Germany (Europe)
5. France (Europe)
6. United Kingdom (Europe)
7. Australia (Oceania)
8. UAE (Middle East)

For each region provide:
- demandLevel: "High", "Medium", or "Low"
- popularStyles: 2-3 styles trending in that market
- popularColors: 2-3 colors preferred in that market
- avgPrice: average selling price in INR for this craft type in that market

Also provide:
- A 2-3 sentence global trend summary
- 3 recommended products the artisan should create
- 3 recommended colors to use
- 3 recommended export markets with reasoning

Return ONLY valid JSON (no markdown, no code fences):
{
  "regions": [
    {
      "region": "<region name, e.g. North America>",
      "country": "<country name>",
      "demandLevel": "<High|Medium|Low>",
      "popularStyles": ["<style1>", "<style2>"],
      "popularColors": ["<color1>", "<color2>"],
      "avgPrice": <number in INR>
    }
  ],
  "globalTrendSummary": "<summary>",
  "recommendedProducts": ["<product1>", "<product2>", "<product3>"],
  "recommendedColors": ["<color1>", "<color2>", "<color3>"],
  "recommendedMarkets": ["<market1 with reason>", "<market2 with reason>", "<market3 with reason>"]
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text));
    } catch (error) {
        console.error('Global demand analysis error:', error);
        return {
            regions: [
                { region: 'South Asia', country: 'India', demandLevel: 'High', popularStyles: ['Traditional', 'Contemporary'], popularColors: ['Indigo', 'Terracotta'], avgPrice: 800 },
                { region: 'North America', country: 'United States', demandLevel: 'High', popularStyles: ['Minimalist', 'Bohemian'], popularColors: ['Earth Tones', 'White'], avgPrice: 3500 },
                { region: 'East Asia', country: 'Japan', demandLevel: 'Medium', popularStyles: ['Wabi-Sabi', 'Modern'], popularColors: ['Natural', 'Blue'], avgPrice: 4000 },
                { region: 'Europe', country: 'Germany', demandLevel: 'High', popularStyles: ['Sustainable', 'Artisanal'], popularColors: ['Grey', 'Natural'], avgPrice: 3000 },
                { region: 'Europe', country: 'France', demandLevel: 'Medium', popularStyles: ['Elegant', 'Heritage'], popularColors: ['Cream', 'Gold'], avgPrice: 3500 },
                { region: 'Europe', country: 'United Kingdom', demandLevel: 'Medium', popularStyles: ['Rustic', 'Contemporary'], popularColors: ['Sage', 'Navy'], avgPrice: 2800 },
                { region: 'Oceania', country: 'Australia', demandLevel: 'Low', popularStyles: ['Organic', 'Coastal'], popularColors: ['Sand', 'Teal'], avgPrice: 2500 },
                { region: 'Middle East', country: 'UAE', demandLevel: 'Medium', popularStyles: ['Luxury', 'Ornate'], popularColors: ['Gold', 'Royal Blue'], avgPrice: 5000 },
            ],
            globalTrendSummary: 'Demand insights temporarily unavailable. Traditional crafts generally see strong interest across global markets.',
            recommendedProducts: ['Contemporary fusion pieces', 'Sustainable home decor', 'Personalized artisan gifts'],
            recommendedColors: ['Earth Tones', 'Indigo Blue', 'Natural White'],
            recommendedMarkets: ['United States — largest handmade goods market', 'Germany — growing sustainable craft demand', 'Japan — appreciation for traditional artistry'],
        };
    }
}
