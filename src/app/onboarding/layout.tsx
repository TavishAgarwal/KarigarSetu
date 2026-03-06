import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Artisan Onboarding — Join KarigarSetu',
    description: 'Register as an artisan on KarigarSetu. AI-assisted profile setup, craft skill documentation, and instant marketplace access for traditional Indian craftspeople.',
    openGraph: {
        title: 'Become a KarigarSetu Artisan',
        description: 'AI-powered onboarding for Indian artisans — set up your craft profile and start selling in minutes.',
    },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
