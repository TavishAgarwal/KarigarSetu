import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { generateListing } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || !user.artisanProfile) {
            return NextResponse.json({ error: 'Unauthorized — artisan profile required' }, { status: 401 });
        }

        const body = await req.json();
        const { imageUrl, description, visionContext } = body;

        // Craft type is auto-derived from the artisan's profile
        const craftType = user.artisanProfile.craftType;

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'A product photo is required' },
                { status: 400 }
            );
        }

        const listing = await generateListing(
            imageUrl,
            description || '',
            craftType,
            visionContext || undefined
        );

        return NextResponse.json({ listing, craftType });
    } catch (error) {
        console.error('AI generation error:', error);
        return NextResponse.json(
            { error: 'AI generation failed' },
            { status: 500 }
        );
    }
}
