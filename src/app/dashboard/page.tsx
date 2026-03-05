'use client';

import { useAuth } from '@/lib/auth-context';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardSidebar from '@/components/DashboardSidebar';
import StatsCard from '@/components/StatsCard';
import OfflineQueueStatus from '@/components/OfflineQueueStatus';
import { Button, buttonVariants } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import {
    TrendingUp,
    Eye,
    Mail,
    Sparkles,
    FileEdit,
    Plus,
    Shield,
    Loader2,
    Package,
} from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const {
        profile,
        stats,
        trendInsight,
        loading,
        trendLoading,
        tips,
        weeklyData,
        maxVal,
        totalProducts,
        totalRevenue,
    } = useDashboardData();

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 p-8 overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Store Performance</h1>
                        <p className="text-gray-500 mt-1">
                            Welcome back, {user?.name || 'Artisan'}.{' '}
                            {totalProducts > 0
                                ? 'Your loom is busy today!'
                                : 'Get started by creating your first listing!'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/onboarding?edit=true" className={buttonVariants({ variant: "outline", className: "hidden md:flex gap-2 rounded-xl" })}>
                            <FileEdit className="h-4 w-4" /> Edit Registration
                        </Link>
                        <Link href="/dashboard/ai-generator" className={buttonVariants({ className: "bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2" })}>
                            <Plus className="h-4 w-4" /> New Listing
                        </Link>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid sm:grid-cols-3 gap-4">
                            <StatsCard
                                icon={<TrendingUp className="h-5 w-5" />}
                                label="Total Revenue"
                                value={`₹${totalRevenue.toLocaleString('en-IN')}`}
                                change={totalProducts > 0 ? `${totalProducts} products` : '—'}
                                changeColor="green"
                            />
                            <StatsCard
                                icon={<Package className="h-5 w-5" />}
                                label="Total Products"
                                value={String(totalProducts)}
                                change={stats?.totalStock ? `${stats.totalStock} in stock` : '—'}
                                changeColor="green"
                            />
                            <StatsCard
                                icon={<Eye className="h-5 w-5" />}
                                label="Avg. Price"
                                value={totalProducts > 0 ? `₹${Math.round(totalRevenue / totalProducts).toLocaleString('en-IN')}` : '₹0'}
                                change={totalProducts > 0 ? 'per product' : '—'}
                                changeColor="green"
                            />
                        </div>

                        {/* Weekly Chart */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Weekly Activity</h2>
                                <span className="text-sm text-gray-500 px-3 py-1 bg-gray-50 rounded-lg">Last 7 Days</span>
                            </div>
                            {weeklyData.every((v) => v === 0) ? (
                                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                                    No activity this week. Create a listing to get started!
                                </div>
                            ) : (
                                <div className="h-48 flex items-end gap-1">
                                    {weeklyData.map((val, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full relative">
                                                <div
                                                    className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg transition-all"
                                                    style={{ height: `${Math.max((val / maxVal) * 150, val > 0 ? 8 : 0)}px` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">{days[i]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Current Listings */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Current Listings</h2>
                                <Link href="/dashboard/products" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                                    View All
                                </Link>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-gray-100">
                                            <div className="aspect-[4/3] bg-gray-200" />
                                            <div className="p-4 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))
                                ) : profile?.products?.length === 0 ? (
                                    <div className="col-span-3 bg-white rounded-2xl p-12 border border-gray-100 text-center">
                                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package className="h-7 w-7 text-orange-400" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">No products yet</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Start by uploading your first craft to the global marketplace.
                                        </p>
                                        <Link href="/dashboard/ai-generator" className={buttonVariants({ className: "bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2" })}>
                                            <Plus className="h-4 w-4" /> Create First Listing
                                        </Link>
                                    </div>
                                ) : profile?.products?.slice(0, 3).map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.id}`}
                                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all group"
                                    >
                                        <div className="relative aspect-[4/3]">
                                            <Image
                                                src={product.imageUrl}
                                                alt={product.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="33vw"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-orange-600">
                                                {product.title}
                                            </h3>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-orange-600 font-bold">
                                                    ₹{product.price.toLocaleString('en-IN')}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 5
                                                    ? 'bg-green-50 text-green-600'
                                                    : 'bg-orange-50 text-orange-600'
                                                    }`}>
                                                    {product.stock} in stock
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Offline Queue Status */}
                        <OfflineQueueStatus />
                        {/* AI Marketing Assistant */}
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-orange-100">
                                    AI Marketing Assistant
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Grow your reach</h3>
                            <p className="text-orange-100 text-sm leading-relaxed mb-4">
                                {totalProducts > 0
                                    ? `You have ${totalProducts} product${totalProducts > 1 ? 's' : ''} listed. Use AI to optimize descriptions and boost sales.`
                                    : 'Create your first AI-powered listing and reach buyers worldwide.'}
                            </p>
                            <Link href="/dashboard/ai-generator" className={buttonVariants({ className: "bg-white text-orange-600 hover:bg-orange-50 font-semibold rounded-xl w-full" })}>
                                {totalProducts > 0 ? 'Optimize Listings' : 'Create First Listing'}
                            </Link>
                        </div>

                        {/* AI Trend Insights Widget */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                    AI Trend Insights
                                </span>
                            </div>
                            {trendLoading ? (
                                <div className="flex items-center gap-2 py-6 justify-center">
                                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                    <span className="text-sm text-blue-600">Analyzing trends...</span>
                                </div>
                            ) : trendInsight ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-700 leading-relaxed">{trendInsight.trendSummary}</p>
                                    <div>
                                        <p className="text-xs font-semibold text-blue-600 mb-1.5">Trending Styles</p>
                                        <div className="flex flex-wrap gap-1">
                                            {trendInsight.recommendedStyles.slice(0, 3).map((s, i) => (
                                                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-blue-600 mb-1.5">Hot Colors</p>
                                        <div className="flex flex-wrap gap-1">
                                            {trendInsight.recommendedColors.slice(0, 4).map((c, i) => (
                                                <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <Link href="/dashboard/trends" className="text-blue-600 text-sm font-medium hover:text-blue-700 inline-block mt-1">
                                        View Full Insights →
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 py-4 text-center">Trend data unavailable</p>
                            )}
                        </div>

                        {/* Authenticity Status Widget */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Shield className="h-4 w-4 text-green-600" />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
                                    Authenticity Status
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">{totalProducts}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Products Listed</p>
                                        <p className="text-xs text-gray-500">
                                            {totalProducts > 0
                                                ? `${stats?.totalStock || 0} total items in stock`
                                                : 'No products yet'}
                                        </p>
                                    </div>
                                </div>
                                {totalProducts > 0 && (
                                    <div className="w-full bg-green-100 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                )}
                                <p className="text-xs text-gray-500">
                                    New products are automatically verified by AI during listing creation.
                                </p>
                            </div>
                        </div>

                        {/* Dynamic Artisan Tips */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                                Artisan Tips
                            </h3>
                            <div className="space-y-4">
                                {tips.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        {tip.done ? (
                                            <div className="w-5 h-5 rounded-full bg-green-500 mt-0.5 shrink-0 flex items-center justify-center">
                                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-orange-300 mt-0.5 shrink-0" />
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${tip.done ? 'text-green-600' : 'text-gray-900'}`}>
                                                {tip.text}
                                            </p>
                                            <p className="text-xs text-gray-500">{tip.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Link href="/dashboard/ai-generator" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors group">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Sparkles className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">Create AI Listing</span>
                                </Link>
                                <Link href="/dashboard/products" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors group">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Package className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">Manage Products</span>
                                </Link>
                                <Link href="/dashboard/trends" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors group">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">View Trends</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
