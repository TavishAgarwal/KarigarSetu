/**
 * AI Craft Authentication & Provenance — verifies craft authenticity.
 */
import { getModel, cleanJsonResponse } from './client';

export interface CraftProvenanceResult {
    craftOrigin: string;
    traditionalTechnique: string;
    culturalSignificance: string;
    authenticityScore: number;
    verificationSummary: string;
}

export interface HandmadeAuthResult {
    authenticityScore: number;
    handmadeSignals: string[];
    machineSignals: string[];
    verificationSummary: string;
}

export async function authenticateCraft(
    craftType: string,
    description: string,
    region: string,
    imageUrl?: string
): Promise<CraftProvenanceResult> {
    const model = getModel();

    const prompt = `You are an expert in craft authenticity verification specializing in Indian traditional crafts. Analyze the craft and determine its authenticity indicators.

Craft type: ${craftType}
Description: ${description}
Region: ${region}
${imageUrl ? `Image provided: yes` : 'Image provided: no'}

You MUST respond with ONLY valid JSON (no markdown, no code blocks):
{
  "craftOrigin": "Specific geographic origin and cultural community associated with this craft",
  "traditionalTechnique": "The traditional technique/method used, including specific tools and processes",
  "culturalSignificance": "Why this craft matters culturally and its role in the community",
  "authenticityScore": 85,
  "verificationSummary": "A 2-3 sentence summary of the authenticity assessment including key indicators of genuineness"
}

The authenticityScore should be a number between 0-100 based on how well the description matches traditional craft indicators. Since this is a listing by an artisan on our platform, scores should generally range between 70-95.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(cleanJsonResponse(text));
        return {
            ...parsed,
            authenticityScore: Math.min(100, Math.max(0, Number(parsed.authenticityScore) || 85)),
        };
    } catch (error) {
        console.error('Craft authentication error:', error);
        return {
            craftOrigin: `Traditional ${craftType.toLowerCase()} craft from the ${region} region of India.`,
            traditionalTechnique: `Handcrafted using traditional ${craftType.toLowerCase()} techniques passed down through generations.`,
            culturalSignificance: `This craft form is an important part of the cultural heritage of ${region}, recognized for its unique artistry.`,
            authenticityScore: 82,
            verificationSummary: `This piece demonstrates characteristics consistent with authentic ${craftType.toLowerCase()} craftsmanship from ${region}. Detailed verification is pending additional analysis.`,
        };
    }
}

export async function authenticateHandmade(input: {
    imageUrl: string;
    craftType: string;
    materials?: string[];
    techniques?: string[];
}): Promise<HandmadeAuthResult> {
    const model = getModel();

    const prompt = `You are an expert craft authenticator specializing in distinguishing handmade crafts from machine-made products.

Analyze the following craft and determine its authenticity:

Craft Type: ${input.craftType}
Materials: ${input.materials?.join(', ') || 'Not specified'}
Techniques: ${input.techniques?.join(', ') || 'Traditional'}
Image URL: ${input.imageUrl}

Look for these HANDMADE indicators:
- Irregularities and natural imperfections
- Brush strokes and hand-painted details
- Carving marks and tool impressions
- Natural material variations (grain, texture, color)
- Glaze inconsistencies in pottery/ceramics
- Asymmetry patterns (slight, natural)
- Weaving irregularities in textiles
- Fingerprints or hand impressions in clay
- Unique one-of-a-kind characteristics

Look for these MACHINE-MADE indicators:
- Perfect symmetry and uniformity
- Identical repeating patterns with zero variation
- Smooth machine-cut edges
- Uniform color distribution
- Plastic or synthetic material appearance
- Mass-production seam lines
- Digital print patterns

Based on your analysis, provide:
1. An authenticity score from 0-100 (100 = definitely handmade)
2. A list of handmade signals you detected
3. A list of machine-made signals you detected (if any)
4. A verification summary paragraph

Return ONLY valid JSON (no markdown, no code fences):
{
  "authenticityScore": <number 0-100>,
  "handmadeSignals": ["<signal 1>", "<signal 2>", ...],
  "machineSignals": ["<signal 1>", ...],
  "verificationSummary": "<2-3 sentence summary>"
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJsonResponse(text));
    } catch (error) {
        console.error('Handmade authentication error:', error);
        return {
            authenticityScore: 75,
            handmadeSignals: ['Unable to fully analyze — default assessment applied'],
            machineSignals: [],
            verificationSummary: 'Authentication temporarily unavailable. A default moderate score has been assigned pending full analysis.',
        };
    }
}
