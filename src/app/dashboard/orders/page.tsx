'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import OrderCard from '@/components/OrderCard';
import { useAuth } from '@/lib/auth-context';
import {
    Package,
    Clock,
    Truck,
    IndianRupee,
    Loader2,
    Search,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: { id: string; title: string; imageUrl: string; category?: string };
}

interface Order {
    id: string;
    buyerName: string;
    buyerAddress: string;
    buyerPhone: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

interface Stats {
    newOrders: number;
    processing: number;
    shipped: number;
    totalRevenue: number;
}

type TabKey = 'new' | 'fulfill' | 'history';

const TAB_CONFIG: Record<TabKey, { label: string; statuses: string }> = {
    new: { label: 'New Orders', statuses: 'PENDING' },
    fulfill: { label: 'Orders to Fulfill', statuses: 'CONFIRMED,PROCESSING,SHIPPED' },
    history: { label: 'Order History', statuses: 'DELIVERED,CANCELLED' },
};

export default function OrdersPage() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>('new');
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<Stats>({ newOrders: 0, processing: 0, shipped: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // History filters
    const [historyStatus, setHistoryStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        try {
            const config = TAB_CONFIG[activeTab];
            let statusParam = config.statuses;
            if (activeTab === 'history' && historyStatus) {
                statusParam = historyStatus;
            }

            const params = new URLSearchParams({
                status: statusParam,
                page: page.toString(),
                limit: '10',
            });
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);

            const res = await fetch(`/api/orders/artisan?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();

            setOrders(data.orders);
            setStats(data.stats);
            setTotalPages(data.pagination.totalPages || 1);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    }, [token, activeTab, page, historyStatus, dateFrom, dateTo]);

    // Initial + tab change fetch
    useEffect(() => {
        setLoading(true);
        setPage(1);
    }, [activeTab, historyStatus, dateFrom, dateTo]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Polling every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchOrders();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        if (!token) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update');
            }
            // Refresh
            setRefreshKey(k => k + 1);
        } catch (err) {
            console.error('Status update error:', err);
        } finally {
            setUpdating(false);
        }
    };

    // Filter orders by search
    const filteredOrders = searchQuery
        ? orders.filter(o =>
            o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.items.some(i => i.product.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            o.id.includes(searchQuery)
        )
        : orders;

    const statWidgets = [
        { label: 'New Orders', value: stats.newOrders, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Processing', value: stats.processing, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Shipped', value: stats.shipped, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Track and manage your artisan orders</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-lg"
                        onClick={() => setRefreshKey(k => k + 1)}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {statWidgets.map(w => {
                        const Icon = w.icon;
                        return (
                            <div key={w.label} className="bg-white rounded-xl border border-gray-100 p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 ${w.bg} rounded-lg flex items-center justify-center`}>
                                        <Icon className={`h-5 w-5 ${w.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">{w.label}</p>
                                        <p className={`text-xl font-bold ${w.color}`}>{w.value}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-4 w-fit">
                    {(Object.keys(TAB_CONFIG) as TabKey[]).map(key => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {TAB_CONFIG[key].label}
                            {key === 'new' && stats.newOrders > 0 && (
                                <span className="ml-2 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                                    {stats.newOrders}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search + History Filters */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search orders..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                    </div>

                    {activeTab === 'history' && (
                        <>
                            <select
                                value={historyStatus}
                                onChange={e => setHistoryStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                            >
                                <option value="">All History</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500 whitespace-nowrap">From</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={e => setDateFrom(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500 whitespace-nowrap">To</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={e => setDateTo(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                                />
                            </div>
                            {(dateFrom || dateTo) && (
                                <button
                                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                                    className="text-xs text-orange-600 hover:text-orange-700 font-medium whitespace-nowrap"
                                >
                                    Clear dates
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No orders found</h3>
                        <p className="text-sm text-gray-500">
                            {activeTab === 'new'
                                ? 'No new orders at the moment. Check back soon!'
                                : activeTab === 'fulfill'
                                    ? 'No orders to fulfill right now.'
                                    : 'No order history yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onStatusUpdate={handleStatusUpdate}
                                updating={updating}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="rounded-lg"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="rounded-lg"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
