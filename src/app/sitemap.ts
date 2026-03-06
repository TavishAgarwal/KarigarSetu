import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://karigarsetu.com';

    return [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/marketplace`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/impact`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/heritage`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/ai-shopper`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ];
}
