import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateGlobalCraftDemand } from '@/lib/gemini';
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
        const { craftType } = body;

        if (!craftType) {
            return NextResponse.json({ error: 'craftType is required' }, { status: 400 });
        }

        const demandData = await generateGlobalCraftDemand(craftType);

        // Store each region's insight in the database
        await Promise.all(
            demandData.regions.map((region) =>
                prisma.craftDemandInsight.create({
                    data: {
                        craftType,
                        region: region.region,
                        country: region.country,
                        demandLevel: region.demandLevel,
                        popularStyles: JSON.stringify(region.popularStyles),
                        popularColors: JSON.stringify(region.popularColors),
                        avgPrice: region.avgPrice,
                    },
                })
            )
        );

        return NextResponse.json({ demand: demandData });
    } catch (error) {
        console.error('Global demand error:', error);
        return NextResponse.json({ error: 'Failed to analyze global demand' }, { status: 500 });
    }
}
