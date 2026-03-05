import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateProductionPlan } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { craftType, experienceYears, productionCapacity } = body;

        if (!craftType) {
            return NextResponse.json({ error: 'craftType is required' }, { status: 400 });
        }

        // Step 1: Fetch existing trend insights
        const trendInsights = await prisma.craftTrendInsight.findMany({
            where: { craftType: { contains: craftType } },
            orderBy: { createdAt: 'desc' },
            take: 3,
        });

        const trendData = trendInsights.length > 0
            ? trendInsights.map(t => `Summary: ${t.trendSummary} | Markets: ${t.targetMarkets}`).join('\n')
            : '';

        // Step 2: Get recent sales data
        const artisanProfile = await prisma.artisanProfile.findFirst({
            where: { userId: user.id },
        });

        let existingSales = '';
        if (artisanProfile) {
            const recentOrders = await prisma.order.findMany({
                where: { artisanId: artisanProfile.id, status: { not: 'CANCELLED' } },
                include: { items: { include: { product: true } } },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });

            if (recentOrders.length > 0) {
                const productCounts: Record<string, number> = {};
                recentOrders.forEach(order => {
                    order.items.forEach(item => {
                        const key = item.product.category;
                        productCounts[key] = (productCounts[key] || 0) + item.quantity;
                    });
                });
                existingSales = Object.entries(productCounts)
                    .map(([cat, count]) => `${cat}: ${count} sold`)
                    .join(', ');
            }
        }

        // Step 3: Generate production plan with Gemini
        const plan = await generateProductionPlan({
            craftType,
            experienceYears: experienceYears || 5,
            productionCapacity: productionCapacity || 50,
            trendData,
            existingSales,
        });

        // Step 4: Store insight in database
        let dbRecord = null;
        if (artisanProfile) {
            dbRecord = await prisma.productionInsight.create({
                data: {
                    artisanId: artisanProfile.id,
                    craftType,
                    recommendedProducts: JSON.stringify(plan.recommendedProducts),
                    demandSignals: JSON.stringify(plan.demandSignals),
                    productionSuggestion: plan.productionStrategy,
                    confidenceScore: plan.confidenceScore,
                },
            });
        }

        return NextResponse.json({
            plan,
            insightId: dbRecord?.id || null,
        });
    } catch (error) {
        console.error('Production plan error:', error);
        return NextResponse.json({ error: 'Failed to generate production plan' }, { status: 500 });
    }
}

// PATCH endpoint to update insight status (planned / ignored)
export async function PATCH(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { insightId, status } = body;

        if (!insightId || !['planned', 'ignored'].includes(status)) {
            return NextResponse.json({ error: 'insightId and status (planned/ignored) required' }, { status: 400 });
        }

        const updated = await prisma.productionInsight.update({
            where: { id: insightId },
            data: { status },
        });

        return NextResponse.json({ success: true, insight: updated });
    } catch (error) {
        console.error('Update production insight error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
