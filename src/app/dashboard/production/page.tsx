'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardSidebar from '@/components/DashboardSidebar';
import ProductionInsightsCard from '@/components/ProductionInsightsCard';
import RecommendedProductCard from '@/components/RecommendedProductCard';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Factory } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface RecommendedProduct {
    productType: string;
    estimatedDemand: string;
    suggestedQuantity: number;
    targetMarkets: string[];
    reasonForRecommendation: string;
}

interface PlanData {
    recommendedProducts: RecommendedProduct[];
    demandSignals: string[];
    productionStrategy: string;
    confidenceScore: number;
}

const DEMAND_COLORS: Record<string, string> = {
    High: '#10b981',
    Medium: '#f59e0b',
    Low: '#ef4444',
};

export default function ProductionPage() {
    const { token } = useAuth();
    const [plan, setPlan] = useState<PlanData | null>(null);
    const [insightId, setInsightId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [artisanInfo, setArtisanInfo] = useState<{
        craftType: string;
        experienceYears: number;
        productionCapacity: number;
    } | null>(null);
    const [productStatuses, setProductStatuses] = useState<Record<number, string>>({});

    // Fetch artisan profile
    useEffect(() => {
        if (!token) return;
        fetch('/api/artisan/profile', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data.profile) {
                    setArtisanInfo({
                        craftType: data.profile.craftType,
                        experienceYears: data.profile.experienceYears,
                        productionCapacity: data.profile.productionCapacity || 50,
                    });
                }
            })
            .catch(console.error);
    }, [token]);

    const generatePlan = useCallback(async () => {
        if (!token || !artisanInfo) return;
        setLoading(true);
        setPlan(null);
        setProductStatuses({});

        try {
            const res = await fetch('/api/ai/production-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(artisanInfo),
            });

            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setPlan(data.plan);
            setInsightId(data.insightId);

            // Initialize all as "new"
            const initial: Record<number, string> = {};
            data.plan.recommendedProducts.forEach((_: RecommendedProduct, i: number) => {
                initial[i] = 'new';
            });
            setProductStatuses(initial);
        } catch (err) {
            console.error('Plan generation failed:', err);
        } finally {
            setLoading(false);
        }
    }, [token, artisanInfo]);

    // Auto-generate on artisan info load
    useEffect(() => {
        if (artisanInfo && !plan && !loading) {
            generatePlan();
        }
    }, [artisanInfo, plan, loading, generatePlan]);

    const updateProductStatus = async (index: number, status: string) => {
        setProductStatuses(prev => ({ ...prev, [index]: status }));

        if (insightId && token) {
            try {
                await fetch('/api/ai/production-plan', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ insightId, status }),
                });
            } catch (err) {
                console.error('Status update failed:', err);
            }
        }
    };

    // Chart data
    const chartData = plan?.recommendedProducts.map(p => ({
        name: p.productType.length > 20 ? p.productType.substring(0, 20) + '...' : p.productType,
        quantity: p.suggestedQuantity,
        demand: p.estimatedDemand,
    })) || [];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Factory className="h-8 w-8 text-indigo-500" />
                                Production Planning
                            </h1>
                            <p className="text-gray-500 mt-1">
                                AI-recommended products to produce based on market demand
                            </p>
                        </div>
                        <Button
                            onClick={generatePlan}
                            disabled={loading || !artisanInfo}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            {loading ? 'Analyzing...' : 'Refresh Plan'}
                        </Button>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="bg-white rounded-3xl p-16 border border-gray-100 text-center">
                            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Analyzing Market Demand...</h3>
                            <p className="text-gray-500 text-sm">
                                Studying trends, sales data, and global demand to plan your production
                            </p>
                        </div>
                    )}

                    {plan && !loading && (
                        <div className="space-y-8">
                            {/* Strategy + Signals */}
                            <ProductionInsightsCard
                                strategy={plan.productionStrategy}
                                demandSignals={plan.demandSignals}
                                confidenceScore={plan.confidenceScore}
                            />

                            {/* Recharts Bar Chart */}
                            <div className="bg-white rounded-3xl p-8 border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">
                                    📊 Recommended Production Volume
                                </h2>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={160}
                                            tick={{ fontSize: 11, fill: '#4b5563' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid #e5e7eb',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                padding: '12px',
                                            }}
                                            content={({ active, payload }) => {
                                                if (!active || !payload || !payload.length) return null;
                                                const item = payload[0].payload;
                                                return (
                                                    <div style={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '12px', background: '#fff' }}>
                                                        <p style={{ fontWeight: 700, marginBottom: 4 }}>{item.name}</p>
                                                        <p style={{ fontSize: 13, color: '#6b7280' }}>{item.demand} Demand • {item.quantity} units</p>
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Bar dataKey="quantity" radius={[0, 8, 8, 0]} barSize={28}>
                                            {chartData.map((entry, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={DEMAND_COLORS[entry.demand] || DEMAND_COLORS.Medium}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Product Cards */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    🛠️ Recommended Products
                                </h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {plan.recommendedProducts.map((product, i) => (
                                        <RecommendedProductCard
                                            key={i}
                                            product={product}
                                            index={i}
                                            status={productStatuses[i] || 'new'}
                                            onPlan={() => updateProductStatus(i, 'planned')}
                                            onIgnore={() => updateProductStatus(i, 'ignored')}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No artisan info */}
                    {!artisanInfo && !loading && (
                        <div className="bg-white rounded-3xl p-16 border border-gray-100 text-center">
                            <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-500">Complete Your Profile</h3>
                            <p className="text-gray-400 text-sm mt-2">
                                We need your craft type and production details to generate a plan.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
