'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Region {
    region: string;
    country: string;
    demandLevel: string;
    popularStyles: string[];
    popularColors: string[];
    avgPrice: number;
}

interface CraftDemandMapProps {
    regions: Region[];
}

const DEMAND_COLORS: Record<string, string> = {
    High: '#22c55e',
    Medium: '#f59e0b',
    Low: '#ef4444',
};

const DEMAND_VALUE: Record<string, number> = {
    High: 90,
    Medium: 55,
    Low: 25,
};

const FLAG_EMOJI: Record<string, string> = {
    India: '🇮🇳',
    'United States': '🇺🇸',
    Japan: '🇯🇵',
    Germany: '🇩🇪',
    France: '🇫🇷',
    'United Kingdom': '🇬🇧',
    Australia: '🇦🇺',
    UAE: '🇦🇪',
};

export default function CraftDemandMap({ regions }: CraftDemandMapProps) {
    const chartData = regions.map((r) => ({
        country: r.country,
        demand: DEMAND_VALUE[r.demandLevel] || 50,
        demandLevel: r.demandLevel,
        avgPrice: r.avgPrice,
        flag: FLAG_EMOJI[r.country] || '🌍',
    }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                🌍 Global Demand Heatmap
            </h2>
            <p className="text-sm text-gray-500 mb-6">Demand intensity by country for your craft type</p>

            <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis
                            dataKey="country"
                            type="category"
                            width={120}
                            tick={{ fontSize: 13, fontWeight: 600, fill: '#374151' }}
                            tickFormatter={(val) => `${FLAG_EMOJI[val] || ''} ${val}`}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                padding: '12px',
                            }}
                            content={({ active, payload }) => {
                                if (!active || !payload || !payload.length) return null;
                                const item = payload[0].payload;
                                return (
                                    <div style={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '12px', background: '#fff' }}>
                                        <p style={{ fontWeight: 700, marginBottom: 4 }}>{item.flag} {item.country}</p>
                                        <p style={{ fontSize: 13, color: '#6b7280' }}>{item.demandLevel} Demand • Avg ₹{item.avgPrice.toLocaleString('en-IN')}</p>
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="demand" radius={[0, 8, 8, 0]} barSize={28}>
                            {chartData.map((entry, i) => (
                                <Cell key={i} fill={DEMAND_COLORS[entry.demandLevel] || '#94a3b8'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
                {['High', 'Medium', 'Low'].map((level) => (
                    <div key={level} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEMAND_COLORS[level] }} />
                        {level} Demand
                    </div>
                ))}
            </div>
        </div>
    );
}
