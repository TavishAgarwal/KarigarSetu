'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentlyViewedProps {
    /** Product ID to exclude (e.g. current product page) */
    excludeId?: string;
    /** Maximum items to show */
    maxItems?: number;
}

export default function RecentlyViewed({ excludeId, maxItems = 6 }: RecentlyViewedProps) {
    const { items, clearHistory } = useRecentlyViewed();

    const filtered = items
        .filter((item) => item.productId !== excludeId)
        .slice(0, maxItems);

    if (filtered.length === 0) return null;

    return (
        <section aria-label="Recently viewed products" className="mt-16">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filtered.map((item) => (
                    <Link
                        key={item.productId}
                        href={`/product/${item.productId}`}
                        className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all"
                    >
                        <div className="relative aspect-square">
                            <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                            />
                        </div>
                        <div className="p-3">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-orange-600">
                                {item.title}
                            </h3>
                            <p className="text-sm font-bold text-orange-600 mt-1">
                                ₹{item.price.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
