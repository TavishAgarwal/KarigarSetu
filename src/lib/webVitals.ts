/**
 * Web Vitals reporting utility.
 * Captures Core Web Vitals (LCP, FID, CLS) and reports them for monitoring.
 *
 * In production, this could be connected to Google Analytics, BigQuery, or
 * any web vitals monitoring service.
 */

interface WebVitalsMetric {
    id: string;
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    navigationType: string;
}

/**
 * Report Web Vitals to console (development) or analytics service (production).
 */
export function reportWebVitals(metric: WebVitalsMetric) {
    if (process.env.NODE_ENV === 'development') {
        const color = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴';
        console.log(`${color} ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
    }

    // In production, send to analytics endpoint
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        const body = JSON.stringify({
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            id: metric.id,
            page: window.location.pathname,
            timestamp: Date.now(),
        });

        // Use sendBeacon for reliability during page unload
        if (navigator.sendBeacon) {
            navigator.sendBeacon(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, body);
        } else {
            fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
                body,
                method: 'POST',
                keepalive: true,
                headers: { 'Content-Type': 'application/json' },
            }).catch(() => { /* Swallow analytics errors */ });
        }
    }
}
