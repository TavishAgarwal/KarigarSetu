'use client';

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'karigarsetu_wishlist';

export interface WishlistItem {
    productId: string;
    title: string;
    price: number;
    imageUrl: string;
    artisanName: string;
    addedAt: number;
}

function loadWishlist(): WishlistItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function persistWishlist(items: WishlistItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Hook to manage a localStorage-backed wishlist.
 * Works without authentication — persists across sessions.
 */
export function useWishlist() {
    const [items, setItems] = useState<WishlistItem[]>(() => loadWishlist());

    const addToWishlist = useCallback((item: Omit<WishlistItem, 'addedAt'>) => {
        setItems((prev) => {
            // Don't add duplicates
            if (prev.some((i) => i.productId === item.productId)) return prev;
            const next = [...prev, { ...item, addedAt: Date.now() }];
            persistWishlist(next);
            return next;
        });
    }, []);

    const removeFromWishlist = useCallback((productId: string) => {
        setItems((prev) => {
            const next = prev.filter((i) => i.productId !== productId);
            persistWishlist(next);
            return next;
        });
    }, []);

    const toggleWishlist = useCallback((item: Omit<WishlistItem, 'addedAt'>) => {
        setItems((prev) => {
            const exists = prev.some((i) => i.productId === item.productId);
            const next = exists
                ? prev.filter((i) => i.productId !== item.productId)
                : [...prev, { ...item, addedAt: Date.now() }];
            persistWishlist(next);
            return next;
        });
    }, []);

    const isInWishlist = useCallback((productId: string) => {
        return items.some((i) => i.productId === productId);
    }, [items]);

    const clearWishlist = useCallback(() => {
        setItems([]);
        persistWishlist([]);
    }, []);

    return {
        items,
        count: items.length,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
    };
}
