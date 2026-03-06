/**
 * GET /api/insights/pricing
 * Returns pricing benchmarks from BigQuery or Prisma fallback.
 */
import { NextResponse } from 'next/server';
import { queryPricingBenchmarks } from '@/lib/bigquery';

export const revalidate = 3600; // ISR: revalidate every hour

export async function GET() {
    try {
        const data = await queryPricingBenchmarks();
        return NextResponse.json({ pricing: data });
    } catch (error) {
        console.error('[Insights] Pricing query error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pricing insights' },
            { status: 500 }
        );
    }
}
