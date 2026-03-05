import type { OfflineListing, SyncStatus, OfflineQueueSummary } from '@/types/offline';

const DB_NAME = 'KarigarSetuOffline';
const DB_VERSION = 1;
const STORE_NAME = 'offlineListings';

/**
 * Open (or create) the IndexedDB database.
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('syncStatus', 'syncStatus', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Generate a unique ID for offline listings.
 */
function generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Save a listing to the offline queue in IndexedDB.
 */
export async function saveOfflineListing(data: {
    imageBlob: Blob;
    imageFileName: string;
    transcript: string;
    artisanId: string;
    audioBlob?: Blob;
    audioLanguage?: string;
}): Promise<OfflineListing> {
    const db = await openDB();
    const listing: OfflineListing = {
        id: generateId(),
        imageBlob: data.imageBlob,
        imageFileName: data.imageFileName,
        transcript: data.transcript,
        audioBlob: data.audioBlob,
        audioLanguage: data.audioLanguage,
        artisanId: data.artisanId,
        timestamp: Date.now(),
        syncStatus: 'pending',
        retryCount: 0,
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(listing);

        request.onsuccess = () => resolve(listing);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
    });
}

/**
 * Get all listings that need to be synced (pending or failed with retries left).
 */
export async function getPendingListings(): Promise<OfflineListing[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const all = request.result as OfflineListing[];
            const pending = all.filter(
                (item) => item.syncStatus === 'pending' || item.syncStatus === 'failed'
            );
            // Sort oldest first
            pending.sort((a, b) => a.timestamp - b.timestamp);
            resolve(pending);
        };
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
    });
}

/**
 * Get all listings in the queue regardless of status.
 */
export async function getAllListings(): Promise<OfflineListing[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const all = request.result as OfflineListing[];
            all.sort((a, b) => b.timestamp - a.timestamp);
            resolve(all);
        };
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
    });
}

/**
 * Update the sync status of a listing.
 */
export async function updateListingStatus(
    id: string,
    syncStatus: SyncStatus,
    lastError?: string
): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const listing = getRequest.result as OfflineListing | undefined;
            if (!listing) {
                reject(new Error(`Listing ${id} not found`));
                return;
            }

            listing.syncStatus = syncStatus;
            if (lastError !== undefined) {
                listing.lastError = lastError;
            }
            if (syncStatus === 'failed') {
                listing.retryCount += 1;
            }

            const putRequest = store.put(listing);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
        tx.oncomplete = () => db.close();
    });
}

/**
 * Remove a listing from the queue after successful sync.
 */
export async function removeListingFromQueue(id: string): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
    });
}

/**
 * Get a summary of the offline queue counts.
 */
export async function getQueueSummary(): Promise<OfflineQueueSummary> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const all = request.result as OfflineListing[];
            const summary: OfflineQueueSummary = {
                pending: all.filter((i) => i.syncStatus === 'pending').length,
                syncing: all.filter((i) => i.syncStatus === 'syncing').length,
                failed: all.filter((i) => i.syncStatus === 'failed').length,
                total: all.length,
            };
            resolve(summary);
        };
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
    });
}
