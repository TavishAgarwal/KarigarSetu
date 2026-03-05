'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart-context';

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    artisanName: string;
    location: string;
    category?: string;
}

export default function ProductCard({
    id,
    title,
    price,
    imageUrl,
    artisanName,
    location,
    category,
}: ProductCardProps) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ productId: id, title, price, imageUrl, artisanName });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <button className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm group/heart">
                    <Heart className="h-4 w-4 text-gray-500 group-hover/heart:text-white" />
                </button>
                {category && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                        {category}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {title}
                    </h3>
                    <span className="text-orange-600 font-bold whitespace-nowrap">
                        ₹{price.toLocaleString('en-IN')}
                    </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{artisanName}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{location}</span>
                </div>

                <div className="flex items-center justify-between">
                    <Link
                        href={`/product/${id}`}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        Read the Story →
                    </Link>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddToCart}
                        className={`rounded-lg text-xs transition-all ${added
                                ? 'border-green-500 text-green-600 bg-green-50'
                                : 'border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white'
                            }`}
                    >
                        {added ? (
                            <>
                                <Check className="h-3 w-3 mr-1" />
                                Added
                            </>
                        ) : (
                            'Add to Cart'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
