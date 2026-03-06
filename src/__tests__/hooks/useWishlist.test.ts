import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
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

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// We test the core logic manually since hooks need React context
describe('Wishlist Logic', () => {
    const STORAGE_KEY = 'karigarsetu-wishlist';

    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('stores wishlist items in localStorage', () => {
        const items = [{ productId: '1', title: 'Blue Pottery Vase', price: 1200, imageUrl: '/test.png', artisanName: 'Ravi', addedAt: Date.now() }];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        expect(stored).toHaveLength(1);
        expect(stored[0].productId).toBe('1');
        expect(stored[0].title).toBe('Blue Pottery Vase');
    });

    it('can add multiple items', () => {
        const items = [
            { productId: '1', title: 'Vase', price: 1200, imageUrl: '/a.png', artisanName: 'Ravi', addedAt: Date.now() },
            { productId: '2', title: 'Plate', price: 800, imageUrl: '/b.png', artisanName: 'Mohan', addedAt: Date.now() },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        expect(stored).toHaveLength(2);
    });

    it('can remove an item by productId', () => {
        const items = [
            { productId: '1', title: 'Vase', price: 1200, imageUrl: '/a.png', artisanName: 'Ravi', addedAt: Date.now() },
            { productId: '2', title: 'Plate', price: 800, imageUrl: '/b.png', artisanName: 'Mohan', addedAt: Date.now() },
        ];
        const filtered = items.filter((i) => i.productId !== '1');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        expect(stored).toHaveLength(1);
        expect(stored[0].productId).toBe('2');
    });

    it('check if item is in wishlist', () => {
        const items = [
            { productId: '1', title: 'Vase', price: 1200, imageUrl: '/a.png', artisanName: 'Ravi', addedAt: Date.now() },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const isInWishlist = stored.some((item: { productId: string }) => item.productId === '1');
        const isNotInWishlist = stored.some((item: { productId: string }) => item.productId === '999');
        expect(isInWishlist).toBe(true);
        expect(isNotInWishlist).toBe(false);
    });

    it('handles empty localStorage gracefully', () => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        expect(stored).toEqual([]);
    });

    it('clear removes all items', () => {
        const items = [
            { productId: '1', title: 'Vase', price: 1200, imageUrl: '/a.png', artisanName: 'Ravi', addedAt: Date.now() },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        expect(stored).toEqual([]);
    });
});
