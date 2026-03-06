/**
 * Product Pipeline Cloud Function
 *
 * When called, this function:
 * 1. Fetches the product image from the given URL
 * 2. Analyzes it with Vertex AI (Gemini) — craft detection, listing generation, heritage story, provenance
 * 3. Sends the structured results back to the KarigarSetu webhook endpoint
 *
 * Trigger: HTTP POST
 * Payload: { productId, imageUrl, craftType, artisanId }
 */

import { VertexAI } from '@google-cloud/vertexai';
import type { IncomingMessage, ServerResponse } from 'http';

// ─── Config ─────────────────────────────────────────────────────────────────

const PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || '';
const LOCATION = process.env.GCP_LOCATION || 'us-central1';
const WEBHOOK_URL = process.env.WEBHOOK_URL || ''; // e.g., https://karigarsetu.vercel.app/api/webhooks/cloud-functions
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// ─── Vertex AI Client ───────────────────────────────────────────────────────

let vertexAI: VertexAI | null = null;

function getVertexAI(): VertexAI {
    if (!vertexAI) {
        vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    }
    return vertexAI;
}

function getModel() {
    return getVertexAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanJson(text: string): string {
    return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return { data: base64, mimeType: contentType };
}

async function sendToWebhook(type: string, data: Record<string, unknown>): Promise<void> {
    if (!WEBHOOK_URL) {
        console.warn('[ProductPipeline] No WEBHOOK_URL configured, skipping webhook');
        return;
    }

    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': WEBHOOK_SECRET,
        },
        body: JSON.stringify({ type, data }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Webhook failed (${response.status}): ${text}`);
    }
}

// ─── AI Analysis Functions ──────────────────────────────────────────────────

async function generateListing(imageBase64: string, mimeType: string, craftType: string) {
    const model = getModel();

    const result = await model.generateContent({
        contents: [{
            role: 'user',
            parts: [
                { inlineData: { data: imageBase64, mimeType } },
                {
                    text: `You are an expert in Indian handicrafts, specifically ${craftType}.
Analyze this craft image and generate a professional marketplace listing.

Respond in JSON format:
{
  "title": "Professional product title (50-80 chars)",
  "description": "Compelling product description (200-400 words) highlighting craftsmanship, materials, and cultural significance",
  "story": "Short artisan story or craft narrative (100-200 words)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "suggestedPrice": 0,
  "category": "Craft category",
  "materials": ["material1", "material2"],
  "techniques": ["technique1", "technique2"]
}`
                },
            ],
        }],
    });

    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return JSON.parse(cleanJson(text));
}

async function generateCraftStory(imageBase64: string, mimeType: string, craftType: string) {
    const model = getModel();

    const result = await model.generateContent({
        contents: [{
            role: 'user',
            parts: [
                { inlineData: { data: imageBase64, mimeType } },
                {
                    text: `You are a cultural heritage expert specializing in Indian handicrafts, particularly ${craftType}.
Analyze this craft image and generate a rich heritage narrative.

Respond in JSON format:
{
  "craftStory": "A 200-300 word narrative about this specific craft piece — its beauty, artistry, and what makes it special",
  "craftHistory": "150-200 words about the history and evolution of ${craftType} as a craft tradition",
  "artisanJourney": "100-150 words about the typical artisan journey — how craftspeople learn and master this art form",
  "culturalSymbolism": "100-150 words about the cultural and spiritual symbolism embedded in this craft"
}`
                },
            ],
        }],
    });

    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return JSON.parse(cleanJson(text));
}

async function generateProvenance(imageBase64: string, mimeType: string, craftType: string) {
    const model = getModel();

    const result = await model.generateContent({
        contents: [{
            role: 'user',
            parts: [
                { inlineData: { data: imageBase64, mimeType } },
                {
                    text: `You are an authenticity verification expert for Indian handicrafts, specifically ${craftType}.
Analyze this craft image for authenticity indicators.

Respond in JSON format:
{
  "craftOrigin": "Geographic region and tradition this craft originates from",
  "traditionalTechnique": "Description of the traditional technique visible in this piece",
  "culturalSignificance": "Why this craft is culturally important",
  "authenticityScore": 0.0,
  "verificationSummary": "Summary of authenticity indicators found in the image"
}

authenticityScore should be between 0.0 and 1.0, where 1.0 means clearly handmade using traditional techniques.`
                },
            ],
        }],
    });

    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return JSON.parse(cleanJson(text));
}

// ─── Cloud Function Handler ─────────────────────────────────────────────────

export async function productPipeline(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Secret');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    // Validate webhook secret
    const secret = req.headers['x-webhook-secret'];
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
    }

    try {
        // Parse request body
        const body = await new Promise<string>((resolve) => {
            let data = '';
            req.on('data', (chunk) => { data += chunk; });
            req.on('end', () => resolve(data));
        });

        const { productId, imageUrl, craftType, artisanId } = JSON.parse(body);

        if (!productId || !imageUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'productId and imageUrl are required' }));
            return;
        }

        console.log(`[ProductPipeline] Processing product ${productId} (${craftType})`);

        // Step 1: Fetch image
        const image = await fetchImageAsBase64(imageUrl);
        console.log(`[ProductPipeline] Image fetched (${image.mimeType})`);

        // Step 2: Run all three AI analyses in parallel
        const [listing, craftStory, provenance] = await Promise.all([
            generateListing(image.data, image.mimeType, craftType || 'Indian handicraft'),
            generateCraftStory(image.data, image.mimeType, craftType || 'Indian handicraft'),
            generateProvenance(image.data, image.mimeType, craftType || 'Indian handicraft'),
        ]);

        console.log(`[ProductPipeline] AI analysis complete for product ${productId}`);

        // Step 3: Send results back to webhook
        await sendToWebhook('product-analysis', {
            productId,
            artisanId,
            listing,
            craftStory,
            provenance,
        });

        console.log(`[ProductPipeline] Results sent to webhook for product ${productId}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            productId,
            message: 'Pipeline completed — listing, story, and provenance generated',
        }));
    } catch (error) {
        console.error('[ProductPipeline] Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Pipeline failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        }));
    }
}
