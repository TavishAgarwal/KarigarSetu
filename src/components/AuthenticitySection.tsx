'use client';

import AuthenticityBadge, { AuthenticityData } from '@/components/AuthenticityBadge';
import { useAuth } from '@/lib/auth-context';

interface AuthenticitySectionProps {
    productId: string;
    imageUrl: string;
    craftType: string;
    initialData: AuthenticityData | null;
}

export default function AuthenticitySection({ productId, imageUrl, craftType, initialData }: AuthenticitySectionProps) {
    const { token } = useAuth();

    return (
        <AuthenticityBadge
            data={initialData}
            productId={productId}
            imageUrl={imageUrl}
            craftType={craftType}
            token={token || undefined}
        />
    );
}
