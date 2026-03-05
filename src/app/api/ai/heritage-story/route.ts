import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { generateHeritageStory } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { craftType, region, description } = body;

        if (!craftType) {
            return NextResponse.json(
                { error: 'craftType is required' },
                { status: 400 }
            );
        }

        const story = await generateHeritageStory(
            craftType,
            region || '',
            description || ''
        );

        return NextResponse.json({ story });
    } catch (error) {
        console.error('Heritage story error:', error);
        return NextResponse.json(
            { error: 'Heritage story generation failed' },
            { status: 500 }
        );
    }
}
