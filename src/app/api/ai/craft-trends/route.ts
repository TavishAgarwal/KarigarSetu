import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { generateCraftTrendPrediction } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { craftType } = body;

        if (!craftType) {
            return NextResponse.json(
                { error: 'craftType is required' },
                { status: 400 }
            );
        }

        const prediction = await generateCraftTrendPrediction(craftType);

        return NextResponse.json({ prediction });
    } catch (error) {
        console.error('Craft trend prediction error:', error);
        return NextResponse.json(
            { error: 'Craft trend prediction failed' },
            { status: 500 }
        );
    }
}
