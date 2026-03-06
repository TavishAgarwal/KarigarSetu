import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

/**
 * GET /api/reviews?productId=xxx
 * Fetch all reviews for a product.
 */
export async function GET(req: NextRequest) {
    const productId = req.nextUrl.searchParams.get('productId');

    if (!productId) {
        return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    try {
        const reviews = await prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ reviews });
    } catch (error) {
        console.error('Fetch reviews error:', error);
        return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
    }
}

/**
 * POST /api/reviews
 * Submit a new review for a product. Requires authentication.
 *
 * Body: { productId, rating, comment }
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { productId, rating, comment } = body;

        if (!productId || !rating || !comment) {
            return NextResponse.json(
                { error: 'productId, rating, and comment are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return NextResponse.json(
                { error: 'Rating must be an integer between 1 and 5' },
                { status: 400 }
            );
        }

        if (comment.length > 500) {
            return NextResponse.json(
                { error: 'Comment must be 500 characters or less' },
                { status: 400 }
            );
        }

        // Verify the product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check if user already reviewed this product
        const existing = await prisma.review.findFirst({
            where: { productId, buyerId: user.id },
        });
        if (existing) {
            return NextResponse.json(
                { error: 'You have already reviewed this product' },
                { status: 409 }
            );
        }

        const review = await prisma.review.create({
            data: {
                productId,
                buyerId: user.id,
                buyerName: user.name,
                rating,
                comment: comment.trim(),
            },
        });

        return NextResponse.json({ review }, { status: 201 });
    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}
