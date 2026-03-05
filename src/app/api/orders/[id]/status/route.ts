import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { VALID_TRANSITIONS } from '@/types/order';
import { updateOrderStatusSchema, formatZodError } from '@/lib/schemas';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req);
        if (!user || user.role !== 'artisan' || !user.artisanProfile) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const parsed = updateOrderStatusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodError(parsed.error) },
                { status: 400 }
            );
        }

        const newStatus = parsed.data.status;

        // Fetch the order
        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Auth: artisan can only modify their own orders
        if (order.artisanId !== user.artisanProfile.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Validate transition
        const allowedTransitions = VALID_TRANSITIONS[order.status] || [];
        if (!allowedTransitions.includes(newStatus)) {
            return NextResponse.json(
                { error: `Cannot transition from ${order.status} to ${newStatus}` },
                { status: 400 }
            );
        }

        const updated = await prisma.order.update({
            where: { id },
            data: { status: newStatus },
            include: {
                items: {
                    include: {
                        product: {
                            select: { id: true, title: true, imageUrl: true },
                        },
                    },
                },
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Order status update error:', error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}
