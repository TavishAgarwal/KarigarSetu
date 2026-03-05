'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
    IndianRupee,
    TrendingUp,
    ShoppingBag,
    Package,
    Loader2,
    BarChart3,
} from 'lucide-react';

interface Product {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    category: string;
    stock: number;
}

interface MonthlyData {
    month: string;
    revenue: number;
}

export default function SalesPage() {
    const { token } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        Promise.all([
            fetch('/api/artisan/profile', {
                headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
            fetch('/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
        ])
            .then(([profileData, statsData]) => {
                if (profileData.profile?.products) setProducts(profileData.profile.products);
                if (statsData.monthlyData) setMonthlyData(statsData.monthlyData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const totalRevenue = products.reduce((sum, p) => sum + p.price, 0);
    const totalProducts = products.length;
    const avgPrice = totalProducts > 0 ? Math.round(totalRevenue / totalProducts) : 0;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const maxRevenue = Math.max(...monthlyData.map((s) => s.revenue), 1);

    const topProducts = [...products]
        .sort((a, b) => b.price - a.price)
        .slice(0, 5);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Sales & Revenue</h1>
                        <p className="text-gray-500 mt-1">Track your listings, revenue, and top-performing crafts</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Stats Row */}
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[
                                    {
                                        icon: <IndianRupee className="h-5 w-5" />,
                                        label: 'Total Listing Value',
                                        value: `₹${totalRevenue.toLocaleString('en-IN')}`,
                                        sub: `${totalProducts} product${totalProducts !== 1 ? 's' : ''} listed`,
                                        color: 'bg-green-50 text-green-600',
                                        iconBg: 'bg-green-100',
                                    },
                                    {
                                        icon: <ShoppingBag className="h-5 w-5" />,
                                        label: 'Total Products',
                                        value: String(totalProducts),
                                        sub: totalProducts > 0 ? `${totalStock} items in stock` : 'No products yet',
                                        color: 'bg-blue-50 text-blue-600',
                                        iconBg: 'bg-blue-100',
                                    },
                                    {
                                        icon: <TrendingUp className="h-5 w-5" />,
                                        label: 'Avg. Product Price',
                                        value: `₹${avgPrice.toLocaleString('en-IN')}`,
                                        sub: totalProducts > 0 ? 'across all listings' : '—',
                                        color: 'bg-purple-50 text-purple-600',
                                        iconBg: 'bg-purple-100',
                                    },
                                    {
                                        icon: <Package className="h-5 w-5" />,
                                        label: 'Total Stock',
                                        value: String(totalStock),
                                        sub: totalProducts > 0 ? `avg ${Math.round(totalStock / totalProducts)} per product` : '—',
                                        color: 'bg-orange-50 text-orange-600',
                                        iconBg: 'bg-orange-100',
                                    },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                                                <div className={stat.color.split(' ')[1]}>{stat.icon}</div>
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                                        <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Revenue Chart */}
                                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-gray-900">Monthly Listing Value</h2>
                                        <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">Last 7 months</span>
                                    </div>
                                    {monthlyData.every((s) => s.revenue === 0) ? (
                                        <div className="h-56 flex flex-col items-center justify-center text-gray-400">
                                            <BarChart3 className="h-12 w-12 text-gray-200 mb-3" />
                                            <p className="text-sm">No revenue data yet</p>
                                            <p className="text-xs mt-1">Start listing products to see your monthly breakdown</p>
                                        </div>
                                    ) : (
                                        <div className="h-56 flex items-end gap-2">
                                            {monthlyData.map((sale, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {sale.revenue > 0 ? `₹${(sale.revenue / 1000).toFixed(1)}k` : ''}
                                                    </span>
                                                    <div className="w-full relative">
                                                        <div
                                                            className={`w-full rounded-t-lg transition-all ${i === monthlyData.length - 1
                                                                ? 'bg-gradient-to-t from-orange-600 to-orange-400'
                                                                : 'bg-gradient-to-t from-orange-300 to-orange-200'
                                                                }`}
                                                            style={{ height: `${Math.max((sale.revenue / maxRevenue) * 180, sale.revenue > 0 ? 8 : 0)}px` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-medium">{sale.month}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Top Products */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top Products</h2>
                                    {topProducts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <Package className="h-10 w-10 text-gray-200 mb-3" />
                                            <p className="text-gray-500 text-sm">No products yet</p>
                                            <p className="text-gray-400 text-xs mt-1">Create your first listing to see it here</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {topProducts.map((product, i) => (
                                                <div key={product.id} className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-orange-500 text-white' :
                                                        i === 1 ? 'bg-orange-200 text-orange-800' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {i + 1}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {product.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{product.category}</p>
                                                    </div>
                                                    <span className="text-sm font-bold text-orange-600 whitespace-nowrap">
                                                        ₹{product.price.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Orders Section — No order system yet */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 mt-6 text-center">
                                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag className="h-7 w-7 text-orange-400" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Order Tracking Coming Soon</h3>
                                <p className="text-sm text-gray-500 max-w-md mx-auto">
                                    Once buyers start placing orders through the marketplace, your order history and analytics will appear here.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
