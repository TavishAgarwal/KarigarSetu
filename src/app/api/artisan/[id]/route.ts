import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const profile = await prisma.artisanProfile.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true, createdAt: true } },
                products: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!profile) {
            return NextResponse.json({ error: 'Artisan not found' }, { status: 404 });
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Get artisan error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
