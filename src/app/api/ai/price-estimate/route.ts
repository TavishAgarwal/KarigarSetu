import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { estimateFairPrice } from '@/lib/gemini';
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
        const { craftType, materials, techniques, experienceYears, productionCapacity, imageUrl } = body;

        if (!craftType) {
            return NextResponse.json({ error: 'craftType is required' }, { status: 400 });
        }

        const priceEstimate = await estimateFairPrice({
            craftType,
            materials,
            techniques,
            experienceYears,
            productionCapacity,
            imageUrl,
        });

        // Store insight in database
        const insight = await prisma.priceInsight.create({
            data: {
                craftType,
                recommendedPrice: priceEstimate.recommendedPrice,
                priceRangeMin: priceEstimate.recommendedPriceMin,
                priceRangeMax: priceEstimate.recommendedPriceMax,
                globalAverage: priceEstimate.globalAveragePrice,
                demandLevel: priceEstimate.demandLevel,
                targetMarkets: JSON.stringify(priceEstimate.targetMarkets),
                reasoning: priceEstimate.reasoning,
            },
        });

        return NextResponse.json({
            priceEstimate,
            insightId: insight.id,
        });
    } catch (error) {
        console.error('Price estimate error:', error);
        return NextResponse.json({ error: 'Failed to estimate price' }, { status: 500 });
    }
}
