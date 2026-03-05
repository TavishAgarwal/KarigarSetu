import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '@/lib/gemini';
import { aiLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
    // Rate limit: 20 requests per minute per IP
    const rateLimited = aiLimiter.check(req);
    if (rateLimited) return rateLimited;

    try {
        const body = await req.json();
        const { text, targetLanguage } = body;

        if (!text || !targetLanguage) {
            return NextResponse.json(
                { error: 'text and targetLanguage are required' },
                { status: 400 }
            );
        }

        const translated = await translateText(text, targetLanguage);

        return NextResponse.json({ translated });
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json(
            { error: 'Translation failed' },
            { status: 500 }
        );
    }
}
