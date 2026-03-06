import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createProductSchema, formatZodError } from '@/lib/schemas';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                artisan: {
                    include: {
                        user: { select: { id: true, name: true } },
                        products: {
                            where: { id: { not: id } },
                            take: 3,
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { artisan: true },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (product.artisan.userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.product.delete({ where: { id } });

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { artisan: true },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (product.artisan.userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const parsed = createProductSchema.partial().safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodError(parsed.error) },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const updated = await prisma.product.update({
            where: { id },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.story !== undefined && { story: data.story }),
                ...(data.price !== undefined && { price: data.price }),
                ...(data.category !== undefined && { category: data.category }),
                ...(data.tags !== undefined && {
                    tags: typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags || []),
                }),
                ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
                ...(data.stock !== undefined && { stock: data.stock }),
            },
            include: {
                artisan: {
                    include: { user: { select: { name: true } } },
                },
            },
        });

        return NextResponse.json({ product: updated });
    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
