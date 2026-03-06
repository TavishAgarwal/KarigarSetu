/**
 * BigQuery client helper for market intelligence analytics.
 * Provides query functions for demand, trends, and pricing data.
 *
 * When BigQuery is not configured, falls back to Prisma-aggregated data.
 *
 * SERVER-SIDE ONLY.
 */
import { BigQuery } from '@google-cloud/bigquery';
import { getGoogleCloudConfig } from './googleCloud';
import { isBigQueryEnabled } from './featureFlags';
import { prisma } from './prisma';

let bigQueryInstance: BigQuery | null = null;

function getBigQuery(): BigQuery {
    if (bigQueryInstance) return bigQueryInstance;

    const config = getGoogleCloudConfig();
    const projectId = process.env.GCP_PROJECT_ID;

    if (config) {
        bigQueryInstance = new BigQuery({
            projectId: config.projectId,
            credentials: {
                client_email: config.clientEmail,
                private_key: config.privateKey,
            },
        });
    } else {
        bigQueryInstance = new BigQuery({ projectId });
    }

    return bigQueryInstance;
}

function getDataset(): string {
    return process.env.BIGQUERY_DATASET || 'karigarsetu_analytics';
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DemandByRegion {
    region: string;
    state: string;
    totalOrders: number;
    totalRevenue: number;
    topCraftTypes: string[];
    demandLevel: 'High' | 'Medium' | 'Low';
}

export interface SeasonalTrend {
    month: string;
    craftType: string;
    orderCount: number;
    avgPrice: number;
    growthPercent: number;
}

export interface PricingBenchmark {
    craftType: string;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    medianPrice: number;
    productCount: number;
}

// ─── Query Functions ────────────────────────────────────────────────────────

/**
 * Query demand by region.
 * Uses BigQuery when configured, otherwise aggregates from Prisma.
 */
export async function queryDemandByRegion(): Promise<DemandByRegion[]> {
    if (isBigQueryEnabled()) {
        try {
            const bigquery = getBigQuery();
            const dataset = getDataset();

            const query = `
                SELECT
                    region, state,
                    COUNT(*) as totalOrders,
                    SUM(totalAmount) as totalRevenue,
                    ARRAY_AGG(DISTINCT craftType LIMIT 5) as topCraftTypes
                FROM \`${dataset}.orders_enriched\`
                GROUP BY region, state
                ORDER BY totalOrders DESC
                LIMIT 20
            `;

            const [rows] = await bigquery.query({ query });
            return (rows as Record<string, unknown>[]).map((row) => ({
                region: String(row.region || ''),
                state: String(row.state || ''),
                totalOrders: Number(row.totalOrders || 0),
                totalRevenue: Number(row.totalRevenue || 0),
                topCraftTypes: (row.topCraftTypes as string[]) || [],
                demandLevel: Number(row.totalOrders) > 50 ? 'High' : Number(row.totalOrders) > 20 ? 'Medium' : 'Low',
            }));
        } catch (error) {
            console.error('[BigQuery] Demand query failed, falling back to Prisma:', error);
        }
    }

    // Fallback: aggregate from Prisma
    return queryDemandFromPrisma();
}

/**
 * Query seasonal craft trends.
 * Uses BigQuery when configured, otherwise aggregates from Prisma.
 */
export async function querySeasonalTrends(): Promise<SeasonalTrend[]> {
    if (isBigQueryEnabled()) {
        try {
            const bigquery = getBigQuery();
            const dataset = getDataset();

            const query = `
                SELECT
                    FORMAT_DATE('%Y-%m', orderDate) as month,
                    craftType,
                    COUNT(*) as orderCount,
                    AVG(price) as avgPrice
                FROM \`${dataset}.order_items_enriched\`
                GROUP BY month, craftType
                ORDER BY month DESC, orderCount DESC
                LIMIT 50
            `;

            const [rows] = await bigquery.query({ query });
            return (rows as Record<string, unknown>[]).map((row) => ({
                month: String(row.month || ''),
                craftType: String(row.craftType || ''),
                orderCount: Number(row.orderCount || 0),
                avgPrice: Number(row.avgPrice || 0),
                growthPercent: 0, // Calculated separately
            }));
        } catch (error) {
            console.error('[BigQuery] Trends query failed, falling back to Prisma:', error);
        }
    }

    // Fallback: aggregate from Prisma
    return queryTrendsFromPrisma();
}

/**
 * Query pricing benchmarks by craft type.
 * Uses BigQuery when configured, otherwise aggregates from Prisma.
 */
export async function queryPricingBenchmarks(): Promise<PricingBenchmark[]> {
    if (isBigQueryEnabled()) {
        try {
            const bigquery = getBigQuery();
            const dataset = getDataset();

            const query = `
                SELECT
                    craftType,
                    AVG(price) as avgPrice,
                    MIN(price) as minPrice,
                    MAX(price) as maxPrice,
                    APPROX_QUANTILES(price, 2)[OFFSET(1)] as medianPrice,
                    COUNT(*) as productCount
                FROM \`${dataset}.products\`
                GROUP BY craftType
                ORDER BY productCount DESC
            `;

            const [rows] = await bigquery.query({ query });
            return (rows as Record<string, unknown>[]).map((row) => ({
                craftType: String(row.craftType || ''),
                avgPrice: Number(row.avgPrice || 0),
                minPrice: Number(row.minPrice || 0),
                maxPrice: Number(row.maxPrice || 0),
                medianPrice: Number(row.medianPrice || 0),
                productCount: Number(row.productCount || 0),
            }));
        } catch (error) {
            console.error('[BigQuery] Pricing query failed, falling back to Prisma:', error);
        }
    }

    // Fallback: aggregate from Prisma
    return queryPricingFromPrisma();
}

// ─── Prisma Fallbacks ───────────────────────────────────────────────────────

async function queryDemandFromPrisma(): Promise<DemandByRegion[]> {
    const artisanProfiles = await prisma.artisanProfile.findMany({
        include: {
            products: {
                include: {
                    orderItems: {
                        include: { order: true },
                    },
                },
            },
        },
    });

    const regionMap = new Map<string, { orders: number; revenue: number; crafts: Set<string> }>();

    for (const profile of artisanProfiles) {
        const region = profile.state || profile.location;
        const existing = regionMap.get(region) || { orders: 0, revenue: 0, crafts: new Set<string>() };

        for (const product of profile.products) {
            existing.crafts.add(profile.craftType);
            for (const item of product.orderItems) {
                existing.orders++;
                existing.revenue += item.price * item.quantity;
            }
        }

        regionMap.set(region, existing);
    }

    return Array.from(regionMap.entries()).map(([region, data]) => ({
        region,
        state: region,
        totalOrders: data.orders,
        totalRevenue: data.revenue,
        topCraftTypes: Array.from(data.crafts).slice(0, 5),
        demandLevel: data.orders > 50 ? 'High' as const : data.orders > 20 ? 'Medium' as const : 'Low' as const,
    })).sort((a, b) => b.totalOrders - a.totalOrders);
}

async function queryTrendsFromPrisma(): Promise<SeasonalTrend[]> {
    const orders = await prisma.orderItem.findMany({
        include: {
            order: true,
            product: {
                include: { artisan: true },
            },
        },
        orderBy: { order: { createdAt: 'desc' } },
        take: 200,
    });

    const monthMap = new Map<string, { count: number; totalPrice: number; craftType: string }>();

    for (const item of orders) {
        const month = item.order.createdAt.toISOString().substring(0, 7);
        const key = `${month}-${item.product.artisan.craftType}`;
        const existing = monthMap.get(key) || { count: 0, totalPrice: 0, craftType: item.product.artisan.craftType };

        existing.count++;
        existing.totalPrice += item.price;

        monthMap.set(key, existing);
    }

    return Array.from(monthMap.entries()).map(([key, data]) => ({
        month: key.split('-').slice(0, 2).join('-'),
        craftType: data.craftType,
        orderCount: data.count,
        avgPrice: data.totalPrice / data.count,
        growthPercent: 0,
    }));
}

async function queryPricingFromPrisma(): Promise<PricingBenchmark[]> {
    const products = await prisma.product.findMany({
        include: { artisan: true },
    });

    const craftMap = new Map<string, number[]>();

    for (const product of products) {
        const craftType = product.artisan.craftType;
        const prices = craftMap.get(craftType) || [];
        prices.push(product.price);
        craftMap.set(craftType, prices);
    }

    return Array.from(craftMap.entries()).map(([craftType, prices]) => {
        prices.sort((a, b) => a - b);
        const sum = prices.reduce((a, b) => a + b, 0);
        return {
            craftType,
            avgPrice: sum / prices.length,
            minPrice: prices[0],
            maxPrice: prices[prices.length - 1],
            medianPrice: prices[Math.floor(prices.length / 2)],
            productCount: prices.length,
        };
    }).sort((a, b) => b.productCount - a.productCount);
}
