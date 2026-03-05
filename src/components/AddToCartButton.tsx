'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, Check } from 'lucide-react';

interface AddToCartButtonProps {
    productId: string;
    title: string;
    price: number;
    imageUrl: string;
    artisanName: string;
}

export default function AddToCartButton({ productId, title, price, imageUrl, artisanName }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleClick = () => {
        addToCart({ productId, title, price, imageUrl, artisanName });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button
            onClick={handleClick}
            className={`flex-1 py-4 font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl flex items-center justify-center gap-2 ${added
                    ? 'bg-green-500 text-white shadow-green-200'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
                }`}
        >
            {added ? (
                <>
                    <Check className="h-5 w-5" />
                    Added to Cart
                </>
            ) : (
                <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                </>
            )}
        </button>
    );
}
