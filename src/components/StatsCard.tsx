'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
    icon: ReactNode;
    label: string;
    value: string;
    change?: string;
    changeColor?: 'green' | 'orange' | 'red';
    badge?: string;
}

export default function StatsCard({
    icon,
    label,
    value,
    change,
    changeColor = 'green',
    badge,
}: StatsCardProps) {
    const changeColors = {
        green: 'text-green-600 bg-green-50',
        orange: 'text-orange-600 bg-orange-50',
        red: 'text-red-600 bg-red-50',
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                    {icon}
                </div>
                {change && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${changeColors[changeColor]}`}>
                        {change}
                    </span>
                )}
                {badge && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full text-orange-600 bg-orange-50">
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}
