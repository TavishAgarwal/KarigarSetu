'use client';

import { useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const LANGUAGES = [
    { code: 'original', label: 'Original' },
    { code: 'Hindi', label: 'हिन्दी (Hindi)' },
    { code: 'Bengali', label: 'বাংলা (Bengali)' },
    { code: 'Tamil', label: 'தமிழ் (Tamil)' },
    { code: 'Telugu', label: 'తెలుగు (Telugu)' },
    { code: 'Marathi', label: 'मराठी (Marathi)' },
    { code: 'French', label: 'Français (French)' },
    { code: 'Spanish', label: 'Español (Spanish)' },
    { code: 'German', label: 'Deutsch (German)' },
    { code: 'Japanese', label: '日本語 (Japanese)' },
];

interface TranslateWidgetProps {
    originalDescription: string;
    originalStory: string;
}

export default function TranslateWidget({ originalDescription, originalStory }: TranslateWidgetProps) {
    const [language, setLanguage] = useState('original');
    const [translatedDescription, setTranslatedDescription] = useState('');
    const [translatedStory, setTranslatedStory] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTranslate = async (lang: string) => {
        setLanguage(lang);
        if (lang === 'original') {
            setTranslatedDescription('');
            setTranslatedStory('');
            return;
        }

        setLoading(true);
        try {
            const [descRes, storyRes] = await Promise.all([
                fetch('/api/ai/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: originalDescription, targetLanguage: lang }),
                }),
                originalStory
                    ? fetch('/api/ai/translate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: originalStory, targetLanguage: lang }),
                    })
                    : Promise.resolve(null),
            ]);

            if (descRes.ok) {
                const descData = await descRes.json();
                setTranslatedDescription(descData.translated);
            }
            if (storyRes && storyRes.ok) {
                const storyData = await storyRes.json();
                setTranslatedStory(storyData.translated);
            }
        } catch (err) {
            console.error('Translation failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const description = language === 'original' ? originalDescription : translatedDescription || originalDescription;
    const story = language === 'original' ? originalStory : translatedStory || originalStory;

    return (
        <div>
            {/* Language Selector */}
            <div className="flex items-center gap-2 mb-6">
                <Globe className="h-4 w-4 text-gray-400" />
                <Select value={language} onValueChange={handleTranslate}>
                    <SelectTrigger className="w-[180px] h-9 text-sm rounded-lg">
                        <SelectValue placeholder="Translate to..." />
                    </SelectTrigger>
                    <SelectContent>
                        {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
            </div>

            {/* Description */}
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3">
                    Product Description
                </h2>
                <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>

            {/* Story */}
            {story && (
                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 mb-8">
                    <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-3">
                        The Cultural Story
                    </h2>
                    <p className="text-gray-700 italic leading-relaxed">&ldquo;{story}&rdquo;</p>
                </div>
            )}
        </div>
    );
}
