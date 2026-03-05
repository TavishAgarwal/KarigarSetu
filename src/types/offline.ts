/** Sync status for offline listings */
export type SyncStatus = 'pending' | 'syncing' | 'failed';

/** An offline-stored listing waiting to be synced */
export interface OfflineListing {
    /** Unique identifier (UUID) */
    id: string;
    /** Raw image file stored as Blob */
    imageBlob: Blob;
    /** Original filename of the image */
    imageFileName: string;
    /** Voice transcript or text description (may be empty if audio is stored) */
    transcript: string;
    /** Raw audio recording stored as Blob (for deferred transcription) */
    audioBlob?: Blob;
    /** Language code for speech recognition (e.g. 'hi-IN') */
    audioLanguage?: string;
    /** Artisan user ID */
    artisanId: string;
    /** Unix timestamp when saved offline */
    timestamp: number;
    /** Current sync status */
    syncStatus: SyncStatus;
    /** Number of sync retry attempts */
    retryCount: number;
    /** Last error message if sync failed */
    lastError?: string;
}

/** Summary of the offline queue state */
export interface OfflineQueueSummary {
    pending: number;
    syncing: number;
    failed: number;
    total: number;
}
