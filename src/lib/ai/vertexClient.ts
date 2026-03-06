/**
 * Vertex AI client for Gemini models.
 * Uses Google Cloud Vertex AI SDK instead of the direct Gemini API.
 * Falls back gracefully when Vertex AI is not configured.
 *
 * SERVER-SIDE ONLY.
 */
import { VertexAI } from '@google-cloud/vertexai';
import { getGoogleCloudConfig, getProjectId, getLocation } from '../googleCloud';

let vertexAIInstance: VertexAI | null = null;

/**
 * Get or create a Vertex AI client instance (singleton).
 * Uses getProjectId()/getLocation() which support GCP_*, GOOGLE_*, and JSON blob env vars.
 */
export function getVertexAI(): VertexAI {
    if (vertexAIInstance) return vertexAIInstance;

    const projectId = getProjectId();
    const location = getLocation();

    const config = getGoogleCloudConfig();

    // If individual credentials are provided, set them for the SDK
    if (config) {
        // The Vertex AI SDK uses ADC or GOOGLE_APPLICATION_CREDENTIALS by default.
        // For individual env vars, we rely on the project ID and let the SDK
        // use the configured auth (ADC, service account file, or metadata server).
    }

    vertexAIInstance = new VertexAI({
        project: projectId,
        location,
    });

    return vertexAIInstance;
}

/**
 * Get a Vertex AI Gemini model instance.
 */
export function getVertexModel(modelName: string = 'gemini-2.0-flash') {
    const vertexAI = getVertexAI();
    return vertexAI.getGenerativeModel({ model: modelName });
}

// ─── Retry Logic ────────────────────────────────────────────────────────────

interface RetryOptions {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
}

/**
 * Execute a function with exponential backoff retry logic.
 * Handles rate limits (429) and transient server errors (500, 503).
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 30000 } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: unknown) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Don't retry on non-retryable errors
            if (!isRetryableError(error)) {
                throw lastError;
            }

            if (attempt === maxRetries) {
                break;
            }

            // Exponential backoff with jitter
            const delay = Math.min(
                baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
                maxDelayMs
            );

            console.warn(
                `[Vertex AI] Retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries}):`,
                lastError.message
            );

            await sleep(delay);
        }
    }

    throw lastError!;
}

function isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return (
            message.includes('429') ||
            message.includes('rate limit') ||
            message.includes('quota') ||
            message.includes('500') ||
            message.includes('503') ||
            message.includes('unavailable') ||
            message.includes('deadline') ||
            message.includes('timeout') ||
            message.includes('econnreset') ||
            message.includes('econnrefused')
        );
    }
    return false;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
