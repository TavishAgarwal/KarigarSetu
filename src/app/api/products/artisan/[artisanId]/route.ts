import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ artisanId: string }> }
) {
    try {
        const { artisanId } = await params;
        const products = await prisma.product.findMany({
            where: { artisanId },
            include: {
                artisan: {
                    include: { user: { select: { name: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Get artisan products error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
