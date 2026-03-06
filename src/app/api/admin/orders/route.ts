import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/orders — List all orders across the platform (admin only)
 */
export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100);

        const where: Record<string, unknown> = {};
        if (status) where.status = status;

        const [orders, total, revenueResult] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: {
                                select: { id: true, title: true, imageUrl: true, category: true },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.order.count({ where }),
            prisma.order.aggregate({
                where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
                _sum: { totalAmount: true },
            }),
        ]);

        return NextResponse.json({
            orders,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            platformStats: {
                totalOrders: total,
                totalRevenue: revenueResult._sum.totalAmount || 0,
            },
        });
    } catch (error) {
        console.error('Admin list orders error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
