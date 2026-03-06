'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { trackProductView } from '@/lib/analytics';

interface ProductViewTrackerProps {
    product: {
        id: string;
        title: string;
        price: number;
        imageUrl: string;
        category: string;
        artisanName: string;
    };
}

/**
 * Client component that tracks product views in localStorage.
 * Renders nothing — pure side-effect component.
 */
export default function ProductViewTracker({ product }: ProductViewTrackerProps) {
    const { addView } = useRecentlyViewed();

    useEffect(() => {
        addView({
            productId: product.id,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category,
            artisanName: product.artisanName,
        });
        trackProductView(product.id, product.title, product.category);
        // Only track once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.id]);

    return null;
}
