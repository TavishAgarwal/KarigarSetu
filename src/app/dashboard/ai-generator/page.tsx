'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import DashboardSidebar from '@/components/DashboardSidebar';
import UploadWidget from '@/components/UploadWidget';
import VoiceInput from '@/components/VoiceInput';
import OfflineQueueStatus from '@/components/OfflineQueueStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import PriceInsightCard, { PriceEstimate } from '@/components/PriceInsightCard';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { saveOfflineListing, getQueueSummary } from '@/lib/offlineQueue';
import { syncPendingListings } from '@/lib/offlineSync';
import {
    Sparkles,
    Upload,
    Pencil,
    RefreshCw,
    Loader2,
    X,
    BookOpen,
    Shield,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    IndianRupee,
    Camera,
    WifiOff,
    Cloud,
    Mic,
} from 'lucide-react';

interface AIListing {
    title: string;
    description: string;
    story: string;
    tags: string[];
    suggestedPrice: number;
}

interface CraftStoryData {
    craftStory: string;
    craftHistory: string;
    artisanJourney: string;
    culturalSymbolism: string;
}

interface CraftProvenanceData {
    craftOrigin: string;
    traditionalTechnique: string;
    culturalSignificance: string;
    authenticityScore: number;
    verificationSummary: string;
}

interface CraftTrendData {
    trendSummary: string;
    recommendedStyles: string[];
    recommendedColors: string[];
    targetMarkets: string[];
}

interface VisionResult {
    craftType: string;
    category: string;
    tags: string[];
    materials: string;
    suggestedTitle: string;
}

