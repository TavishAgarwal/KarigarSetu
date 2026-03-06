import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Marketplace — Handcrafted Treasures from Indian Artisans | KarigarSetu',
    description: 'Browse authentic handcrafted products from skilled Indian artisans. Filter by craft type, region, and price. AI-verified authenticity, fair prices, direct commerce.',
    openGraph: {
        title: 'Marketplace — Handcrafted Treasures | KarigarSetu',
        description: 'Discover pottery, textiles, jewelry, woodwork, and more from artisans across India.',
    },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
    return children;
}
