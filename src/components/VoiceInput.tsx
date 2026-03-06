'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    /** Called with raw audio blob when recording completes (for offline storage) */
    onAudioRecorded?: (audioBlob: Blob, language: string) => void;
    placeholder?: string;
    className?: string;
}

const LANGUAGES = [
    { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
    { code: 'en-IN', label: 'English (India)' },
    { code: 'bn-IN', label: 'বাংলা (Bengali)' },
    { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
    { code: 'te-IN', label: 'తెలుగు (Telugu)' },
    { code: 'mr-IN', label: 'मराठी (Marathi)' },
    { code: 'gu-IN', label: 'ગુજરાતી (Gujarati)' },
    { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml-IN', label: 'മലയാളം (Malayalam)' },
    { code: 'pa-IN', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'or-IN', label: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'ur-IN', label: 'اردو (Urdu)' },
    { code: 'as-IN', label: 'অসমীয়া (Assamese)' },
];

export default function VoiceInput({ onTranscript, onAudioRecorded, placeholder, className }: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [language, setLanguage] = useState('hi-IN');
    const [transcript, setTranscript] = useState('');
    const [supported, setSupported] = useState(true);
    const [networkError, setNetworkError] = useState(false);
    const [audioSaved, setAudioSaved] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [serverTranscript, setServerTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSupported(false);
        }
    }, []);

    /**
     * Send recorded audio to Google Cloud Speech-to-Text API.
     * Falls back gracefully if the API is not configured.
     */
    const transcribeWithServer = useCallback(async (audioBlob: Blob, lang: string): Promise<string | null> => {
        try {
            setIsTranscribing(true);
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('language', lang);
            formData.append('autoDetect', 'true');

            const res = await fetch('/api/ai/speech-to-text', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                // 503 = Speech-to-Text not configured — not an error
                if (res.status === 503) return null;
                throw new Error(`STT failed: ${res.status}`);
            }

            const data = await res.json();
            return data.text || null;
        } catch (error) {
            console.warn('[VoiceInput] Server transcription failed:', error);
            return null;
        } finally {
            setIsTranscribing(false);
        }
    }, []);

    const startRecording = useCallback(async () => {
        setNetworkError(false);
        setAudioSaved(false);
        setTranscript('');
        setServerTranscript('');

        // Always start MediaRecorder to capture raw audio
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
        } catch (err) {
            console.error('Failed to access microphone:', err);
            return;
        }

        // Also try SpeechRecognition for live transcript (may fail if offline)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = language;
            recognition.interimResults = true;
            recognition.continuous = true;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = 0; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript;
                    } else {
                        interimTranscript += result[0].transcript;
                    }
                }

                const combined = finalTranscript || interimTranscript;
                setTranscript(combined);
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                if (event.error === 'network') {
                    // Speech recognition failed due to no network — that's fine,
                    // we still have the raw audio from MediaRecorder
                    setNetworkError(true);
                } else {
                    console.error('Speech recognition error:', event.error);
                }
            };

            recognition.onend = () => {
                // Don't stop recording — MediaRecorder may still be running
            };

            recognitionRef.current = recognition;
            recognition.start();
        }

        setIsRecording(true);
    }, [language]);

    const stopRecording = useCallback(() => {
        // Stop SpeechRecognition
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        // Stop MediaRecorder and save audio blob
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                // Always emit the audio for offline storage
                if (onAudioRecorded && audioBlob.size > 0) {
                    onAudioRecorded(audioBlob, language);
                    setAudioSaved(true);
                }

                // Try server-side transcription (Google Cloud Speech-to-Text)
                if (audioBlob.size > 0) {
                    const sttResult = await transcribeWithServer(audioBlob, language);
                    if (sttResult) {
                        setServerTranscript(sttResult);
                        // If browser SpeechRecognition didn't produce a result, use server result
                        if (!transcript) {
                            setTranscript(sttResult);
                            onTranscript(sttResult);
                        }
                    }
                }

                // Stop all tracks from the stream
                mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
                audioChunksRef.current = [];
            };

            mediaRecorderRef.current.stop();
        }

        setIsRecording(false);

        // If we got a transcript from SpeechRecognition, use it
        if (transcript) {
            onTranscript(transcript);
        }
    }, [transcript, onTranscript, onAudioRecorded, language, transcribeWithServer]);

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // Use server transcript if available and better than browser transcript
    const displayTranscript = serverTranscript || transcript;

    if (!supported) {
        return (
            <div className={`bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500 ${className || ''}`}>
                <MicOff className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                Voice input is not supported in this browser. Please use Chrome or Edge.
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className || ''}`}>
            {/* Language Selector */}
            <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[200px] h-9 text-sm rounded-lg">
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                        {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Recording Area */}
            <div className={`rounded-2xl p-6 text-center transition-all ${isRecording
                ? 'bg-red-50 border-2 border-red-200'
                : 'bg-orange-50 border-2 border-orange-100'
                }`}>
                <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={isTranscribing}
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-all shadow-lg ${isRecording
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-200 animate-pulse'
                        : isTranscribing
                            ? 'bg-orange-300 shadow-orange-100 cursor-wait'
                            : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                        }`}
                >
                    {isTranscribing ? (
                        <Loader2 className="h-7 w-7 text-white animate-spin" />
                    ) : isRecording ? (
                        <MicOff className="h-7 w-7 text-white" />
                    ) : (
                        <Mic className="h-7 w-7 text-white" />
                    )}
                </button>

                <p className="font-medium text-gray-800">
                    {isTranscribing
                        ? '🔄 Transcribing with AI...'
                        : isRecording
                            ? '🔴 Recording... Tap to stop'
                            : placeholder || 'Tap to speak'}
                </p>

                {isRecording && (
                    <div className="flex items-center justify-center gap-1 mt-3">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-red-400 rounded-full animate-pulse"
                                style={{
                                    height: `${12 + Math.random() * 20}px`,
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            />
                        ))}
                    </div>
                )}

                {displayTranscript && (
                    <div className="mt-4 bg-white rounded-xl p-3 text-left">
                        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
                            {serverTranscript ? '🤖 AI Transcript' : 'Transcript'}
                        </p>
                        <p className="text-sm text-gray-700">{displayTranscript}</p>
                    </div>
                )}
            </div>

            {/* Offline audio saved message */}
            {networkError && audioSaved && (
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                    <p className="text-sm font-medium text-green-700">🎤 Voice recording saved!</p>
                    <p className="text-xs text-green-600 mt-1">
                        Your audio will be transcribed automatically when internet returns.
                    </p>
                </div>
            )}

            {/* Network error without audio saved */}
            {networkError && !audioSaved && !isRecording && (
                <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-200">
                    <p className="text-sm font-medium text-orange-700">🔇 Live transcription unavailable offline</p>
                    <p className="text-xs text-orange-600 mt-1">
                        Tap the mic to record — your audio will be saved and transcribed when internet returns.
                    </p>
                </div>
            )}

            {displayTranscript && !isRecording && !isTranscribing && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        onTranscript(displayTranscript);
                        setTranscript('');
                        setServerTranscript('');
                    }}
                    className="w-full rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                    Use this transcript ✓
                </Button>
            )}
        </div>
    );
}
