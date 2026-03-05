'use client';

import { TrendingUp, Target, Lightbulb, BarChart3 } from 'lucide-react';

interface ProductionInsightsCardProps {
    strategy: string;
    demandSignals: string[];
    confidenceScore: number;
}

export default function ProductionInsightsCard({ strategy, demandSignals, confidenceScore }: ProductionInsightsCardProps) {
    const confidenceColor = confidenceScore >= 75 ? 'from-emerald-400 to-green-500' :
        confidenceScore >= 50 ? 'from-amber-400 to-yellow-500' : 'from-red-400 to-rose-500';

    return (
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-indigo-100">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">Next Month Production Strategy</h2>
                    <p className="text-sm text-gray-500">AI-powered production recommendations</p>
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${confidenceColor} flex flex-col items-center justify-center shadow-lg`}>
                    <span className="text-xl font-bold text-white">{confidenceScore}</span>
                    <span className="text-[9px] text-white/80 font-medium uppercase">Conf</span>
                </div>
            </div>

            {/* Strategy */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 mb-4">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" /> Production Strategy
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{strategy}</p>
            </div>

            {/* Demand Signals */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5" /> Market Demand Signals
                </h3>
                <div className="space-y-2">
                    {demandSignals.map((signal, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <TrendingUp className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                            {signal}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
