import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { generateCraftStory } from '@/lib/gemini';
import { aiLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
    const rateLimited = aiLimiter.check(req);
    if (rateLimited) return rateLimited;

    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { craftType, region, description, artisanBio } = body;

        if (!craftType || !description) {
            return NextResponse.json(
                { error: 'craftType and description are required' },
                { status: 400 }
            );
        }

        const story = await generateCraftStory(
            craftType,
            region || 'India',
            description,
            artisanBio
        );

        return NextResponse.json({ story });
    } catch (error) {
        console.error('Craft story generation error:', error);
        return NextResponse.json(
            { error: 'Craft story generation failed' },
            { status: 500 }
        );
    }
}
