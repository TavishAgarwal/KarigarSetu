'use client';

import { Check } from 'lucide-react';

const STEPS = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
];

const STATUS_ORDER: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    CANCELLED: -1,
};

export default function OrderTimeline({ status }: { status: string }) {
    const currentIndex = STATUS_ORDER[status] ?? 0;
    const isCancelled = status === 'CANCELLED';

    if (isCancelled) {
        return (
            <div className="flex items-center gap-2 text-sm text-red-600">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xs font-bold">✕</span>
                </div>
                Order Cancelled
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 w-full">
            {STEPS.map((step, index) => {
                const completed = index <= currentIndex;
                const isCurrent = index === currentIndex;
                return (
                    <div key={step.key} className="flex items-center flex-1 min-w-0">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${completed
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-400'
                                    } ${isCurrent ? 'ring-2 ring-orange-200 ring-offset-1' : ''}`}
                            >
                                {completed && index < currentIndex ? (
                                    <Check className="h-3 w-3" />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span className={`text-[10px] mt-1 whitespace-nowrap ${completed ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 mt-[-12px] ${index < currentIndex ? 'bg-orange-500' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
