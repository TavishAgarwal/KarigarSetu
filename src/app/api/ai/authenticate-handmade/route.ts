import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { authenticateHandmade } from '@/lib/gemini';
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
        const { imageUrl, craftType, materials, techniques, productId } = body;

        if (!imageUrl || !craftType) {
            return NextResponse.json({ error: 'imageUrl and craftType are required' }, { status: 400 });
        }

        const result = await authenticateHandmade({
            imageUrl,
            craftType,
            materials,
            techniques,
        });

        // Store in database if productId is provided
        let dbRecord = null;
        if (productId) {
            // Upsert — update if exists, create if not
            dbRecord = await prisma.craftAuthenticity.upsert({
                where: { productId },
                update: {
                    authenticityScore: result.authenticityScore,
                    handmadeSignals: JSON.stringify(result.handmadeSignals),
                    machineSignals: JSON.stringify(result.machineSignals),
                    verificationSummary: result.verificationSummary,
                },
                create: {
                    productId,
                    authenticityScore: result.authenticityScore,
                    handmadeSignals: JSON.stringify(result.handmadeSignals),
                    machineSignals: JSON.stringify(result.machineSignals),
                    verificationSummary: result.verificationSummary,
                },
            });
        }

        return NextResponse.json({
            authenticity: result,
            recordId: dbRecord?.id || null,
        });
    } catch (error) {
        console.error('Authenticate handmade error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
