'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardSidebar from '@/components/DashboardSidebar';
import CraftDemandMap from '@/components/CraftDemandMap';
import DemandInsightCard from '@/components/DemandInsightCard';
import { Button } from '@/components/ui/button';
import {
    TrendingUp,
    Sparkles,
    Loader2,
    Palette,
    Globe,
    Zap,
} from 'lucide-react';

interface TrendData {
    trends: { title: string; description: string; growth: string }[];
    popularColors: string[];
    exportDemand: { country: string; demand: string }[];
}

interface DemandRegion {
    region: string;
    country: string;
    demandLevel: string;
    popularStyles: string[];
    popularColors: string[];
    avgPrice: number;
}

interface GlobalDemandData {
    regions: DemandRegion[];
    globalTrendSummary: string;
    recommendedProducts: string[];
    recommendedColors: string[];
    recommendedMarkets: string[];
}

export default function TrendsPage() {
    const { token } = useAuth();
    const [data, setData] = useState<TrendData | null>(null);
    const [loading, setLoading] = useState(false);

    // Global demand state
    const [demandData, setDemandData] = useState<GlobalDemandData | null>(null);
    const [demandLoading, setDemandLoading] = useState(false);
    const [craftType, setCraftType] = useState('');

    const fetchTrends = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch('/api/ai/trends', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (err) {
            console.error('Failed to fetch trends:', err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch artisan craft type
    useEffect(() => {
        if (!token) return;
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/artisan/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    const ct = data.profile?.craftType || '';
                    setCraftType(ct);
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        };
        fetchProfile();
    }, [token]);

    // Fetch global demand
    const fetchGlobalDemand = async () => {
        if (!token || !craftType) return;
        setDemandLoading(true);
        try {
            const res = await fetch('/api/ai/global-craft-demand', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ craftType }),
            });
            if (res.ok) {
                const result = await res.json();
                setDemandData(result.demand);
            }
        } catch (err) {
            console.error('Failed to fetch global demand:', err);
        } finally {
            setDemandLoading(false);
        }
    };

    useEffect(() => {
        fetchTrends();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Auto-fetch global demand when craftType is available
    useEffect(() => {
        if (craftType) fetchGlobalDemand();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [craftType]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-5xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Craft Trend Insights</h1>
                            <p className="text-gray-500 mt-1">AI-analyzed market trends for Indian artisan crafts</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={fetchGlobalDemand}
                                disabled={demandLoading || !craftType}
                                variant="outline"
                                className="rounded-xl gap-2"
                            >
                                {demandLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                                Refresh Demand
                            </Button>
                            <Button
                                onClick={fetchTrends}
                                disabled={loading}
                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                Refresh Insights
                            </Button>
                        </div>
                    </div>

                    {/* ─── Global Craft Demand Section ─── */}
                    {demandLoading && !demandData && (
                        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Globe className="h-7 w-7 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing global demand...</h3>
                            <p className="text-gray-500">Our AI is scanning international marketplaces for {craftType || 'your craft'}.</p>
                        </div>
                    )}

                    {demandData && (
                        <div className="space-y-6 mb-10">
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent" />
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
                                    Global Craft Demand
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-l from-blue-200 to-transparent" />
                            </div>

                            <CraftDemandMap regions={demandData.regions} />

                            <DemandInsightCard
                                regions={demandData.regions}
                                globalTrendSummary={demandData.globalTrendSummary}
                                recommendedProducts={demandData.recommendedProducts}
                                recommendedColors={demandData.recommendedColors}
                                recommendedMarkets={demandData.recommendedMarkets}
                            />
                        </div>
                    )}

                    {/* ─── Existing Trend Insights ─── */}
                    {loading && !data && (
                        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <TrendingUp className="h-7 w-7 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing craft trends...</h3>
                            <p className="text-gray-500">Our AI is scanning global market data.</p>
                        </div>
                    )}

                    {data && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-gradient-to-r from-orange-200 to-transparent" />
                                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest px-3 py-1 bg-orange-50 rounded-full border border-orange-200">
                                    Style & Market Trends
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-l from-orange-200 to-transparent" />
                            </div>

                            {/* Trending Styles */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-orange-500" /> Trending Craft Styles
                                </h2>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {data.trends.map((trend, i) => (
                                        <div
                                            key={i}
                                            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-bold text-gray-900">{trend.title}</h3>
                                                <span className="text-green-600 bg-green-50 text-sm font-bold px-3 py-1 rounded-full">
                                                    {trend.growth}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">{trend.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Popular Colors */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-orange-500" /> Popular Colors in Demand
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {data.popularColors.map((color, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 bg-orange-50 text-orange-800 px-4 py-2 rounded-full font-medium text-sm"
                                        >
                                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                                            {color}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Export Demand */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-orange-500" /> Export Demand by Country
                                </h2>
                                <div className="space-y-3">
                                    {data.exportDemand.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                                        >
                                            <span className="font-medium text-gray-900">{item.country}</span>
                                            <span
                                                className={`text-sm font-bold px-3 py-1 rounded-full ${item.demand === 'High'
                                                    ? 'bg-green-50 text-green-700'
                                                    : item.demand === 'Growing'
                                                        ? 'bg-orange-50 text-orange-700'
                                                        : 'bg-gray-50 text-gray-700'
                                                    }`}
                                            >
                                                {item.demand}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
