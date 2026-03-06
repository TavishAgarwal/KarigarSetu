/**
 * GET /api/insights/demand
 * Returns demand-by-region data from BigQuery or Prisma fallback.
 */
import { NextResponse } from 'next/server';
import { queryDemandByRegion } from '@/lib/bigquery';

export const revalidate = 3600; // ISR: revalidate every hour

export async function GET() {
    try {
        const data = await queryDemandByRegion();
        return NextResponse.json({ demand: data });
    } catch (error) {
        console.error('[Insights] Demand query error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch demand insights' },
            { status: 500 }
        );
    }
}
