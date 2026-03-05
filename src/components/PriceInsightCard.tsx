'use client';

import { TrendingUp, Globe, IndianRupee, BarChart3, Target, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PriceEstimate {
    recommendedPriceMin: number;
    recommendedPriceMax: number;
    recommendedPrice: number;
    globalAveragePrice: number;
    reasoning: string;
    demandLevel: string;
    targetMarkets: string[];
}

interface PriceInsightCardProps {
    data: PriceEstimate | null;
    loading: boolean;
    onAccept: (price: number) => void;
    currentPrice: string;
}

export default function PriceInsightCard({ data, loading, onAccept, currentPrice }: PriceInsightCardProps) {
    if (loading) {
        return (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">AI Price Recommendation</h3>
                        <p className="text-sm text-gray-500">Analyzing market data...</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-12 bg-emerald-100/50 rounded-xl animate-pulse" />
                    <div className="h-8 bg-emerald-100/50 rounded-xl animate-pulse w-3/4" />
                    <div className="h-8 bg-emerald-100/50 rounded-xl animate-pulse w-1/2" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const demandColor = data.demandLevel === 'High'
        ? 'bg-green-100 text-green-700 border-green-200'
        : data.demandLevel === 'Medium'
            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
            : 'bg-red-100 text-red-700 border-red-200';

    const isAccepted = currentPrice === String(data.recommendedPrice);

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">AI Price Recommendation</h3>
                    <p className="text-xs text-gray-500">Based on materials, demand &amp; global markets</p>
                </div>
            </div>

            {/* Main Price */}
            <div className="bg-white rounded-2xl p-5 mb-4 border border-emerald-100 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Recommended Price</p>
                <div className="flex items-baseline justify-center gap-1">
                    <IndianRupee className="h-6 w-6 text-emerald-600" />
                    <span className="text-4xl font-bold text-emerald-600">
                        {data.recommendedPrice.toLocaleString('en-IN')}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/70 rounded-xl p-3 border border-emerald-100">
                    <div className="flex items-center gap-1.5 mb-1">
                        <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs text-gray-400 font-semibold">Market Range</span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">
                        ₹{data.recommendedPriceMin.toLocaleString('en-IN')} – ₹{data.recommendedPriceMax.toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="bg-white/70 rounded-xl p-3 border border-emerald-100">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Globe className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs text-gray-400 font-semibold">Global Average</span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">
                        ₹{data.globalAveragePrice.toLocaleString('en-IN')}
                    </p>
                </div>
            </div>

            {/* Demand Level */}
            <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-gray-600 font-medium">Demand Level:</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${demandColor}`}>
                    {data.demandLevel}
                </span>
            </div>

            {/* Target Markets */}
            <div className="mb-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Target Markets
                </p>
                <div className="space-y-1.5">
                    {data.targetMarkets.map((market, i) => (
                        <p key={i} className="text-xs text-gray-600 bg-white/70 rounded-lg px-3 py-1.5 border border-emerald-100">
                            {market}
                        </p>
                    ))}
                </div>
            </div>

            {/* Reasoning */}
            <div className="bg-white/70 rounded-xl p-3 border border-emerald-100 mb-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">AI Reasoning</p>
                <p className="text-sm text-gray-600 leading-relaxed">{data.reasoning}</p>
            </div>

            {/* Accept Button */}
            <Button
                onClick={() => onAccept(data.recommendedPrice)}
                disabled={isAccepted}
                className={`w-full h-12 rounded-xl font-bold text-base gap-2 ${isAccepted
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 cursor-default'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    }`}
            >
                {isAccepted ? (
                    <><CheckCircle2 className="h-4 w-4" /> Price Applied</>
                ) : (
                    <><IndianRupee className="h-4 w-4" /> Accept Recommended Price</>
                )}
            </Button>
        </div>
    );
}
