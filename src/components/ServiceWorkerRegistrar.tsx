'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for offline support.
 * Must be rendered as a client component inside the root layout.
 */
export default function ServiceWorkerRegistrar() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('[SW] Service Worker registered:', registration.scope);
                })
                .catch((error) => {
                    console.warn('[SW] Service Worker registration failed:', error);
                });
        }
    }, []);

    return null;
}
