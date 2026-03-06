/**
 * GET /api/insights/trends
 * Returns seasonal craft trends from BigQuery or Prisma fallback.
 */
import { NextResponse } from 'next/server';
import { querySeasonalTrends } from '@/lib/bigquery';

export const revalidate = 3600; // ISR: revalidate every hour

export async function GET() {
    try {
        const data = await querySeasonalTrends();
        return NextResponse.json({ trends: data });
    } catch (error) {
        console.error('[Insights] Trends query error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trend insights' },
            { status: 500 }
        );
    }
}
