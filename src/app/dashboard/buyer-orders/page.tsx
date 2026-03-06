'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronDown, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        title: string;
        imageUrl: string;
        category: string;
    };
}

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    buyerName: string;
    buyerAddress: string;
    createdAt: string;
    items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2, label: 'Confirmed' },
    PROCESSING: { color: 'bg-indigo-100 text-indigo-800', icon: Loader2, label: 'Processing' },
    SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'Shipped' },
    DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Delivered' },
    CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
};

export default function BuyerOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('limit', '10');
            if (statusFilter) params.set('status', statusFilter);

            const res = await fetch(`/api/orders?${params}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => {
        if (user) fetchOrders();
    }, [user, fetchOrders]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <Package className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                            <p className="text-gray-500 text-sm">Track your purchases</p>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">All Orders</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">No orders found</h3>
                        <p className="text-gray-400 text-sm mt-1">Your order history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                            const StatusIcon = statusCfg.icon;

                            return (
                                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-xs text-gray-400 font-mono">Order #{order.id.slice(0, 8)}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {statusCfg.label}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <Image
                                                        src={item.product.imageUrl || '/products/placeholder.webp'}
                                                        alt={item.product.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{item.product.title}</p>
                                                    <p className="text-xs text-gray-400">{item.product.category} · Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-gray-900 text-sm">₹{item.price.toLocaleString('en-IN')}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-400">Shipping to: {order.buyerAddress || 'N/A'}</p>
                                        <p className="font-bold text-orange-600">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="px-4 py-2 text-sm rounded-xl bg-white border border-gray-200 disabled:opacity-50 hover:bg-orange-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-500">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="px-4 py-2 text-sm rounded-xl bg-white border border-gray-200 disabled:opacity-50 hover:bg-orange-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
