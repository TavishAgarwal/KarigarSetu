import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { analyzeCraftImage } from '@/lib/gemini';
import { aiLimiter } from '@/lib/rate-limiter';
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    // Rate limit: 20 AI requests per minute per IP
    const rateLimited = aiLimiter.check(req);
    if (rateLimited) return rateLimited;

    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { imageUrl } = body;

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'Image URL is required' },
                { status: 400 }
            );
        }

        let imageBase64: string;
        let mimeType: string;

        // Handle local uploads (starts with /uploads/)
        if (imageUrl.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), 'public', imageUrl);
            const buffer = await readFile(filePath);
            imageBase64 = buffer.toString('base64');
            const ext = imageUrl.split('.').pop()?.toLowerCase() || 'jpg';
            mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        } else {
            // Handle remote URLs
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            imageBase64 = Buffer.from(arrayBuffer).toString('base64');
            mimeType = response.headers.get('content-type') || 'image/jpeg';
        }

        const analysis = await analyzeCraftImage(imageBase64, mimeType);

        return NextResponse.json({ analysis });
    } catch (error) {
        console.error('Image analysis error:', error);
        return NextResponse.json(
            { error: 'Image analysis failed' },
            { status: 500 }
        );
    }
}
