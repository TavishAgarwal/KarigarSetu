/**
 * Google Translate API helper.
 * Provides translation with caching, batch support, and language detection.
 *
 * SERVER-SIDE ONLY.
 */
import { v2 } from '@google-cloud/translate';
import { getGoogleCloudConfig } from './googleCloud';

let translateClient: v2.Translate | null = null;

function getTranslateClient(): v2.Translate {
    if (translateClient) return translateClient;

    // Prefer dedicated Translate API key
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (apiKey) {
        translateClient = new v2.Translate({ key: apiKey });
    } else {
        // Fall back to service account credentials
        const config = getGoogleCloudConfig();
        if (config) {
            translateClient = new v2.Translate({
                projectId: config.projectId,
                credentials: {
                    client_email: config.clientEmail,
                    private_key: config.privateKey,
                },
            });
        } else {
            translateClient = new v2.Translate();
        }
    }

    return translateClient;
}

// ─── Translation Cache ─────────────────────────────────────────────────────

const translationCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(text: string, targetLang: string): string {
    return `${targetLang}:${text.substring(0, 200)}`;
}

function getCached(key: string): string | null {
    const entry = translationCache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.text;
    }
    if (entry) translationCache.delete(key);
    return null;
}

function setCache(key: string, text: string): void {
    // Limit cache size
    if (translationCache.size > 1000) {
        const firstKey = translationCache.keys().next().value;
        if (firstKey) translationCache.delete(firstKey);
    }
    translationCache.set(key, { text, timestamp: Date.now() });
}

// ─── Language code mapping ──────────────────────────────────────────────────

const LANGUAGE_CODE_MAP: Record<string, string> = {
    'Hindi': 'hi',
    'Bengali': 'bn',
    'Tamil': 'ta',
    'Telugu': 'te',
    'Marathi': 'mr',
    'French': 'fr',
    'Spanish': 'es',
    'German': 'de',
    'Japanese': 'ja',
    'Gujarati': 'gu',
    'Kannada': 'kn',
    'Malayalam': 'ml',
    'Punjabi': 'pa',
    'Odia': 'or',
    'Urdu': 'ur',
};

function resolveLanguageCode(lang: string): string {
    return LANGUAGE_CODE_MAP[lang] || lang;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Translate text to target language using Google Translate API.
 */
export async function translateWithAPI(
    text: string,
    targetLanguage: string
): Promise<string> {
    const targetCode = resolveLanguageCode(targetLanguage);
    const cacheKey = getCacheKey(text, targetCode);

    // Check cache
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const client = getTranslateClient();
    const [translation] = await client.translate(text, targetCode);

    setCache(cacheKey, translation);
    return translation;
}

/**
 * Batch translate multiple texts to a target language.
 */
export async function batchTranslate(
    texts: string[],
    targetLanguage: string
): Promise<string[]> {
    const targetCode = resolveLanguageCode(targetLanguage);
    const results: string[] = [];
    const uncachedTexts: { index: number; text: string }[] = [];

    // Check cache for each text
    for (let i = 0; i < texts.length; i++) {
        const cacheKey = getCacheKey(texts[i], targetCode);
        const cached = getCached(cacheKey);
        if (cached) {
            results[i] = cached;
        } else {
            uncachedTexts.push({ index: i, text: texts[i] });
        }
    }

    // Translate uncached texts in batch
    if (uncachedTexts.length > 0) {
        const client = getTranslateClient();
        const [translations] = await client.translate(
            uncachedTexts.map((u) => u.text),
            targetCode
        );

        const translationsArray = Array.isArray(translations) ? translations : [translations];
        for (let i = 0; i < uncachedTexts.length; i++) {
            const translated = translationsArray[i];
            results[uncachedTexts[i].index] = translated;

            const cacheKey = getCacheKey(uncachedTexts[i].text, targetCode);
            setCache(cacheKey, translated);
        }
    }

    return results;
}

/**
 * Detect the language of a text.
 */
export async function detectLanguage(
    text: string
): Promise<{ language: string; confidence: number }> {
    const client = getTranslateClient();
    const [detections] = await client.detect(text);

    const detection = Array.isArray(detections) ? detections[0] : detections;

    return {
        language: detection.language || 'unknown',
        confidence: detection.confidence || 0,
    };
}
