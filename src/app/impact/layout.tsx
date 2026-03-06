import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Impact — Empowering Indian Artisans | KarigarSetu',
    description: 'See the real impact of every purchase — labor hours supported, families empowered, and centuries-old craft traditions preserved across India.',
    openGraph: {
        title: 'Our Impact — Empowering Indian Artisans | KarigarSetu',
        description: 'Every purchase supports artisan families and preserves India\'s craft heritage.',
    },
};

export default function ImpactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
