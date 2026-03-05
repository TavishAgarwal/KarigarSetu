import { type ReactNode } from 'react';

interface ImpactStatCardProps {
    icon: ReactNode;
    value: string | number;
    label: string;
    gradient: string;
    iconBg: string;
}

export default function ImpactStatCard({
    icon,
    value,
    label,
    gradient,
    iconBg,
}: ImpactStatCardProps) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl p-6 ${gradient} border border-white/20 hover:shadow-lg transition-all duration-300 group`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-4xl font-bold text-gray-900 mb-1 group-hover:scale-105 transition-transform origin-left">
                        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
                    </p>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                </div>
                <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {icon}
                </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
        </div>
    );
}
