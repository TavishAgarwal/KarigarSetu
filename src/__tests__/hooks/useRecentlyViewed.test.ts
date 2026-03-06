import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useRecentlyViewed', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('starts with empty items', () => {
        const { result } = renderHook(() => useRecentlyViewed());
        expect(result.current.items).toEqual([]);
    });

    it('adds a viewed product', () => {
        const { result } = renderHook(() => useRecentlyViewed());

        act(() => {
            result.current.addView({
                productId: 'p1',
                title: 'Blue Vase',
                price: 1500,
                imageUrl: '/img/vase.png',
                artisanName: 'Priya',
                category: 'Pottery',
            });
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].productId).toBe('p1');
        expect(result.current.items[0].title).toBe('Blue Vase');
    });

    it('does not duplicate products — moves to front instead', () => {
        const { result } = renderHook(() => useRecentlyViewed());

        act(() => {
            result.current.addView({
                productId: 'p1',
                title: 'Vase',
                price: 1500,
                imageUrl: '/img/vase.png',
                artisanName: 'Priya',
                category: 'Pottery',
            });
        });

        act(() => {
            result.current.addView({
                productId: 'p2',
                title: 'Lamp',
                price: 800,
                imageUrl: '/img/lamp.png',
                artisanName: 'Mohan',
                category: 'Metal',
            });
        });

        act(() => {
            result.current.addView({
                productId: 'p1',
                title: 'Vase',
                price: 1500,
                imageUrl: '/img/vase.png',
                artisanName: 'Priya',
                category: 'Pottery',
            });
        });

        expect(result.current.items).toHaveLength(2);
        expect(result.current.items[0].productId).toBe('p1'); // moved to front
        expect(result.current.items[1].productId).toBe('p2');
    });

    it('limits to max 12 items', () => {
        const { result } = renderHook(() => useRecentlyViewed());

        for (let i = 0; i < 15; i++) {
            act(() => {
                result.current.addView({
                    productId: `p${i}`,
                    title: `Product ${i}`,
                    price: 1000 + i,
                    imageUrl: `/img/p${i}.png`,
                    artisanName: 'Artisan',
                    category: 'Category',
                });
            });
        }

        expect(result.current.items.length).toBeLessThanOrEqual(12);
    });

    it('clears history', () => {
        const { result } = renderHook(() => useRecentlyViewed());

        act(() => {
            result.current.addView({
                productId: 'p1',
                title: 'Vase',
                price: 1500,
                imageUrl: '/img/vase.png',
                artisanName: 'Priya',
                category: 'Pottery',
            });
        });

        expect(result.current.items).toHaveLength(1);

        act(() => {
            result.current.clearHistory();
        });

        expect(result.current.items).toEqual([]);
    });

    it('persists to localStorage', () => {
        const { result } = renderHook(() => useRecentlyViewed());

        act(() => {
            result.current.addView({
                productId: 'p1',
                title: 'Vase',
                price: 1500,
                imageUrl: '/img/vase.png',
                artisanName: 'Priya',
                category: 'Pottery',
            });
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'karigarsetu_recently_viewed',
            expect.any(String),
        );
    });
});
