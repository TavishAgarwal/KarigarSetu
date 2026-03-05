import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createProductSchema, formatZodError } from '@/lib/schemas';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const region = searchParams.get('region');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const search = searchParams.get('search');
        const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12'), 1), 100);

        // Whitelist allowed sort fields to prevent field enumeration
        const ALLOWED_SORT_FIELDS = ['createdAt', 'price', 'title'];
        const sortBy = ALLOWED_SORT_FIELDS.includes(searchParams.get('sortBy') || '') ? searchParams.get('sortBy')! : 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

        // Build where clause
        const where: Record<string, unknown> = {};

        if (category) {
            where.category = category;
        }

        if (region) {
            where.artisan = {
                location: { contains: region },
            };
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
            if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { category: { contains: search } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    artisan: {
                        include: {
                            user: { select: { name: true } },
                        },
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        const response = NextResponse.json({
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });

        // Cache product listings for 60s, serve stale for 120s while revalidating
        response.headers.set(
            'Cache-Control',
            'public, s-maxage=60, stale-while-revalidate=120'
        );

        return response;
    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await prisma.artisanProfile.findUnique({
            where: { userId: user.id },
        });

        if (!profile) {
            return NextResponse.json(
                { error: 'Create an artisan profile first' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const parsed = createProductSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodError(parsed.error) },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const product = await prisma.product.create({
            data: {
                artisanId: profile.id,
                title: data.title,
                description: data.description,
                story: data.story || '',
                price: data.price,
                category: data.category,
                tags: typeof data.tags === 'string' ? data.tags : JSON.stringify(data.tags || []),
                imageUrl: data.imageUrl,
                stock: data.stock || 1,
            },
            include: {
                artisan: {
                    include: { user: { select: { name: true } } },
                },
            },
        });

        // Save AI-generated data if provided
        if (data.craftStoryData) {
            await prisma.craftStory.create({
                data: {
                    productId: product.id,
                    craftStory: data.craftStoryData.craftStory || '',
                    craftHistory: data.craftStoryData.craftHistory || '',
                    artisanJourney: data.craftStoryData.artisanJourney || '',
                    culturalSymbolism: data.craftStoryData.culturalSymbolism || '',
                },
            });
        }

        if (data.craftProvenanceData) {
            await prisma.craftProvenance.create({
                data: {
                    productId: product.id,
                    craftOrigin: data.craftProvenanceData.craftOrigin || '',
                    traditionalTechnique: data.craftProvenanceData.traditionalTechnique || '',
                    culturalSignificance: data.craftProvenanceData.culturalSignificance || '',
                    authenticityScore: data.craftProvenanceData.authenticityScore || 82,
                    verificationSummary: data.craftProvenanceData.verificationSummary || '',
                },
            });
        }

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
