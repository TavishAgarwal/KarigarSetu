import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { generateMarketingContent } from '@/lib/gemini';
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
        const { productTitle, description, craftType } = body;

        if (!productTitle || !craftType) {
            return NextResponse.json(
                { error: 'productTitle and craftType are required' },
                { status: 400 }
            );
        }

        const content = await generateMarketingContent(
            productTitle,
            description || '',
            craftType
        );

        return NextResponse.json({ content });
    } catch (error) {
        console.error('Marketing content error:', error);
        return NextResponse.json(
            { error: 'Marketing content generation failed' },
            { status: 500 }
        );
    }
}
