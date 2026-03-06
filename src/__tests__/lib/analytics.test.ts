import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Need to mock NODE_ENV before importing the module
vi.stubEnv('NODE_ENV', 'development');

// Now import analytics (it reads NODE_ENV at call time)
const { trackEvent, trackProductView, trackAddToCart, trackWishlistToggle, trackShare, trackSearch, trackReviewSubmit, trackPageView, trackOrderComplete, trackAIUsage } = await import('@/lib/analytics');

describe('Analytics', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('trackEvent', () => {
        it('logs event in development', () => {
            trackEvent({ category: 'Test', action: 'click', label: 'button' });
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[Analytics]'),
                expect.any(String),
                expect.anything(),
                expect.anything(),
            );
        });

        it('includes category and action in log', () => {
            trackEvent({ category: 'Product', action: 'view' });
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Product/view'),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });

        it('handles events with metadata', () => {
            trackEvent({
                category: 'Cart',
                action: 'add',
                label: 'Test Product',
                value: 999,
                metadata: { productId: 'abc123' },
            });
            expect(consoleSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('helper functions', () => {
        it('trackProductView sends correct event', () => {
            trackProductView('prod-1', 'Blue Vase', 'Pottery');
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Product/view'),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });

        it('trackAddToCart sends correct event with price', () => {
            trackAddToCart('prod-1', 'Blue Vase', 1500);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Cart/add'),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });

        it('trackWishlistToggle sends add/remove', () => {
            trackWishlistToggle('prod-1', true);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Wishlist/add'),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );

            consoleSpy.mockClear();
            trackWishlistToggle('prod-2', false);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Wishlist/remove'),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });

        it('trackShare sends native or clipboard method', () => {
            trackShare('prod-1', 'native');
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Social/share'),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });

        it('trackSearch sends query and result count', () => {
            trackSearch('pottery vase', 12);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Search/query'),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });

        it('trackReviewSubmit sends product and rating', () => {
            trackReviewSubmit('prod-1', 5);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Review/submit'),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });

        it('trackPageView sends page path', () => {
            trackPageView('/product/123');
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Navigation/pageview'),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });

        it('trackOrderComplete sends order details', () => {
            trackOrderComplete('order-1', 5000, 3);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Order/complete'),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });

        it('trackAIUsage sends feature name', () => {
            trackAIUsage('craft_story');
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('AI/craft_story'),
                expect.anything(),
                expect.anything(),
                expect.anything(),
            );
        });
    });
});
