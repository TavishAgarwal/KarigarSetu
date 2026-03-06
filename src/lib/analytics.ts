'use client';

/**
 * Lightweight analytics event tracker.
 * Sends events to console in development and to an analytics endpoint in production.
 *
 * Events follow a category → action → label → value pattern (like GA).
 */

interface AnalyticsEvent {
    category: string;
    action: string;
    label?: string;
    value?: number;
    metadata?: Record<string, string | number | boolean>;
}

/**
 * Track an analytics event.
 * In production, sends to NEXT_PUBLIC_ANALYTICS_ENDPOINT if configured.
 * In development, logs to console.
 */
export function trackEvent(event: AnalyticsEvent) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`📊 [Analytics] ${event.category}/${event.action}`, event.label || '', event.value ?? '', event.metadata || '');
    }

    // In production, post to analytics endpoint
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
        if (!endpoint) return;

        const payload = {
            ...event,
            timestamp: Date.now(),
            page: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
        };

        // Use sendBeacon for reliability (works during page unload)
        if (navigator.sendBeacon) {
            navigator.sendBeacon(endpoint, JSON.stringify(payload));
        } else {
            fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload),
                keepalive: true,
                headers: { 'Content-Type': 'application/json' },
            }).catch(() => { /* swallow analytics errors */ });
        }
    }
}

// ─── Pre-built Event Helpers ─────────────────────────────────────────────────

/** Track a product view */
export function trackProductView(productId: string, title: string, category: string) {
    trackEvent({ category: 'Product', action: 'view', label: title, metadata: { productId, category } });
}

/** Track add-to-cart */
export function trackAddToCart(productId: string, title: string, price: number) {
    trackEvent({ category: 'Cart', action: 'add', label: title, value: price, metadata: { productId } });
}

/** Track wishlist toggle */
export function trackWishlistToggle(productId: string, added: boolean) {
    trackEvent({ category: 'Wishlist', action: added ? 'add' : 'remove', metadata: { productId } });
}

/** Track share action */
export function trackShare(productId: string, method: 'native' | 'clipboard') {
    trackEvent({ category: 'Social', action: 'share', label: method, metadata: { productId } });
}

/** Track search query */
export function trackSearch(query: string, resultCount: number) {
    trackEvent({ category: 'Search', action: 'query', label: query, value: resultCount });
}

/** Track AI feature usage */
export function trackAIUsage(feature: string, craftType?: string) {
    trackEvent({ category: 'AI', action: feature, label: craftType });
}

/** Track review submission */
export function trackReviewSubmit(productId: string, rating: number) {
    trackEvent({ category: 'Review', action: 'submit', value: rating, metadata: { productId } });
}

/** Track page view */
export function trackPageView(pageName: string) {
    trackEvent({ category: 'Navigation', action: 'pageview', label: pageName });
}

/** Track order completion */
export function trackOrderComplete(orderId: string, totalAmount: number, itemCount: number) {
    trackEvent({ category: 'Order', action: 'complete', value: totalAmount, metadata: { orderId, itemCount } });
}
