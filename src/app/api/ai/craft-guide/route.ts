import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiLimiter } from '@/lib/rate-limiter';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    // Rate limit: 20 requests per minute per IP
    const rateLimited = aiLimiter.check(req);
    if (rateLimited) return rateLimited;

    try {
        const { productId, question } = await req.json();

        if (!productId || !question) {
            return NextResponse.json({ error: 'productId and question are required' }, { status: 400 });
        }

        // Fetch full product context
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                artisan: {
                    include: { user: { select: { name: true } } },
                },
                craftStory: true,
                craftProvenance: true,
            },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Build rich context for Gemini
        const context = [
            `Product Title: ${product.title}`,
            `Craft Category: ${product.category}`,
            `Description: ${product.description}`,
            product.story ? `Artisan's Story: ${product.story}` : '',
            `Artisan: ${product.artisan.user.name} — ${product.artisan.craftType} artisan from ${product.artisan.location}`,
            `Artisan Experience: ${product.artisan.experienceYears} years`,
            product.artisan.materialsUsed ? `Materials Used: ${product.artisan.materialsUsed}` : '',
            product.artisan.techniquesUsed ? `Techniques: ${product.artisan.techniquesUsed}` : '',
            product.craftStory ? `Craft Story: ${product.craftStory.craftStory}` : '',
            product.craftStory ? `Craft History: ${product.craftStory.craftHistory}` : '',
            product.craftStory ? `Artisan Journey: ${product.craftStory.artisanJourney}` : '',
            product.craftStory ? `Cultural Symbolism: ${product.craftStory.culturalSymbolism}` : '',
            product.craftProvenance ? `Craft Origin: ${product.craftProvenance.craftOrigin}` : '',
            product.craftProvenance ? `Traditional Technique: ${product.craftProvenance.traditionalTechnique}` : '',
            product.craftProvenance ? `Cultural Significance: ${product.craftProvenance.culturalSignificance}` : '',
        ].filter(Boolean).join('\n');

        const prompt = `You are a knowledgeable cultural craft expert and storyteller for KarigarSetu, an Indian artisan marketplace.

You have deep expertise in Indian traditional crafts — their history, techniques, cultural significance, and the artisan communities that create them.

Here is everything you know about this specific craft product:

${context}

A buyer is asking: "${question}"

Answer their question in a warm, engaging, and educational way. Be specific to this product and craft — avoid generic responses. Keep your answer to 2-4 sentences that are informative yet conversational.

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "answer": "Your answer here..."
}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return NextResponse.json({ answer: parsed.answer });
    } catch (error) {
        console.error('[CraftGuide] Error:', error);
        return NextResponse.json({
            answer: 'I apologize — our craft expert is unavailable right now. Please try again in a moment.',
        });
    }
}
