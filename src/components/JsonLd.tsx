/**
 * JSON-LD Structured Data components for SEO.
 * Adds schema.org markup to help search engines understand page content.
 */

interface ProductJsonLdProps {
    name: string;
    description: string;
    image: string;
    price: number;
    currency?: string;
    artisanName: string;
    category: string;
    availability?: 'InStock' | 'OutOfStock';
    url?: string;
}

export function ProductJsonLd({
    name,
    description,
    image,
    price,
    currency = 'INR',
    artisanName,
    category,
    availability = 'InStock',
    url,
}: ProductJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image,
        category,
        brand: {
            '@type': 'Brand',
            name: 'KarigarSetu',
        },
        manufacturer: {
            '@type': 'Person',
            name: artisanName,
        },
        offers: {
            '@type': 'Offer',
            price: price.toFixed(2),
            priceCurrency: currency,
            availability: `https://schema.org/${availability}`,
            seller: {
                '@type': 'Organization',
                name: 'KarigarSetu',
            },
        },
        ...(url && { url }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

interface OrganizationJsonLdProps {
    url?: string;
}

export function OrganizationJsonLd({ url = 'https://karigarsetu.com' }: OrganizationJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'KarigarSetu',
        description: 'AI-Powered Marketplace for Indian Artisans — connecting traditional craftsmanship with the global digital market.',
        url,
        logo: `${url}/favicon.ico`,
        sameAs: [],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi'],
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

interface BreadcrumbJsonLdProps {
    items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
