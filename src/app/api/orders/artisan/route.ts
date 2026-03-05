import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'artisan' || !user.artisanProfile) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const artisanId = user.artisanProfile.id;
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 100);

        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        // Build where clause
        const where: Record<string, unknown> = { artisanId };
        if (status) {
            // Support comma-separated statuses
            const statuses = status.split(',').map(s => s.trim());
            if (statuses.length === 1) {
                where.status = statuses[0];
            } else {
                where.status = { in: statuses };
            }
        }

        // Date range filter
        if (dateFrom || dateTo) {
            const createdAtFilter: Record<string, Date> = {};
            if (dateFrom) createdAtFilter.gte = new Date(dateFrom);
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                createdAtFilter.lte = end;
            }
            where.createdAt = createdAtFilter;
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    title: true,
                                    imageUrl: true,
                                    category: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        // Also fetch stats for the dashboard widgets
        const [newCount, processingCount, shippedCount, revenueResult] = await Promise.all([
            prisma.order.count({ where: { artisanId, status: 'PENDING' } }),
            prisma.order.count({ where: { artisanId, status: 'PROCESSING' } }),
            prisma.order.count({ where: { artisanId, status: 'SHIPPED' } }),
            prisma.order.aggregate({
                where: { artisanId, status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
                _sum: { totalAmount: true },
            }),
        ]);

        return NextResponse.json({
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                newOrders: newCount,
                processing: processingCount,
                shipped: shippedCount,
                totalRevenue: revenueResult._sum.totalAmount || 0,
            },
        });
    } catch (error) {
        console.error('Fetch artisan orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
