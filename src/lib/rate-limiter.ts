import { NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per IP address within a sliding time window.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });
 *
 *   export async function POST(req) {
 *       const limited = limiter.check(req);
 *       if (limited) return limited;
 *       // ... handle request
 *   }
 */

interface RateLimiterConfig {
    /** Time window in milliseconds */
    windowMs: number;
    /** Maximum requests allowed per window per IP */
    maxRequests: number;
}

interface RequestRecord {
    count: number;
    resetTime: number;
}

export function createRateLimiter(config: RateLimiterConfig) {
    const store = new Map<string, RequestRecord>();

    // Periodically clean up expired entries to prevent memory leaks
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of store) {
            if (now > record.resetTime) {
                store.delete(key);
            }
        }
    }, config.windowMs * 2);

    return {
        /**
         * Check if the request should be rate-limited.
         * @returns NextResponse with 429 if rate-limited, or null if allowed.
         */
        check(req: Request): NextResponse | null {
            const ip =
                (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
                req.headers.get('x-real-ip') ||
                'unknown';

            const now = Date.now();
            const record = store.get(ip);

            if (!record || now > record.resetTime) {
                // New window
                store.set(ip, { count: 1, resetTime: now + config.windowMs });
                return null;
            }

            record.count++;

            if (record.count > config.maxRequests) {
                const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
                return NextResponse.json(
                    { error: 'Too many requests. Please try again later.' },
                    {
                        status: 429,
                        headers: {
                            'Retry-After': String(retryAfterSeconds),
                            'X-RateLimit-Limit': String(config.maxRequests),
                            'X-RateLimit-Remaining': '0',
                            'X-RateLimit-Reset': String(record.resetTime),
                        },
                    }
                );
            }

            return null;
        },
    };
}

// ─── Pre-configured limiters ─────────────────────────────────────────────────

/** Auth routes: 10 requests per minute per IP */
export const authLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 10,
});

/** AI routes: 20 requests per minute per IP */
export const aiLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 20,
});

/** General API routes: 60 requests per minute per IP */
export const generalLimiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 60,
});
