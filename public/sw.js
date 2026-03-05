// KarigarSetu Service Worker
// Provides offline caching for static assets and dashboard pages

const CACHE_NAME = 'karigarsetu-offline-v1';

// Static assets to cache on install
const PRECACHE_URLS = [
    '/',
    '/dashboard',
    '/dashboard/ai-generator',
    '/dashboard/products',
];

// Install event: pre-cache essential pages
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS).catch((err) => {
                console.warn('[SW] Pre-cache failed for some URLs:', err);
            });
        })
    );
    // Activate immediately
    self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    // Start controlling all pages immediately
    self.clients.claim();
});

// Fetch event: network-first for API, cache-first for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip Next.js internal requests and API calls (network-only)
    if (
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/_next/data/') ||
        url.pathname.includes('__next')
    ) {
        return;
    }

    // For static assets: cache-first strategy
    if (
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.ico') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.webp') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.woff')
    ) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                return fetch(request).then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }

    // For page navigations: network-first with cache fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) return cachedResponse;
                        // Fallback to cached dashboard
                        return caches.match('/dashboard');
                    });
                })
        );
        return;
    }
});
