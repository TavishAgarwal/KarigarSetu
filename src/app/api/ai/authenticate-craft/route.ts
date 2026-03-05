import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { authenticateCraft } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { craftType, description, imageUrl, region } = body;

        if (!craftType || !description) {
            return NextResponse.json(
                { error: 'craftType and description are required' },
                { status: 400 }
            );
        }

        const provenance = await authenticateCraft(
            craftType,
            description,
            region || 'India',
            imageUrl
        );

        return NextResponse.json({ provenance });
    } catch (error) {
        console.error('Craft authentication error:', error);
        return NextResponse.json(
            { error: 'Craft authentication failed' },
            { status: 500 }
        );
    }
}
