'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { trackWishlistToggle } from '@/lib/analytics';

interface WishlistButtonProps {
    productId: string;
    title: string;
    price: number;
    imageUrl: string;
    artisanName: string;
    /** Render as a small icon button (for cards) vs full button */
    variant?: 'icon' | 'button';
    className?: string;
}

export default function WishlistButton({
    productId,
    title,
    price,
    imageUrl,
    artisanName,
    variant = 'icon',
    className,
}: WishlistButtonProps) {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const wishlisted = isInWishlist(productId);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist({ productId, title, price, imageUrl, artisanName });
        trackWishlistToggle(productId, !wishlisted);
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleToggle}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-sm ${wishlisted
                    ? 'bg-red-50 text-red-500'
                    : 'hover:bg-orange-500 hover:text-white text-gray-500'
                    } ${className || ''}`}
            >
                <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`px-6 py-4 border-2 font-semibold rounded-xl transition-all ${wishlisted
                ? 'border-red-300 bg-red-50 text-red-600'
                : 'border-gray-200 hover:border-orange-300 text-gray-700'
                } ${className || ''}`}
        >
            <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
    );
}
