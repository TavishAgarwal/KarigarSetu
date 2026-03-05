import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createOrderSchema, formatZodError } from '@/lib/schemas';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const parsed = createOrderSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodError(parsed.error) },
                { status: 400 }
            );
        }

        const { items, shippingForm } = parsed.data;

        // Fetch full product data for each cart item
        const productIds = items.map((i) => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, artisanId: true, price: true, title: true },
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        // Group items by artisanId
        const artisanGroups: Record<string, { productId: string; quantity: number; price: number }[]> = {};

        for (const item of items) {
            const product = productMap.get(item.productId);
            if (!product) continue;

            if (!artisanGroups[product.artisanId]) {
                artisanGroups[product.artisanId] = [];
            }
            artisanGroups[product.artisanId].push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
            });
        }

        // Create all orders in a single transaction for data integrity
        const orderIds = await prisma.$transaction(async (tx) => {
            const ids: string[] = [];

            for (const [artisanId, orderItems] of Object.entries(artisanGroups)) {
                const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

                const order = await tx.order.create({
                    data: {
                        buyerId: user.id,
                        artisanId,
                        totalAmount,
                        status: 'PENDING',
                        buyerName: shippingForm?.fullName || user.name,
                        buyerAddress: [
                            shippingForm?.address,
                            shippingForm?.city,
                            shippingForm?.state,
                            shippingForm?.pincode,
                        ].filter(Boolean).join(', '),
                        buyerPhone: shippingForm?.phone || '',
                        items: {
                            create: orderItems.map(i => ({
                                productId: i.productId,
                                quantity: i.quantity,
                                price: i.price,
                            })),
                        },
                    },
                });

                ids.push(order.id);
            }

            return ids;
        });

        return NextResponse.json({ success: true, orderIds }, { status: 201 });
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
