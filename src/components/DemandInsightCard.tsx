'use client';

import { Globe, Palette, ShoppingBag, TrendingUp, Lightbulb, MapPin, IndianRupee } from 'lucide-react';

interface Region {
    region: string;
    country: string;
    demandLevel: string;
    popularStyles: string[];
    popularColors: string[];
    avgPrice: number;
}

interface DemandInsightCardProps {
    regions: Region[];
    globalTrendSummary: string;
    recommendedProducts: string[];
    recommendedColors: string[];
    recommendedMarkets: string[];
}

const FLAG_EMOJI: Record<string, string> = {
    India: '🇮🇳',
    'United States': '🇺🇸',
    Japan: '🇯🇵',
    Germany: '🇩🇪',
    France: '🇫🇷',
    'United Kingdom': '🇬🇧',
    Australia: '🇦🇺',
    UAE: '🇦🇪',
};

const DEMAND_BADGE: Record<string, string> = {
    High: 'bg-green-100 text-green-700 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Low: 'bg-red-100 text-red-700 border-red-200',
};

export default function DemandInsightCard({
    regions,
    globalTrendSummary,
    recommendedProducts,
    recommendedColors,
    recommendedMarkets,
}: DemandInsightCardProps) {
    return (
        <div className="space-y-6">
            {/* Global Trend Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900">AI Market Summary</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{globalTrendSummary}</p>
            </div>

            {/* Per-Region Detail Cards */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-500" /> Market Details by Country
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {regions.map((r, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{FLAG_EMOJI[r.country] || '🌍'}</span>
                                    <div>
                                        <p className="font-bold text-gray-900">{r.country}</p>
                                        <p className="text-xs text-gray-400">{r.region}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${DEMAND_BADGE[r.demandLevel] || 'bg-gray-100 text-gray-600'}`}>
                                    {r.demandLevel}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <IndianRupee className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="text-gray-500">Avg Price:</span>
                                    <span className="font-bold text-gray-900">₹{r.avgPrice.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <ShoppingBag className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                                    <div>
                                        <span className="text-gray-500">Styles: </span>
                                        <span className="text-gray-700">{r.popularStyles.join(', ')}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Palette className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                                    <div>
                                        <span className="text-gray-500">Colors: </span>
                                        <span className="text-gray-700">{r.popularColors.join(', ')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="grid md:grid-cols-3 gap-4">
                {/* Recommended Products */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <ShoppingBag className="h-5 w-5 text-orange-500" />
                        <h3 className="font-bold text-gray-900 text-sm">Create These</h3>
                    </div>
                    <div className="space-y-2">
                        {recommendedProducts.map((p, i) => (
                            <p key={i} className="text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-2 border border-orange-100">
                                {p}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Recommended Colors */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Palette className="h-5 w-5 text-purple-500" />
                        <h3 className="font-bold text-gray-900 text-sm">Use These Colors</h3>
                    </div>
                    <div className="space-y-2">
                        {recommendedColors.map((c, i) => (
                            <div key={i} className="text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-2 border border-purple-100 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-400" />
                                {c}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommended Markets */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Globe className="h-5 w-5 text-emerald-500" />
                        <h3 className="font-bold text-gray-900 text-sm">Export To</h3>
                    </div>
                    <div className="space-y-2">
                        {recommendedMarkets.map((m, i) => (
                            <p key={i} className="text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-2 border border-emerald-100">
                                {m}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
