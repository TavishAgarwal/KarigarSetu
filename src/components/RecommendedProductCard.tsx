'use client';

import { CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecommendedProduct {
    productType: string;
    estimatedDemand: string;
    suggestedQuantity: number;
    targetMarkets: string[];
    reasonForRecommendation: string;
}

interface RecommendedProductCardProps {
    product: RecommendedProduct;
    index: number;
    onPlan?: () => void;
    onIgnore?: () => void;
    status?: string;
}

const demandConfig: Record<string, { color: string; bg: string; icon: string }> = {
    High: { color: 'text-emerald-700', bg: 'bg-emerald-100', icon: '🔥' },
    Medium: { color: 'text-amber-700', bg: 'bg-amber-100', icon: '📊' },
    Low: { color: 'text-gray-600', bg: 'bg-gray-100', icon: '📉' },
};

export default function RecommendedProductCard({ product, index, onPlan, onIgnore, status }: RecommendedProductCardProps) {
    const demand = demandConfig[product.estimatedDemand] || demandConfig.Medium;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all overflow-hidden">
            {/* Header */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {index + 1}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">{product.productType}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${demand.bg} ${demand.color}`}>
                                    {demand.icon} {product.estimatedDemand} Demand
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-orange-600">{product.suggestedQuantity}</span>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">Units</p>
                    </div>
                </div>

                {/* Reason */}
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    {product.reasonForRecommendation}
                </p>

                {/* Markets */}
                <div className="flex items-center gap-1.5 mt-3">
                    <Target className="h-3 w-3 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                        {product.targetMarkets.map((m, i) => (
                            <span key={i} className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                {m}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                {status === 'new' && onPlan && onIgnore && (
                    <div className="flex gap-2 mt-4">
                        <Button
                            onClick={onPlan}
                            size="sm"
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-1.5 text-xs h-9"
                        >
                            <CheckCircle className="h-3.5 w-3.5" /> Plan This
                        </Button>
                        <Button
                            onClick={onIgnore}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 rounded-xl gap-1.5 text-xs h-9"
                        >
                            <XCircle className="h-3.5 w-3.5" /> Skip
                        </Button>
                    </div>
                )}
                {status === 'planned' && (
                    <div className="flex items-center gap-1.5 mt-4 text-emerald-600 text-xs font-medium">
                        <CheckCircle className="h-3.5 w-3.5" /> Marked as Planned
                    </div>
                )}
                {status === 'ignored' && (
                    <div className="flex items-center gap-1.5 mt-4 text-gray-400 text-xs font-medium">
                        <Clock className="h-3.5 w-3.5" /> Skipped
                    </div>
                )}
            </div>
        </div>
    );
}
