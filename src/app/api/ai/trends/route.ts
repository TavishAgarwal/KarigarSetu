import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { generateTrendInsights } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { aiLimiter } from '@/lib/rate-limiter';

export async function GET(req: NextRequest) {
    const rateLimited = aiLimiter.check(req);
    if (rateLimited) return rateLimited;

    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get unique categories and product count
        const products = await prisma.product.findMany({
            select: { category: true },
        });

        const categories = [...new Set(products.map((p) => p.category))];

        const insights = await generateTrendInsights(categories, products.length);

        return NextResponse.json(insights);
    } catch (error) {
        console.error('Trend insights error:', error);
        return NextResponse.json(
            { error: 'Failed to generate trend insights' },
            { status: 500 }
        );
    }
}
