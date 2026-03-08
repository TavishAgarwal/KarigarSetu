'use client';

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'karigarsetu_recently_viewed';
const MAX_ITEMS = 12;

export interface RecentlyViewedItem {
    productId: string;
    title: string;
    price: number;
    imageUrl: string;
    artisanName: string;
    category: string;
    viewedAt: number;
}

function loadRecentlyViewed(): RecentlyViewedItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function persistRecentlyViewed(items: RecentlyViewedItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Hook to track recently viewed products in localStorage.
 * Stores the last 12 viewed products for display in "Recently Viewed" sections.
 */
export function useRecentlyViewed() {
    const [items, setItems] = useState<RecentlyViewedItem[]>(() => loadRecentlyViewed());

    const addView = useCallback((item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
        setItems((prev) => {
            // Remove if already exists, then add to front
            const filtered = prev.filter((i) => i.productId !== item.productId);
            const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
            persistRecentlyViewed(next);
            return next;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setItems([]);
        persistRecentlyViewed([]);
    }, []);

    return {
        items,
        count: items.length,
        addView,
        clearHistory,
    };
}
