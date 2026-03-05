'use client';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
    CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmed' },
    PROCESSING: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Processing' },
    SHIPPED: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Shipped' },
    DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', label: 'Delivered' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
};

export default function OrderStatusBadge({ status }: { status: string }) {
    const style = STATUS_STYLES[status] || STATUS_STYLES.PENDING;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text-', 'bg-')}`} />
            {style.label}
        </span>
    );
}
