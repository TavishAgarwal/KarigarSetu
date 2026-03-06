/**
 * Cloud Functions webhook endpoint.
 * Receives results from Cloud Functions (AI pipeline, notifications)
 * and saves them to the database.
 *
 * POST /api/webhooks/cloud-functions
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    // Validate webhook secret
    const secret = req.headers.get('x-webhook-secret');
    const expectedSecret = process.env.CLOUD_FUNCTION_WEBHOOK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { type, data } = body;

        switch (type) {
            case 'product-analysis': {
                // Save AI analysis results to database
                const { productId, listing, craftStory, provenance } = data;

                if (listing) {
                    await prisma.product.update({
                        where: { id: productId },
                        data: {
                            title: listing.title,
                            description: listing.description,
                            story: listing.story,
                            tags: JSON.stringify(listing.tags),
                            price: listing.suggestedPrice,
                        },
                    });
                }

                if (craftStory) {
                    await prisma.craftStory.upsert({
                        where: { productId },
                        create: {
                            productId,
                            craftStory: craftStory.craftStory,
                            craftHistory: craftStory.craftHistory,
                            artisanJourney: craftStory.artisanJourney,
                            culturalSymbolism: craftStory.culturalSymbolism,
                        },
                        update: {
                            craftStory: craftStory.craftStory,
                            craftHistory: craftStory.craftHistory,
                            artisanJourney: craftStory.artisanJourney,
                            culturalSymbolism: craftStory.culturalSymbolism,
                        },
                    });
                }

                if (provenance) {
                    await prisma.craftProvenance.upsert({
                        where: { productId },
                        create: {
                            productId,
                            craftOrigin: provenance.craftOrigin,
                            traditionalTechnique: provenance.traditionalTechnique,
                            culturalSignificance: provenance.culturalSignificance,
                            authenticityScore: provenance.authenticityScore,
                            verificationSummary: provenance.verificationSummary,
                        },
                        update: {
                            craftOrigin: provenance.craftOrigin,
                            traditionalTechnique: provenance.traditionalTechnique,
                            culturalSignificance: provenance.culturalSignificance,
                            authenticityScore: provenance.authenticityScore,
                            verificationSummary: provenance.verificationSummary,
                        },
                    });
                }

                return NextResponse.json({ success: true, type: 'product-analysis' });
            }

            case 'notification-sent': {
                // Log notification delivery
                console.info('[Webhook] Notification sent:', data);
                return NextResponse.json({ success: true, type: 'notification-sent' });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown webhook type: ${type}` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('[Webhook] Error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
