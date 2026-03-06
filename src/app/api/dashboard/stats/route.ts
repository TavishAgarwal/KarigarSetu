import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await prisma.artisanProfile.findUnique({
            where: { userId: user.id },
            include: {
                products: {
                    orderBy: { createdAt: 'desc' },
                    select: { id: true, price: true, createdAt: true, stock: true },
                },
            },
        });

        if (!profile) {
            return NextResponse.json({
                totalProducts: 0,
                totalRevenue: 0,
                totalStock: 0,
                weeklyData: [0, 0, 0, 0, 0, 0, 0],
                monthlyData: [],
            });
        }

        const products = profile.products;
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

        // Calculate actual revenue from confirmed/delivered orders
        const revenueResult = await prisma.order.aggregate({
            where: {
                artisanId: profile.id,
                status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
            },
            _sum: { totalAmount: true },
        });
        const totalRevenue = revenueResult._sum.totalAmount || 0;

        // Compute weekly product creation counts (last 7 days)
        const now = new Date();
        const weeklyData = Array(7).fill(0);
        for (const p of products) {
            const diffDays = Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                // Map: 0=today(SUN), ... 6=6 days ago(MON)
                weeklyData[6 - diffDays] += 1;
            }
        }

        // Compute monthly revenue breakdown (last 7 months)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyMap: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${monthNames[d.getMonth()]}`;
            monthlyMap[key] = 0;
        }
        for (const p of products) {
            const d = new Date(p.createdAt);
            const key = monthNames[d.getMonth()];
            if (key in monthlyMap) {
                monthlyMap[key] += p.price;
            }
        }
        const monthlyData = Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue }));

        return NextResponse.json({
            totalProducts,
            totalRevenue,
            totalStock,
            weeklyData,
            monthlyData,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
