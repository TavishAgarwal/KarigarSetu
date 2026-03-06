/**
 * POST /api/ai/speech-to-text
 * Transcribes uploaded audio using Google Cloud Speech-to-Text.
 *
 * Body: FormData with 'audio' file and optional 'language' string
 * Response: { text, detectedLanguage, confidence }
 */
import { NextRequest, NextResponse } from 'next/server';
import { isSpeechToTextEnabled } from '@/lib/featureFlags';
import { transcribeAudio } from '@/lib/speechToText';
import { aiLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
    const rateLimited = aiLimiter.check(req);
    if (rateLimited) return rateLimited;

    if (!isSpeechToTextEnabled()) {
        return NextResponse.json(
            { error: 'Speech-to-Text is not configured' },
            { status: 503 }
        );
    }

    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;
        const language = (formData.get('language') as string) || 'hi-IN';
        const autoDetect = formData.get('autoDetect') === 'true';

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        if (audioFile.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Audio file too large. Maximum size is 10MB.' },
                { status: 400 }
            );
        }

        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(new Uint8Array(arrayBuffer));

        const result = await transcribeAudio(buffer, language, autoDetect);

        return NextResponse.json(result);
    } catch (error) {
        console.error('[Speech-to-Text API] Error:', error);
        return NextResponse.json(
            { error: 'Transcription failed' },
            { status: 500 }
        );
    }
}
