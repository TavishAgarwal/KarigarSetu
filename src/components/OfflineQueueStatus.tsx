'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cloud, CloudOff, Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getQueueSummary } from '@/lib/offlineQueue';
import { syncPendingListings, isSyncInProgress } from '@/lib/offlineSync';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useAuth } from '@/lib/auth-context';
import type { OfflineQueueSummary } from '@/types/offline';

export default function OfflineQueueStatus() {
    const { token } = useAuth();
    const { isOnline } = useNetworkStatus();
    const [summary, setSummary] = useState<OfflineQueueSummary | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [lastSyncResult, setLastSyncResult] = useState<number | null>(null);

    const refreshSummary = useCallback(async () => {
        try {
            const s = await getQueueSummary();
            setSummary(s);
        } catch {
            // IndexedDB may not be available during SSR
        }
    }, []);

    // Poll the queue summary periodically
    useEffect(() => {
        refreshSummary();
        const interval = setInterval(refreshSummary, 5000);
        return () => clearInterval(interval);
    }, [refreshSummary]);

    // Auto-sync when coming back online
    useEffect(() => {
        if (isOnline && summary && summary.pending + summary.failed > 0 && token && !isSyncInProgress()) {
            handleSync();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline]);

    const handleSync = async () => {
        if (!token || syncing) return;
        setSyncing(true);
        setLastSyncResult(null);
        try {
            const count = await syncPendingListings(token);
            setLastSyncResult(count);
            await refreshSummary();
        } catch (error) {
            console.error('Manual sync failed:', error);
        } finally {
            setSyncing(false);
        }
    };

    // Don't render if no offline items
    if (!summary || summary.total === 0) return null;

    const pendingCount = summary.pending + summary.failed;

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {isOnline ? (
                        <Cloud className="h-5 w-5 text-green-500" />
                    ) : (
                        <CloudOff className="h-5 w-5 text-orange-500" />
                    )}
                    <h3 className="font-bold text-gray-900 text-sm">Offline Drafts</h3>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                    {isOnline ? 'Online' : 'Offline'}
                </span>
            </div>

            {/* Queue Stats */}
            <div className="space-y-2 mb-4">
                {summary.pending > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-400" />
                            Waiting to sync
                        </span>
                        <span className="font-semibold text-gray-900">{summary.pending}</span>
                    </div>
                )}
                {summary.syncing > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                            Syncing
                        </span>
                        <span className="font-semibold text-blue-600">{summary.syncing}</span>
                    </div>
                )}
                {summary.failed > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            Failed
                        </span>
                        <span className="font-semibold text-red-600">{summary.failed}</span>
                    </div>
                )}
            </div>

            {/* Summary message */}
            {pendingCount > 0 && (
                <p className="text-xs text-gray-500 mb-3">
                    {pendingCount} listing{pendingCount > 1 ? 's' : ''} waiting to sync.
                    {!isOnline && ' Will auto-sync when internet returns.'}
                </p>
            )}

            {/* Last sync result */}
            {lastSyncResult !== null && lastSyncResult > 0 && (
                <div className="flex items-center gap-2 text-xs text-green-600 mb-3">
                    <CheckCircle2 className="h-3 w-3" />
                    Successfully synced {lastSyncResult} listing{lastSyncResult > 1 ? 's' : ''}
                </div>
            )}

            {/* Sync button */}
            {isOnline && pendingCount > 0 && (
                <Button
                    onClick={handleSync}
                    disabled={syncing}
                    className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2 text-sm"
                    size="sm"
                >
                    {syncing ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Syncing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-3 w-3" />
                            Sync Now
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
