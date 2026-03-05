'use client';

import Image from 'next/image';
import OrderStatusBadge from './OrderStatusBadge';
import OrderTimeline from './OrderTimeline';
import { Button } from '@/components/ui/button';
import { Calendar, User, MapPin } from 'lucide-react';

interface OrderItemData {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        title: string;
        imageUrl: string;
        category?: string;
    };
}

interface OrderData {
    id: string;
    buyerName: string;
    buyerAddress: string;
    buyerPhone: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: OrderItemData[];
}

interface OrderCardProps {
    order: OrderData;
    onStatusUpdate?: (orderId: string, newStatus: string) => void;
    updating?: boolean;
}

// Map status to available actions
const STATUS_ACTIONS: Record<string, { label: string; next: string; variant: 'default' | 'outline' }[]> = {
    PENDING: [
        { label: 'Confirm Order', next: 'CONFIRMED', variant: 'default' },
        { label: 'Reject', next: 'CANCELLED', variant: 'outline' },
    ],
    CONFIRMED: [
        { label: 'Start Processing', next: 'PROCESSING', variant: 'default' },
    ],
    PROCESSING: [
        { label: 'Mark as Shipped', next: 'SHIPPED', variant: 'default' },
    ],
    SHIPPED: [
        { label: 'Mark as Delivered', next: 'DELIVERED', variant: 'default' },
    ],
};

export default function OrderCard({ order, onStatusUpdate, updating }: OrderCardProps) {
    const actions = STATUS_ACTIONS[order.status] || [];
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {orderDate}
                    </div>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400 font-mono">#{order.id.slice(-8)}</span>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            {/* Buyer Info */}
            <div className="px-4 pt-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-medium">{order.buyerName || 'Buyer'}</span>
                </div>
                {order.buyerAddress && (
                    <div className="flex items-center gap-1.5 text-gray-400 truncate">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{order.buyerAddress}</span>
                    </div>
                )}
            </div>

            {/* Items */}
            <div className="p-4 space-y-3">
                {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                                src={item.product.imageUrl}
                                alt={item.product.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.product.title}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                            ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                        </p>
                    </div>
                ))}
            </div>

            {/* Timeline */}
            {order.status !== 'CANCELLED' && (
                <div className="px-4 pb-3">
                    <OrderTimeline status={order.status} />
                </div>
            )}

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div>
                    <span className="text-xs text-gray-500">Total</span>
                    <p className="text-lg font-bold text-orange-600">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                {actions.length > 0 && onStatusUpdate && (
                    <div className="flex items-center gap-2">
                        {actions.map(action => (
                            <Button
                                key={action.next}
                                size="sm"
                                variant={action.variant}
                                disabled={updating}
                                onClick={() => onStatusUpdate(order.id, action.next)}
                                className={action.variant === 'default'
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs'
                                    : action.next === 'CANCELLED'
                                        ? 'border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-xs'
                                        : 'rounded-lg text-xs'
                                }
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
