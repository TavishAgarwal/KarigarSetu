import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/artisans — List artisan profiles with optional status filter (admin only)
 */
export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'unverified';
        const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100);

        const where: Record<string, unknown> = {};
        if (status !== 'all') where.verificationStatus = status;

        const [artisans, total] = await Promise.all([
            prisma.artisanProfile.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true, createdAt: true } },
                    _count: { select: { products: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.artisanProfile.count({ where }),
        ]);

        return NextResponse.json({
            artisans,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Admin list artisans error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/artisans — Approve or reject an artisan (admin only)
 * Body: { artisanId: string, verificationStatus: 'verified' | 'rejected' | 'unverified' }
 */
export async function PATCH(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;

    try {
        const { artisanId, verificationStatus } = await req.json();

        if (!artisanId || !['verified', 'rejected', 'unverified'].includes(verificationStatus)) {
            return NextResponse.json(
                { error: 'Invalid artisanId or verificationStatus' },
                { status: 400 }
            );
        }

        const updated = await prisma.artisanProfile.update({
            where: { id: artisanId },
            data: { verificationStatus },
            include: { user: { select: { name: true, email: true } } },
        });

        return NextResponse.json({ artisan: updated });
    } catch (error) {
        console.error('Admin update artisan error:', error);
        return NextResponse.json({ error: 'Failed to update artisan' }, { status: 500 });
    }
}
