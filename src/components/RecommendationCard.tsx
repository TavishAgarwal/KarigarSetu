'use client';

import Image from 'next/image';
import Link from 'next/link';

interface RecommendationCardProps {
    productId: string;
    title: string;
    price: number;
    imageUrl: string;
    artisanName: string;
    craftType: string;
}

export default function RecommendationCard({
    productId,
    title,
    price,
    imageUrl,
    artisanName,
    craftType,
}: RecommendationCardProps) {
    return (
        <Link
            href={`/product/${productId}`}
            className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300"
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-3 left-3">
                    <span className="text-xs font-bold bg-white/90 backdrop-blur-sm text-orange-600 px-2.5 py-1 rounded-full shadow-sm">
                        {craftType}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">by {artisanName}</p>
                <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-orange-600">
                        ₹{price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-medium text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full group-hover:bg-orange-500 group-hover:text-white transition-all">
                        View →
                    </span>
                </div>
            </div>
        </Link>
    );
}
