/**
 * AI Heritage Story Engine — generates cultural heritage narratives.
 * Also includes Craft Story generation for product pages.
 */
import { getModel, cleanJsonResponse } from './client';

export interface HeritageStoryResult {
    origin: string;
    history: string;
    techniques: string;
    culturalSymbolism: string;
    artisanStory: string;
    didYouKnow: string;
}

export interface CraftStoryResult {
    craftStory: string;
    craftHistory: string;
    artisanJourney: string;
    culturalSymbolism: string;
}

export async function generateHeritageStory(
    craftType: string,
    region: string,
    description: string
): Promise<HeritageStoryResult> {
    const model = getModel();

    const prompt = `You are a cultural heritage expert specializing in Indian traditional crafts.

Generate a comprehensive heritage story for this craft:
- Craft Type: ${craftType}
- Region: ${region}
- Description: ${description}

You MUST respond with ONLY valid JSON (no markdown, no code blocks):
{
  "origin": "Where this craft originated, the specific region and community (2-3 sentences)",
  "history": "The historical background - how old the tradition is, royal patronage, evolution (3-4 sentences)",
  "techniques": "The traditional techniques used - specific methods, tools, and processes (3-4 sentences)",
  "culturalSymbolism": "The cultural and spiritual significance - what motifs mean, ritual connections (2-3 sentences)",
  "artisanStory": "A narrative about the artisan communities who practice this craft (2-3 sentences)",
  "didYouKnow": "An interesting, surprising fact about this craft tradition (1-2 sentences)"
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text)) as HeritageStoryResult;
    } catch (error) {
        console.error('Heritage story error:', error);
        return {
            origin: `This ${craftType} tradition originates from ${region || 'India'}, where artisan communities have practiced it for generations.`,
            history: `The craft has a rich history spanning centuries, with evidence of royal patronage and community practice.`,
            techniques: `Traditional techniques involve handwork and specialized tools passed down through generations.`,
            culturalSymbolism: `The motifs and patterns carry deep cultural significance, often representing nature, spirituality, and community life.`,
            artisanStory: `Artisan families dedicate their lives to preserving this craft, with skills passed from parent to child.`,
            didYouKnow: `This craft tradition is recognized for its cultural importance and is practiced by thousands of artisan families across India.`,
        };
    }
}

export async function generateCraftStory(
    craftType: string,
    region: string,
    description: string,
    artisanBio?: string
): Promise<CraftStoryResult> {
    const model = getModel();

    const prompt = `You are a cultural historian specializing in traditional Indian crafts. Generate a heritage narrative for this craft.

Craft type: ${craftType}
Region: ${region}
Description: ${description}
${artisanBio ? `Artisan background: ${artisanBio}` : ''}

You MUST respond with ONLY valid JSON (no markdown, no code blocks):
{
  "craftStory": "A compelling 2-3 sentence narrative about this specific craft piece, its making, and what makes it unique",
  "craftHistory": "2-3 sentences about the historical origins and evolution of this craft tradition",
  "artisanJourney": "2-3 sentences about the artisan's craft journey and expertise (can be generalized if not provided)",
  "culturalSymbolism": "2-3 sentences about the cultural symbols, motifs, and meanings embedded in this craft"
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text));
    } catch (error) {
        console.error('Craft story generation error:', error);
        return {
            craftStory: `This exquisite ${craftType.toLowerCase()} piece from ${region} represents centuries of artistic tradition passed down through generations.`,
            craftHistory: `The ${craftType.toLowerCase()} tradition of ${region} dates back centuries, evolving through royal patronage and community craftsmanship.`,
            artisanJourney: 'The artisan behind this piece carries forward a legacy of traditional craftsmanship, honed through years of dedicated practice and mentorship.',
            culturalSymbolism: `Each motif and pattern in this ${craftType.toLowerCase()} carries deep cultural significance, reflecting the spiritual and natural heritage of ${region}.`,
        };
    }
}
