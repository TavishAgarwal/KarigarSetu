import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [
            totalArtisans,
            totalProducts,
            totalOrders,
            craftTypeData,
            stateData,
            orderTotals,
        ] = await Promise.all([
            prisma.artisanProfile.count(),
            prisma.product.count(),
            prisma.order.count(),
            prisma.product.findMany({ select: { category: true }, distinct: ['category'] }),
            prisma.artisanProfile.findMany({ select: { state: true }, distinct: ['state'] }),
            prisma.order.aggregate({ _sum: { totalAmount: true } }),
        ]);

        // Estimated income = total order revenue (80% to artisans)
        const totalRevenue = orderTotals._sum.totalAmount || 0;
        const estimatedIncome = Math.round(totalRevenue * 0.8);

        // Crafts preserved = distinct craft types from artisan profiles
        const craftProfiles = await prisma.artisanProfile.findMany({
            select: { craftType: true },
            distinct: ['craftType'],
        });

        // Chart data: orders by month
        const orders = await prisma.order.findMany({
            select: { createdAt: true, totalAmount: true },
            orderBy: { createdAt: 'asc' },
        });

        const ordersByMonth: Record<string, { month: string; orders: number; revenue: number }> = {};
        for (const order of orders) {
            const key = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
            const label = order.createdAt.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            if (!ordersByMonth[key]) {
                ordersByMonth[key] = { month: label, orders: 0, revenue: 0 };
            }
            ordersByMonth[key].orders += 1;
            ordersByMonth[key].revenue += order.totalAmount;
        }

        // Chart data: products by category
        const products = await prisma.product.findMany({ select: { category: true } });
        const categoryCount: Record<string, number> = {};
        for (const p of products) {
            categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        }

        // Chart data: artisans by state
        const artisans = await prisma.artisanProfile.findMany({ select: { state: true, location: true } });
        const stateCount: Record<string, number> = {};
        for (const a of artisans) {
            const state = a.state || a.location || 'Unknown';
            stateCount[state] = (stateCount[state] || 0) + 1;
        }

        // Filter out empty states
        const statesRepresented = stateData.filter((s) => s.state && s.state.trim() !== '').length;

        return NextResponse.json({
            totalArtisans,
            totalProducts,
            totalOrders,
            totalCraftTypes: craftTypeData.length,
            statesRepresented: Math.max(statesRepresented, 1),
            estimatedIncome,
            craftsPreserved: craftProfiles.length,
            charts: {
                ordersByMonth: Object.values(ordersByMonth),
                categoryDistribution: Object.entries(categoryCount).map(([name, value]) => ({
                    name,
                    value,
                })),
                artisansByState: Object.entries(stateCount).map(([name, value]) => ({
                    name,
                    value,
                })),
            },
        });
    } catch (error) {
        console.error('[ImpactStats] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch impact stats' }, { status: 500 });
    }
}