export default function AIGeneratorPage() {
    const { token, user } = useAuth();
    const router = useRouter();
    const { isOnline } = useNetworkStatus();

    // Upload state
    const [imageUrl, setImageUrl] = useState('');
    const [userPrice, setUserPrice] = useState('');

    // Artisan profile craft type (auto-fetched)
    const [profileCraftType, setProfileCraftType] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);

    // AI result state
    const [listing, setListing] = useState<AIListing | null>(null);
    const [generating, setGenerating] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState('');

    // New AI insights state
    const [craftStoryData, setCraftStoryData] = useState<CraftStoryData | null>(null);
    const [craftProvenanceData, setCraftProvenanceData] = useState<CraftProvenanceData | null>(null);
    const [craftTrendData, setCraftTrendData] = useState<CraftTrendData | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [expandedInsight, setExpandedInsight] = useState<string | null>('story');

    // AI vision analysis state
    const [analyzing, setAnalyzing] = useState(false);
    const [visionResult, setVisionResult] = useState<VisionResult | null>(null);

    // Editable fields
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStory, setEditStory] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editTags, setEditTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');

    // Price insight state
    const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);
    const [priceEstimateLoading, setPriceEstimateLoading] = useState(false);

    // Offline state
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [offlineAudioBlob, setOfflineAudioBlob] = useState<Blob | null>(null);
    const [offlineAudioLanguage, setOfflineAudioLanguage] = useState('');
    const [offlineMessage, setOfflineMessage] = useState('');
    const [offlineQueueCount, setOfflineQueueCount] = useState(0);
    const syncTriggeredRef = useRef(false);

    // Auto-fetch artisan profile craft type on mount
    useEffect(() => {
        if (!token) return;
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/artisan/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfileCraftType(data.profile.craftType || '');
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    // Load offline queue count on mount
    useEffect(() => {
        const loadQueueCount = async () => {
            try {
                const summary = await getQueueSummary();
                setOfflineQueueCount(summary.pending + summary.failed);
            } catch {
                // IndexedDB may not be available
            }
        };
        loadQueueCount();
    }, []);

    // Auto-sync when coming back online
    useEffect(() => {
        if (isOnline && token && !syncTriggeredRef.current) {
            syncTriggeredRef.current = true;
            syncPendingListings(token).then(async () => {
                const summary = await getQueueSummary();
                setOfflineQueueCount(summary.pending + summary.failed);
                syncTriggeredRef.current = false;
            }).catch(() => {
                syncTriggeredRef.current = false;
            });
        }
    }, [isOnline, token]);

    // Handle voice transcript
    const handleVoiceTranscript = useCallback((text: string) => {
        setVoiceTranscript(text);
    }, []);

    // Handle audio recording (for offline storage)
    const handleAudioRecorded = useCallback((audioBlob: Blob, language: string) => {
        setOfflineAudioBlob(audioBlob);
        setOfflineAudioLanguage(language);
    }, []);

    // Handle offline save
    const handleOfflineSave = useCallback(async () => {
        if (!rawFile || !user) {
            setError('Please upload a photo of your craft');
            return;
        }

        try {
            const blob = new Blob([await rawFile.arrayBuffer()], { type: rawFile.type });
            await saveOfflineListing({
                imageBlob: blob,
                imageFileName: rawFile.name,
                transcript: voiceTranscript,
                artisanId: user.id,
                audioBlob: offlineAudioBlob || undefined,
                audioLanguage: offlineAudioLanguage || undefined,
            });

            const hasAudio = !!offlineAudioBlob;
            setOfflineMessage(
                hasAudio
                    ? '✅ Offline draft saved with voice recording. Your audio will be transcribed and listing created when internet reconnects.'
                    : '✅ Offline draft saved. It will automatically upload when internet reconnects.'
            );
            const summary = await getQueueSummary();
            setOfflineQueueCount(summary.pending + summary.failed);

            // Clear form
            setImageUrl('');
            setRawFile(null);
            setVoiceTranscript('');
            setOfflineAudioBlob(null);
            setOfflineAudioLanguage('');
            setUserPrice('');
            setVisionResult(null);
            setListing(null);

            // Clear message after 6 seconds
            setTimeout(() => setOfflineMessage(''), 6000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save offline draft');
        }
    }, [rawFile, voiceTranscript, offlineAudioBlob, offlineAudioLanguage, user]);

    // Fetch all 3 AI insights in parallel
    const fetchAIInsights = useCallback(async (craftType: string) => {
        if (!token || !craftType) return;
        setInsightsLoading(true);

        try {
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            };

            const [storyRes, provenanceRes, trendRes] = await Promise.allSettled([
                fetch('/api/ai/generate-craft-story', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        craftType,
                        region: 'India',
                        description: '',
                    }),
                }),
                fetch('/api/ai/authenticate-craft', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        craftType,
                        description: '',
                        imageUrl,
                        region: 'India',
                    }),
                }),
                fetch('/api/ai/craft-trends', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ craftType }),
                }),
            ]);

            if (storyRes.status === 'fulfilled' && storyRes.value.ok) {
                const data = await storyRes.value.json();
                setCraftStoryData(data.story);
            }
            if (provenanceRes.status === 'fulfilled' && provenanceRes.value.ok) {
                const data = await provenanceRes.value.json();
                setCraftProvenanceData(data.provenance);
            }
            if (trendRes.status === 'fulfilled' && trendRes.value.ok) {
                const data = await trendRes.value.json();
                setCraftTrendData(data.prediction);
            }
        } catch (err) {
            console.error('Failed to fetch AI insights:', err);
        } finally {
            setInsightsLoading(false);
        }
    }, [token, imageUrl]);

    const handleGenerate = useCallback(async (vision?: VisionResult) => {
        if (!imageUrl) {
            setError('Please upload a photo of your craft');
            return;
        }

        setGenerating(true);
        setError('');

        try {
            const visionCtx = vision || visionResult;
            const res = await fetch('/api/ai/generate-listing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    imageUrl,
                    visionContext: visionCtx
                        ? {
                            detectedCraft: visionCtx.craftType,
                            category: visionCtx.category,
                            materials: visionCtx.materials,
                            suggestedTitle: visionCtx.suggestedTitle,
                            tags: visionCtx.tags,
                        }
                        : undefined,
                }),
            });

            if (!res.ok) throw new Error('AI generation failed');

            const data = await res.json();
            const result = data.listing;
            const craftType = data.craftType || profileCraftType;
            setListing(result);
            setEditTitle(result.title);
            setEditDescription(result.description);
            setEditStory(result.story);
            setEditPrice(userPrice || String(result.suggestedPrice));
            setEditTags(result.tags);

            // After listing is generated, fetch all AI insights in parallel
            fetchAIInsights(craftType);

            // Fetch price estimate
            setPriceEstimateLoading(true);
            fetch('/api/ai/price-estimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    craftType,
                    materials: visionCtx?.materials || '',
                    imageUrl,
                }),
            })
                .then((r) => r.ok ? r.json() : null)
                .then((data) => {
                    if (data?.priceEstimate) setPriceEstimate(data.priceEstimate);
                })
                .catch(console.error)
                .finally(() => setPriceEstimateLoading(false));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setGenerating(false);
        }
    }, [imageUrl, token, visionResult, profileCraftType, userPrice, fetchAIInsights]);

    const handlePublish = async () => {
        if (!editTitle || !editDescription || !editPrice) {
            setError('Please fill in all required fields');
            return;
        }

        setPublishing(true);
        setError('');

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    story: editStory,
                    price: parseFloat(editPrice),
                    category: profileCraftType,
                    tags: JSON.stringify(editTags),
                    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
                    craftStoryData: craftStoryData || undefined,
                    craftProvenanceData: craftProvenanceData || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to publish');
            }

            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Publishing failed');
        } finally {
            setPublishing(false);
        }
    };

    const addTag = () => {
        if (newTag && !editTags.includes(newTag)) {
            setEditTags([...editTags, newTag]);
            setNewTag('');
        }
    };

    // Handle image upload and auto-analyze, then auto-generate
    const handleImageUpload = async (url: string) => {
        setImageUrl(url);
        if (url && token) {
            setAnalyzing(true);
            try {
                const res = await fetch('/api/ai/analyze-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ imageUrl: url }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setVisionResult(data.analysis);
                }
            } catch (err) {
                console.error('Vision analysis failed:', err);
            } finally {
                setAnalyzing(false);
            }
        }
    };

    const removeTag = (tag: string) => {
        setEditTags(editTags.filter((t) => t !== tag));
    };

    const toggleInsight = (key: string) => {
        setExpandedInsight(expandedInsight === key ? null : key);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 p-8 overflow-auto">
                {/* Network Status Indicator — only shown when offline */}
                {!isOnline && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl mb-4 text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        <WifiOff className="h-4 w-4" /> You are offline — drafts will be saved locally and synced when internet returns
                        {offlineQueueCount > 0 && (
                            <Badge className="ml-auto bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200">
                                <Cloud className="h-3 w-3 mr-1" />
                                {offlineQueueCount} pending
                            </Badge>
                        )}
                    </div>
                )}

                {/* Offline Success Message */}
                {offlineMessage && (
                    <div className="bg-green-50 text-green-700 text-sm p-4 rounded-xl border border-green-100 mb-6 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        {offlineMessage}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Listing Generator</h1>
                        <p className="text-gray-500 mt-1">Upload a photo and set your price — AI does the rest.</p>
                    </div>
                    {listing && (
                        <Button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2 px-6 h-12"
                        >
                            {publishing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4" />
                            )}
                            {publishing ? 'Publishing...' : 'Publish to Global Market'}
                        </Button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 mb-6">
                        {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Upload & Price */}
                    <div className="space-y-6">
                        {/* Craft Type Badge from Profile */}
                        {!profileLoading && profileCraftType && (
                            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Your Craft Specialization</p>
                                    <p className="font-semibold text-gray-900">{profileCraftType}</p>
                                </div>
                                <Badge className="ml-auto bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
                                    From Profile
                                </Badge>
                            </div>
                        )}

                        {/* Upload Section */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Camera className="h-5 w-5 text-orange-500" />
                                    Product Photo
                                </h2>
                                {imageUrl && (
                                    <button
                                        onClick={() => { setImageUrl(''); setVisionResult(null); setListing(null); }}
                                        className="text-orange-600 text-sm flex items-center gap-1 hover:text-orange-700"
                                    >
                                        <Pencil className="h-3 w-3" /> Change
                                    </button>
                                )}
                            </div>
                            <UploadWidget
                                onUpload={handleImageUpload}
                                currentImage={imageUrl}
                                onFileSelected={(file) => setRawFile(file)}
                            />

                            {analyzing && (
                                <div className="mt-4 bg-orange-50 rounded-xl p-4 border border-orange-100 flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
                                    <span className="text-sm text-orange-700 font-medium">AI is analyzing your craft image...</span>
                                </div>
                            )}

                            {visionResult && (
                                <div className="mt-4 bg-orange-50 rounded-xl p-4 border border-orange-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="h-4 w-4 text-orange-600" />
                                        <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                                            AI Vision Analysis
                                        </span>
                                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Detected Craft:</span>
                                            <span className="font-medium text-gray-900">{visionResult.craftType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Category:</span>
                                            <span className="font-medium text-gray-900">{visionResult.category}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Materials:</span>
                                            <span className="font-medium text-gray-900">{visionResult.materials}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {visionResult.tags.map((tag) => (
                                                <span key={tag} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price Input */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <IndianRupee className="h-5 w-5 text-orange-500" />
                                Your Price
                            </h2>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₹</span>
                                <Input
                                    type="number"
                                    value={userPrice}
                                    onChange={(e) => {
                                        setUserPrice(e.target.value);
                                        if (listing) setEditPrice(e.target.value);
                                    }}
                                    placeholder="Enter your price"
                                    className="pl-10 h-14 text-xl font-semibold rounded-xl border-gray-200 focus:ring-orange-300"
                                />
                            </div>
                            {listing && listing.suggestedPrice > 0 && (
                                <p className="text-xs text-gray-500 mt-2">
                                    AI suggested: <span className="font-semibold text-orange-600">₹{listing.suggestedPrice.toLocaleString('en-IN')}</span>
                                    {' '}based on market analysis
                                </p>
                            )}
                        </div>

                        {/* Voice Input */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Mic className="h-5 w-5 text-orange-500" />
                                Voice Description
                            </h2>
                            <VoiceInput
                                onTranscript={handleVoiceTranscript}
                                onAudioRecorded={handleAudioRecorded}
                                placeholder="Describe your craft in your own words"
                            />
                            {voiceTranscript && (
                                <div className="mt-3 bg-orange-50 rounded-xl p-3 border border-orange-100">
                                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Your Description</p>
                                    <p className="text-sm text-gray-700">{voiceTranscript}</p>
                                </div>
                            )}
                        </div>

                        {/* Generate / Save Offline Button */}
                        {isOnline ? (
                            <Button
                                onClick={() => handleGenerate()}
                                disabled={generating || !imageUrl || analyzing}
                                className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl gap-2 font-semibold shadow-lg shadow-orange-200 text-base"
                            >
                                {generating ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Sparkles className="h-5 w-5" />
                                )}
                                {generating ? 'AI is generating your listing...' : 'Generate Listing with AI'}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleOfflineSave}
                                disabled={!rawFile}
                                className="w-full h-14 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl gap-2 font-semibold shadow-lg shadow-gray-200 text-base"
                            >
                                <WifiOff className="h-5 w-5" />
                                Save Offline Draft
                            </Button>
                        )}

                        {/* Offline Queue Status */}
                        <OfflineQueueStatus />

                        {/* ─── AI Insights Panel ─── */}
                        {listing && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <Sparkles className="h-4 w-4 text-orange-500" />
                                    <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider">AI Intelligence</h2>
                                    {insightsLoading && <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />}
                                </div>

                                {/* Craft Story Insight */}
                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                    <button
                                        onClick={() => toggleInsight('story')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <BookOpen className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 text-sm">Craft Story</p>
                                                <p className="text-xs text-gray-500">Heritage narrative & cultural context</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {craftStoryData && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                            {expandedInsight === 'story' ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                        </div>
                                    </button>
                                    {expandedInsight === 'story' && craftStoryData && (
                                        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                                            <div className="pt-3">
                                                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">The Story</p>
                                                <p className="text-sm text-gray-700 leading-relaxed">{craftStoryData.craftStory}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Historical Origins</p>
                                                <p className="text-sm text-gray-700 leading-relaxed">{craftStoryData.craftHistory}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Artisan Journey</p>
                                                <p className="text-sm text-gray-700 leading-relaxed">{craftStoryData.artisanJourney}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Cultural Symbolism</p>
                                                <p className="text-sm text-gray-700 leading-relaxed">{craftStoryData.culturalSymbolism}</p>
                                            </div>
                                        </div>
                                    )}
                                    {expandedInsight === 'story' && !craftStoryData && insightsLoading && (
                                        <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Generating heritage narrative...
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Craft Authenticity Insight */}
                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                    <button
                                        onClick={() => toggleInsight('auth')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Shield className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 text-sm">Craft Authenticity</p>
                                                <p className="text-xs text-gray-500">Provenance & verification score</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {craftProvenanceData && (
                                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                    {craftProvenanceData.authenticityScore}%
                                                </span>
                                            )}
                                            {expandedInsight === 'auth' ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                        </div>
                                    </button>
                                    {expandedInsight === 'auth' && craftProvenanceData && (
                                        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                                            <div className="pt-3 flex items-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-green-700">{craftProvenanceData.authenticityScore}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">Authenticity Score</p>
                                                    <p className="text-xs text-gray-500">Based on craft analysis</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Origin</p>
                                                <p className="text-sm text-gray-700">{craftProvenanceData.craftOrigin}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Traditional Technique</p>
                                                <p className="text-sm text-gray-700">{craftProvenanceData.traditionalTechnique}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Verification</p>
                                                <p className="text-sm text-gray-700">{craftProvenanceData.verificationSummary}</p>
                                            </div>
                                        </div>
                                    )}
                                    {expandedInsight === 'auth' && !craftProvenanceData && insightsLoading && (
                                        <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Verifying craft authenticity...
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Market Trends Insight */}
                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                    <button
                                        onClick={() => toggleInsight('trends')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 text-sm">Market Insights</p>
                                                <p className="text-xs text-gray-500">Trends, colors & target markets</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {craftTrendData && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                                            {expandedInsight === 'trends' ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                        </div>
                                    </button>
                                    {expandedInsight === 'trends' && craftTrendData && (
                                        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                                            <div className="pt-3">
                                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Trend Summary</p>
                                                <p className="text-sm text-gray-700 leading-relaxed">{craftTrendData.trendSummary}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Recommended Styles</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {craftTrendData.recommendedStyles.map((s, i) => (
                                                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Trending Colors</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {craftTrendData.recommendedColors.map((c, i) => (
                                                        <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-medium">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Target Markets</p>
                                                <div className="space-y-1.5">
                                                    {craftTrendData.targetMarkets.map((m, i) => (
                                                        <p key={i} className="text-sm text-gray-700">• {m}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {expandedInsight === 'trends' && !craftTrendData && insightsLoading && (
                                        <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing market trends...
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: AI Output */}
                    <div className="space-y-6">
                        {!listing && !generating && (
                            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="h-8 w-8 text-orange-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Generated Listing</h3>
                                <p className="text-gray-500 max-w-xs mx-auto">
                                    Upload a photo of your craft and click &ldquo;Generate Listing with AI&rdquo; — we&rsquo;ll create a professional product listing automatically.
                                </p>
                            </div>
                        )}

                        {generating && (
                            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                    <Sparkles className="h-8 w-8 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Crafting your listing...</h3>
                                <p className="text-gray-500">Our AI is analyzing your craft photo and creating a compelling story.</p>
                            </div>
                        )}

                        {listing && (
                            <>
                                {/* Title */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                                            Product Title
                                        </span>
                                        <Pencil className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Input
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0 text-gray-900"
                                    />
                                </div>

                                {/* Description */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                                            Product Description
                                        </span>
                                        <Pencil className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <Textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="border-none p-0 min-h-[120px] focus-visible:ring-0 text-gray-700 resize-none"
                                    />
                                </div>

                                {/* Story */}
                                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                                            The Cultural Story (AI Narrative)
                                        </span>
                                    </div>
                                    <Textarea
                                        value={editStory}
                                        onChange={(e) => setEditStory(e.target.value)}
                                        className="border-none bg-transparent p-0 min-h-[150px] focus-visible:ring-0 text-gray-700 italic resize-none"
                                    />
                                    <button
                                        onClick={() => handleGenerate()}
                                        className="text-orange-600 text-sm flex items-center gap-1 mt-3 hover:text-orange-700 font-medium"
                                    >
                                        <RefreshCw className="h-3 w-3" /> Regenerate Story
                                    </button>
                                </div>

                                {/* Price Display */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <IndianRupee className="h-5 w-5 text-orange-500" />
                                        Final Price
                                    </h2>
                                    <div className="text-center">
                                        <div className="flex items-baseline justify-center gap-2 mb-2">
                                            <span className="text-4xl font-bold text-orange-600">
                                                ₹{parseFloat(editPrice || '0').toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <Input
                                            type="number"
                                            value={editPrice}
                                            onChange={(e) => { setEditPrice(e.target.value); setUserPrice(e.target.value); }}
                                            className="text-center rounded-xl h-12 text-lg font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* AI Price Recommendation */}
                                <PriceInsightCard
                                    data={priceEstimate}
                                    loading={priceEstimateLoading}
                                    onAccept={(price) => { setEditPrice(String(price)); setUserPrice(String(price)); }}
                                    currentPrice={editPrice}
                                />

                                {/* Tags */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider block mb-3">
                                        Suggested Tags
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {editTags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 rounded-full px-3 py-1"
                                            >
                                                #{tag}
                                                <button onClick={() => removeTag(tag)} className="ml-1">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                        <div className="flex items-center gap-1">
                                            <Input
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                                placeholder="+ Add Tag"
                                                className="w-24 h-7 text-xs rounded-full border-dashed border-orange-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
