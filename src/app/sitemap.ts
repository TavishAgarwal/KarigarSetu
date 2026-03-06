import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://karigarsetu.com';

    // Fetch all published products for dynamic product URLs
    let productEntries: MetadataRoute.Sitemap = [];
    try {
        const products = await prisma.product.findMany({
            select: { id: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });

        productEntries = products.map((product: { id: string; createdAt: Date }) => ({
            url: `${baseUrl}/product/${product.id}`,
            lastModified: product.createdAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch {
        // If DB is unavailable, still return static routes
        console.error('Sitemap: Could not fetch products');
    }

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/marketplace`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/impact`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/heritage`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/ai-shopper`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ];

    return [...staticRoutes, ...productEntries];
}
