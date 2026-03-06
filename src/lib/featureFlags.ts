/**
 * Feature flags for Google Cloud service integrations.
 * Each flag checks for required environment variables — returns false if missing.
 * This allows zero-config development with existing Gemini API key.
 *
 * Supports multiple env var naming conventions:
 *   - GCP_PROJECT_ID / GOOGLE_PROJECT_ID
 *   - GOOGLE_APPLICATION_CREDENTIALS_JSON (JSON blob)
 *   - FIREBASE_ADMIN_SDK_JSON (JSON blob)
 *   - AI_LISTING_FUNCTION_URL / CLOUD_FUNCTION_PRODUCT_PIPELINE_URL
 */

/** Helper: check if any GCP project ID is available */
function hasGcpProjectId(): boolean {
    return !!(
        process.env.GCP_PROJECT_ID ||
        process.env.GOOGLE_PROJECT_ID ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    );
}

/** Helper: check if GCP credentials are available (individual vars, JSON blob, or ADC file) */
function hasGcpCredentials(): boolean {
    return !!(
        process.env.GCP_CLIENT_EMAIL ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS
    );
}

/** Vertex AI requires project ID + credentials */
export function isVertexAIEnabled(): boolean {
    return hasGcpProjectId() && hasGcpCredentials();
}

/** Cloud Storage requires bucket name + project ID */
export function isCloudStorageEnabled(): boolean {
    return !!(process.env.GCS_BUCKET_NAME && hasGcpProjectId());
}

/** Firebase requires project config */
export function isFirebaseEnabled(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
}

/** Firebase Admin requires service account credentials */
export function isFirebaseAdminEnabled(): boolean {
    return !!(
        process.env.FIREBASE_ADMIN_SDK_JSON ||
        (process.env.FIREBASE_ADMIN_PROJECT_ID &&
            (process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.GOOGLE_APPLICATION_CREDENTIALS))
    );
}

/** BigQuery requires project ID + dataset */
export function isBigQueryEnabled(): boolean {
    return !!(hasGcpProjectId() && process.env.BIGQUERY_DATASET);
}

/** Speech-to-Text requires GCP credentials */
export function isSpeechToTextEnabled(): boolean {
    return hasGcpProjectId() && hasGcpCredentials();
}

/** Translate API requires API key or GCP credentials */
export function isTranslateAPIEnabled(): boolean {
    return !!(
        process.env.GOOGLE_TRANSLATE_API_KEY ||
        (hasGcpProjectId() && hasGcpCredentials())
    );
}

/** Google Maps requires a public API key */
export function isGoogleMapsEnabled(): boolean {
    return !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

/** Cloud Functions require endpoint URLs (supports both naming conventions) */
export function isCloudFunctionsEnabled(): boolean {
    return !!(
        process.env.CLOUD_FUNCTION_PRODUCT_PIPELINE_URL ||
        process.env.AI_LISTING_FUNCTION_URL ||
        process.env.CLOUD_FUNCTION_ORDER_NOTIFICATION_URL ||
        process.env.ORDER_NOTIFY_FUNCTION_URL
    );
}
