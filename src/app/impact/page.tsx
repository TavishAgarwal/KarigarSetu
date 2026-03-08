'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImpactStatCard from '@/components/ImpactStatCard';
import {
    Users,
    Package,
    ShoppingBag,
    MapPin,
    Palette,
    IndianRupee,
    Landmark,
    Heart,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface ImpactStats {
    totalArtisans: number;
    totalProducts: number;
    totalOrders: number;
    totalCraftTypes: number;
    statesRepresented: number;
    estimatedIncome: number;
    craftsPreserved: number;
    charts: {
        ordersByMonth: { month: string; orders: number; revenue: number }[];
        categoryDistribution: { name: string; value: number }[];
        artisansByState: { name: string; value: number }[];
    };
}

const PIE_COLORS = [
    '#f97316', '#fb923c', '#fdba74', '#fed7aa',
    '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
    '#fbbf24', '#f59e0b', '#d97706', '#b45309',
];

export default function ImpactPage() {
    const [stats, setStats] = useState<ImpactStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/impact-stats')
            .then((r) => r.json())
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero */}
            <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-rose-500 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
                        <Heart className="h-4 w-4" /> Real-World Impact
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">KarigarSetu Impact</h1>
                    <p className="text-orange-100 text-lg max-w-2xl mx-auto">
                        Every purchase on KarigarSetu directly supports artisan families,
                        preserves cultural heritage, and sustains centuries-old craft traditions.
                    </p>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="h-10 bg-gray-200 rounded w-1/3 mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : stats ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ImpactStatCard
                            icon={<Users className="h-6 w-6 text-orange-600" />}
                            value={stats.totalArtisans}
                            label="Artisans Onboarded"
                            gradient="bg-gradient-to-br from-orange-50 to-amber-50"
                            iconBg="bg-orange-100"
                        />
                        <ImpactStatCard
                            icon={<Package className="h-6 w-6 text-blue-600" />}
                            value={stats.totalProducts}
                            label="Products Listed"
                            gradient="bg-gradient-to-br from-blue-50 to-indigo-50"
                            iconBg="bg-blue-100"
                        />
                        <ImpactStatCard
                            icon={<ShoppingBag className="h-6 w-6 text-green-600" />}
                            value={stats.totalOrders}
                            label="Orders Completed"
                            gradient="bg-gradient-to-br from-green-50 to-emerald-50"
                            iconBg="bg-green-100"
                        />
                        <ImpactStatCard
                            icon={<Palette className="h-6 w-6 text-purple-600" />}
                            value={stats.totalCraftTypes}
                            label="Craft Traditions"
                            gradient="bg-gradient-to-br from-purple-50 to-pink-50"
                            iconBg="bg-purple-100"
                        />
                        <ImpactStatCard
                            icon={<MapPin className="h-6 w-6 text-rose-600" />}
                            value={stats.statesRepresented}
                            label="States Represented"
                            gradient="bg-gradient-to-br from-rose-50 to-red-50"
                            iconBg="bg-rose-100"
                        />
                        <ImpactStatCard
                            icon={<IndianRupee className="h-6 w-6 text-emerald-600" />}
                            value={stats.estimatedIncome > 0 ? `₹${stats.estimatedIncome.toLocaleString('en-IN')}` : '₹0'}
                            label="Estimated Artisan Income"
                            gradient="bg-gradient-to-br from-emerald-50 to-teal-50"
                            iconBg="bg-emerald-100"
                        />
                        <ImpactStatCard
                            icon={<Landmark className="h-6 w-6 text-amber-600" />}
                            value={stats.craftsPreserved}
                            label="Crafts Preserved"
                            gradient="bg-gradient-to-br from-amber-50 to-yellow-50"
                            iconBg="bg-amber-100"
                        />
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-12">Failed to load impact data.</p>
                )}
            </section>

            {/* Charts Section */}
            {stats && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Platform Analytics
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Orders Growth */}
                        {stats.charts.ordersByMonth.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Orders Over Time</h3>
                                <p className="text-sm text-gray-500 mb-6">Monthly order volume</p>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.charts.ordersByMonth}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid #e5e7eb',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                }}
                                            />
                                            <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} name="Orders" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Category Distribution */}
                        {stats.charts.categoryDistribution.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Craft Categories</h3>
                                <p className="text-sm text-gray-500 mb-6">Product distribution by category</p>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.charts.categoryDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={4}
                                                dataKey="value"
                                                label={({ name, percent }: { name?: string; percent?: number }) =>
                                                    `${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                                                }
                                            >
                                                {stats.charts.categoryDistribution.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Artisan Location Distribution */}
                        {stats.charts.artisansByState.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:col-span-2">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Artisan Locations</h3>
                                <p className="text-sm text-gray-500 mb-6">Geographic distribution of artisans</p>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.charts.artisansByState} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis type="number" tick={{ fontSize: 12 }} />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                tick={{ fontSize: 12 }}
                                                width={120}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid #e5e7eb',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                }}
                                            />
                                            <Bar
                                                dataKey="value"
                                                fill="#f97316"
                                                radius={[0, 6, 6, 0]}
                                                name="Artisans"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Empty state when no chart data */}
                        {stats.charts.ordersByMonth.length === 0 &&
                            stats.charts.categoryDistribution.length === 0 &&
                            stats.charts.artisansByState.length === 0 && (
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-12 text-center">
                                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Palette className="h-8 w-8 text-orange-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Charts Coming Soon</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        As artisans list more products and buyers place orders,
                                        detailed analytics and visualizations will appear here.
                                    </p>
                                </div>
                            )}
                    </div>
                </section>
            )}

            {/* Mission Statement */}
            <section className="bg-gradient-to-r from-orange-500 to-rose-500 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                    <p className="text-orange-100 text-lg leading-relaxed">
                        KarigarSetu bridges the gap between traditional Indian artisanship and the global market.
                        Every listing preserves a cultural legacy. Every purchase empowers an artisan family.
                        Together, we&apos;re building a future where heritage thrives in the digital age.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
