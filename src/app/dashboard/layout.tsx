import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Artisan Dashboard — Manage Your Craft Business | KarigarSetu',
    description: 'Track orders, manage inventory, view AI-powered insights, and grow your artisan business with real-time analytics.',
    openGraph: {
        title: 'Artisan Dashboard | KarigarSetu',
        description: 'AI-powered business management tools for Indian artisans.',
    },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
