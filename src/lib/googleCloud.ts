/**
 * Google Cloud Authentication utility.
 * Provides secure service account authentication using environment variables.
 * Uses Google Application Default Credentials pattern.
 *
 * Supports multiple env var formats:
 * 1. Individual env vars (GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY)
 * 2. JSON blob (GOOGLE_APPLICATION_CREDENTIALS_JSON)
 * 3. ADC file path (GOOGLE_APPLICATION_CREDENTIALS)
 *
 * SERVER-SIDE ONLY — never import this file from client components.
 */

export interface GoogleCloudConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

/** Cache parsed JSON credentials to avoid re-parsing on every call. */
let _cachedJsonConfig: GoogleCloudConfig | null = null;
let _jsonConfigParsed = false;

/**
 * Parse the GOOGLE_APPLICATION_CREDENTIALS_JSON env var (JSON blob).
 * Returns null if not set or malformed.
 */
function parseJsonCredentials(): GoogleCloudConfig | null {
    if (_jsonConfigParsed) return _cachedJsonConfig;
    _jsonConfigParsed = true;

    const jsonStr = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!jsonStr) return null;

    try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.project_id && parsed.client_email && parsed.private_key) {
            _cachedJsonConfig = {
                projectId: parsed.project_id,
                clientEmail: parsed.client_email,
                privateKey: parsed.private_key.replace(/\\n/g, '\n'),
            };
            return _cachedJsonConfig;
        }
    } catch (error) {
        console.error('[GoogleCloud] Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', error);
    }

    return null;
}

/**
 * Get Google Cloud configuration from environment variables.
 *
 * Priority:
 * 1. Individual env vars (GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY)
 * 2. JSON blob (GOOGLE_APPLICATION_CREDENTIALS_JSON)
 * 3. GOOGLE_APPLICATION_CREDENTIALS file (handled by SDKs automatically)
 */
export function getGoogleCloudConfig(): GoogleCloudConfig | null {
    // Priority 1: Individual env vars
    const projectId = process.env.GCP_PROJECT_ID;
    const clientEmail = process.env.GCP_CLIENT_EMAIL;
    const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        return { projectId, clientEmail, privateKey };
    }

    // Priority 2: JSON blob
    const jsonConfig = parseJsonCredentials();
    if (jsonConfig) return jsonConfig;

    // Priority 3: ADC file (SDKs handle automatically)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return null; // SDKs use ADC automatically
    }

    return null;
}

/**
 * Get the Google Cloud project ID.
 * Checks GCP_PROJECT_ID, GOOGLE_PROJECT_ID, and JSON credentials.
 */
export function getProjectId(): string {
    const projectId =
        process.env.GCP_PROJECT_ID ||
        process.env.GOOGLE_PROJECT_ID ||
        parseJsonCredentials()?.projectId;

    if (!projectId) {
        throw new Error(
            'Google Cloud project ID is not set. ' +
            'Set GCP_PROJECT_ID, GOOGLE_PROJECT_ID, or GOOGLE_APPLICATION_CREDENTIALS_JSON in your .env file.'
        );
    }
    return projectId;
}

/**
 * Get the Google Cloud location/region.
 * Checks GCP_LOCATION and GOOGLE_LOCATION.
 */
export function getLocation(): string {
    return process.env.GCP_LOCATION || process.env.GOOGLE_LOCATION || 'us-central1';
}

/**
 * Check whether Google Cloud credentials are configured.
 */
export function isGoogleCloudConfigured(): boolean {
    return !!(
        (process.env.GCP_PROJECT_ID && process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY) ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS
    );
}
