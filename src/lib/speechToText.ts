/**
 * Google Cloud Speech-to-Text helper.
 * Transcribes audio recordings to text with language detection.
 *
 * SERVER-SIDE ONLY.
 */
import { SpeechClient, protos } from '@google-cloud/speech';
import { getGoogleCloudConfig } from './googleCloud';

let speechClient: SpeechClient | null = null;

function getSpeechClient(): SpeechClient {
    if (speechClient) return speechClient;

    const config = getGoogleCloudConfig();

    if (config) {
        speechClient = new SpeechClient({
            projectId: config.projectId,
            credentials: {
                client_email: config.clientEmail,
                private_key: config.privateKey,
            },
        });
    } else {
        speechClient = new SpeechClient();
    }

    return speechClient;
}

export interface TranscriptionResult {
    text: string;
    detectedLanguage: string;
    confidence: number;
}

// Language codes supported by the app (mapped to BCP-47 format for Google STT)
const LANGUAGE_MAP: Record<string, string> = {
    'hi-IN': 'hi-IN',
    'en-IN': 'en-IN',
    'bn-IN': 'bn-IN',
    'ta-IN': 'ta-IN',
    'te-IN': 'te-IN',
    'mr-IN': 'mr-IN',
    'gu-IN': 'gu-IN',
    'kn-IN': 'kn-IN',
    'ml-IN': 'ml-IN',
    'pa-IN': 'pa-Guru-IN',
    'or-IN': 'or-IN',
    'ur-IN': 'ur-IN',
    'as-IN': 'as-IN',
};

/**
 * Transcribe audio to text using Google Cloud Speech-to-Text.
 *
 * @param audioBuffer - Raw audio data (WebM, FLAC, WAV, etc.)
 * @param languageCode - BCP-47 language code (e.g., 'hi-IN')
 * @param autoDetect - Whether to enable automatic language detection
 */
export async function transcribeAudio(
    audioBuffer: Buffer,
    languageCode: string = 'hi-IN',
    autoDetect: boolean = false
): Promise<TranscriptionResult> {
    const client = getSpeechClient();

    const mappedLanguage = LANGUAGE_MAP[languageCode] || languageCode;

    // Build recognition config
    const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
        encoding: 'WEBM_OPUS' as unknown as protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding,
        sampleRateHertz: 48000,
        languageCode: mappedLanguage,
        enableAutomaticPunctuation: true,
        model: 'latest_long',
    };

    // Add alternative languages for auto-detection
    if (autoDetect) {
        config.alternativeLanguageCodes = Object.values(LANGUAGE_MAP).filter(
            (code) => code !== mappedLanguage
        ).slice(0, 3); // Max 3 alternatives
    }

    const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
        config,
        audio: {
            content: audioBuffer.toString('base64'),
        },
    };

    try {
        const [response] = await client.recognize(request);

        if (!response.results || response.results.length === 0) {
            return { text: '', detectedLanguage: languageCode, confidence: 0 };
        }

        const result = response.results[0];
        const alternative = result.alternatives?.[0];

        return {
            text: alternative?.transcript || '',
            detectedLanguage: (result.languageCode as string) || languageCode,
            confidence: alternative?.confidence || 0,
        };
    } catch (error) {
        console.error('[SpeechToText] Transcription error:', error);
        throw error;
    }
}
