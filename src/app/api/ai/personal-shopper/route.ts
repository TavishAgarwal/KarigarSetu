import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseShopperIntent, generateShopperResponse, ShopperProduct } from '@/lib/gemini';
import { aiLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
    // Rate limit: 20 requests per minute per IP (no auth required for shopper)
    const rateLimited = aiLimiter.check(req);
    if (rateLimited) return rateLimited;

    try {
        const body = await req.json();
        const { query } = body;

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json({ error: 'query is required' }, { status: 400 });
        }

        // Step 1: Parse buyer intent
        const intent = await parseShopperIntent(query.trim());

        // Step 2: Search products from database
        const whereClause: Record<string, unknown> = {
            price: {
                gte: intent.budgetMin,
                lte: intent.budgetMax,
            },
        };

        if (intent.category) {
            whereClause.category = {
                contains: intent.category,
            };
        }

        // Fetch matching products
        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                artisan: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        // Score and rank products by keyword relevance
        const scored = products.map(p => {
            let score = 0;
            const searchText = `${p.title} ${p.description} ${p.tags} ${p.category}`.toLowerCase();

            for (const keyword of intent.keywords) {
                if (searchText.includes(keyword.toLowerCase())) score += 10;
            }
            for (const style of intent.stylePreferences) {
                if (searchText.includes(style.toLowerCase())) score += 5;
            }
            if (intent.region && p.artisan.location?.toLowerCase().includes(intent.region.toLowerCase())) {
                score += 8;
            }

            return { product: p, score };
        });

        // Sort by relevance and take top 5
        scored.sort((a, b) => b.score - a.score);
        const topProducts = scored.slice(0, 5);

        // Step 3: Format products for Gemini
        const shopperProducts: ShopperProduct[] = topProducts.map(({ product }) => ({
            id: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category,
            description: product.description,
            artisanName: product.artisan.user.name,
            craftType: product.artisan.craftType,
        }));

        // Step 4: Generate AI response
        const responseText = await generateShopperResponse(query, shopperProducts);

        // Step 5: Return recommendations
        const recommendedProducts = shopperProducts.map(p => ({
            productId: p.id,
            title: p.title,
            price: p.price,
            imageUrl: p.imageUrl,
            artisanName: p.artisanName,
            craftType: p.craftType,
        }));

        return NextResponse.json({
            responseText,
            recommendedProducts,
            intent,
        });
    } catch (error) {
        console.error('Personal shopper error:', error);
        return NextResponse.json({ error: 'Failed to process your request' }, { status: 500 });
    }
}
