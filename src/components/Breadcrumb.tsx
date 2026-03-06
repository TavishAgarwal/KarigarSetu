'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

/**
 * Accessible breadcrumb navigation with JSON-LD structured data.
 * Helps users understand page hierarchy and improves SEO.
 */
export default function Breadcrumb({ items, className }: BreadcrumbProps) {
    const allItems = [{ label: 'Home', href: '/' }, ...items];

    return (
        <>
            <BreadcrumbJsonLd
                items={allItems.map((item) => ({
                    name: item.label,
                    url: `https://karigarsetu.com${item.href}`,
                }))}
            />
            <nav aria-label="Breadcrumb" className={`flex items-center text-sm ${className || ''}`}>
                <ol className="flex items-center gap-1 flex-wrap">
                    {allItems.map((item, index) => {
                        const isLast = index === allItems.length - 1;

                        return (
                            <li key={item.href} className="flex items-center gap-1">
                                {index > 0 && (
                                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" aria-hidden="true" />
                                )}
                                {isLast ? (
                                    <span className="text-gray-900 font-medium truncate max-w-[200px]" aria-current="page">
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                                    >
                                        {index === 0 && <Home className="h-3.5 w-3.5" aria-hidden="true" />}
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
}
