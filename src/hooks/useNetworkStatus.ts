'use client';

import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
    isOnline: boolean;
}

/**
 * React hook that tracks the browser's online/offline status.
 * Returns `{ isOnline: true }` by default for SSR safety.
 */
export function useNetworkStatus(): NetworkStatus {
    const [isOnline, setIsOnline] = useState(true);

    const handleOnline = useCallback(() => setIsOnline(true), []);
    const handleOffline = useCallback(() => setIsOnline(false), []);

    useEffect(() => {
        // Set initial value from browser
        setIsOnline(navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return { isOnline };
}
