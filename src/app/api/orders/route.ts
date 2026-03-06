import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createOrderSchema, formatZodError } from '@/lib/schemas';

/**
 * GET /api/orders — Retrieve order history for the authenticated buyer
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10'), 1), 100);

        const where: Record<string, unknown> = { buyerId: user.id };
        if (status) where.status = status;

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
                                    price: true,
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

        return NextResponse.json({
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get buyer orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

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

        // Fetch full product data for each cart item (including stock)
        const productIds = items.map((i) => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, artisanId: true, price: true, title: true, stock: true },
        });

        const productMap = new Map(products.map(p => [p.id, p]));

        // Validate stock availability before proceeding
        for (const item of items) {
            const product = productMap.get(item.productId);
            if (!product) {
                return NextResponse.json(
                    { error: `Product not found: ${item.productId}` },
                    { status: 400 }
                );
            }
            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { error: `Insufficient stock for "${product.title}". Available: ${product.stock}, requested: ${item.quantity}` },
                    { status: 400 }
                );
            }
        }

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

        // Create all orders and decrement stock in a single transaction
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

                // Decrement stock for each product in this order
                for (const item of orderItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }

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
