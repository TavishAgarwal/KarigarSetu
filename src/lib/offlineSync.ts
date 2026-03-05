import {
    getPendingListings,
    updateListingStatus,
    removeListingFromQueue,
} from '@/lib/offlineQueue';
import type { OfflineListing } from '@/types/offline';

const MAX_RETRIES = 3;

/** Flag to prevent concurrent sync runs */
let isSyncing = false;

/**
 * Sync all pending offline listings to the server.
 * Processes items sequentially to avoid overwhelming the server.
 *
 * @param token - JWT auth token for API calls
 * @returns Number of successfully synced items
 */
export async function syncPendingListings(token: string): Promise<number> {
    if (isSyncing) {
        console.log('[OfflineSync] Sync already in progress, skipping');
        return 0;
    }

    if (!token) {
        console.warn('[OfflineSync] No auth token provided, skipping sync');
        return 0;
    }

    isSyncing = true;
    let synced = 0;

    try {
        const pendingItems = await getPendingListings();

        if (pendingItems.length === 0) {
            console.log('[OfflineSync] No pending items to sync');
            return 0;
        }

        console.log(`[OfflineSync] Starting sync of ${pendingItems.length} items`);

        for (const item of pendingItems) {
            // Skip items that have exceeded max retries
            if (item.retryCount >= MAX_RETRIES) {
                console.warn(`[OfflineSync] Skipping item ${item.id} — exceeded max retries`);
                continue;
            }

            try {
                await syncSingleListing(item, token);
                synced++;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
                console.error(`[OfflineSync] Failed to sync item ${item.id}:`, errorMessage);
                await updateListingStatus(item.id, 'failed', errorMessage);
            }
        }

        console.log(`[OfflineSync] Sync complete: ${synced}/${pendingItems.length} items synced`);
    } catch (error) {
        console.error('[OfflineSync] Sync process failed:', error);
    } finally {
        isSyncing = false;
    }

    return synced;
}

/**
 * Sync a single offline listing to the server.
 */
async function syncSingleListing(item: OfflineListing, token: string): Promise<void> {
    // Step 1: Mark as syncing
    await updateListingStatus(item.id, 'syncing');

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const jsonHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };

    // Step 2: If we have stored audio, transcribe it now (we're online)
    let transcript = item.transcript;
    if (item.audioBlob && item.audioBlob.size > 0 && !transcript) {
        console.log(`[OfflineSync] Transcribing audio for item ${item.id}...`);
        transcript = await transcribeAudio(item.audioBlob, item.audioLanguage || 'hi-IN');
        console.log(`[OfflineSync] Transcription result: "${transcript}"`);
    }

    // Step 3: Upload image to server
    const imageUrl = await uploadImage(item, headers);

    // Step 4: Generate AI listing
    const listing = await generateListing(imageUrl, transcript, jsonHeaders);

    // Step 5: Create product in database
    await createProduct(listing, imageUrl, jsonHeaders);

    // Step 6: Remove from offline queue
    await removeListingFromQueue(item.id);

    console.log(`[OfflineSync] Successfully synced item ${item.id}`);
}

/**
 * Transcribe an audio blob using the Web Speech API.
 * Plays the audio through a hidden audio element and feeds it to SpeechRecognition.
 * Falls back to empty string if transcription fails.
 */
async function transcribeAudio(audioBlob: Blob, language: string): Promise<string> {
    return new Promise((resolve) => {
        const SpeechRecognitionAPI =
            typeof window !== 'undefined'
                ? window.SpeechRecognition || window.webkitSpeechRecognition
                : null;

        if (!SpeechRecognitionAPI) {
            console.warn('[OfflineSync] SpeechRecognition not available, skipping transcription');
            resolve('');
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.lang = language;
        recognition.interimResults = false;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;

        let finalTranscript = '';
        let timeoutId: ReturnType<typeof setTimeout>;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                }
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.warn('[OfflineSync] Transcription error:', event.error);
            clearTimeout(timeoutId);
            resolve(finalTranscript.trim());
        };

        recognition.onend = () => {
            clearTimeout(timeoutId);
            resolve(finalTranscript.trim());
        };

        // Play audio through speaker so SpeechRecognition can hear it
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.volume = 0.01; // near-silent playback

        audio.onended = () => {
            // Give recognition a moment to finish processing
            timeoutId = setTimeout(() => {
                recognition.stop();
                URL.revokeObjectURL(audioUrl);
            }, 2000);
        };

        audio.onerror = () => {
            console.warn('[OfflineSync] Audio playback failed');
            URL.revokeObjectURL(audioUrl);
            resolve(finalTranscript.trim());
        };

        // Start recognition, then play audio
        recognition.start();
        audio.play().catch(() => {
            console.warn('[OfflineSync] Could not play audio');
            recognition.stop();
            URL.revokeObjectURL(audioUrl);
            resolve('');
        });
    });
}

/**
 * Upload the offline image blob to the server.
 */
async function uploadImage(
    item: OfflineListing,
    headers: Record<string, string>
): Promise<string> {
    const formData = new FormData();
    const file = new File([item.imageBlob], item.imageFileName, {
        type: item.imageBlob.type || 'image/jpeg',
    });
    formData.append('file', file);

    const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Image upload failed (${res.status})`);
    }

    const data = await res.json();
    return data.imageUrl;
}

/**
 * Call the AI generate-listing API.
 */
async function generateListing(
    imageUrl: string,
    transcript: string,
    headers: Record<string, string>
): Promise<{
    title: string;
    description: string;
    story: string;
    tags: string[];
    suggestedPrice: number;
}> {
    const res = await fetch('/api/ai/generate-listing', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            imageUrl,
            description: transcript,
        }),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `AI generation failed (${res.status})`);
    }

    const data = await res.json();
    return data.listing;
}

/**
 * Create the product in the database.
 */
async function createProduct(
    listing: {
        title: string;
        description: string;
        story: string;
        tags: string[];
        suggestedPrice: number;
    },
    imageUrl: string,
    headers: Record<string, string>
): Promise<void> {
    const res = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            title: listing.title,
            description: listing.description,
            story: listing.story,
            price: listing.suggestedPrice,
            category: 'Handcraft',
            tags: JSON.stringify(listing.tags),
            imageUrl,
        }),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Product creation failed (${res.status})`);
    }
}

/**
 * Check if a sync is currently in progress.
 */
export function isSyncInProgress(): boolean {
    return isSyncing;
}
