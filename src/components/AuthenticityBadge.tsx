'use client';

import { useState } from 'react';
import { Shield, CheckCircle2, AlertTriangle, XCircle, Loader2, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AuthenticityData {
    authenticityScore: number;
    handmadeSignals: string[];
    machineSignals: string[];
    verificationSummary: string;
}

interface AuthenticityBadgeProps {
    data?: AuthenticityData | null;
    compact?: boolean;
    productId?: string;
    imageUrl?: string;
    craftType?: string;
    token?: string;
}

function getScoreConfig(score: number) {
    if (score >= 80) return {
        label: 'Verified Handmade',
        color: 'from-emerald-400 to-green-500',
        bgColor: 'from-emerald-50 to-green-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        badgeBg: 'bg-emerald-100 text-emerald-700',
        icon: CheckCircle2,
    };
    if (score >= 50) return {
        label: 'Likely Handmade',
        color: 'from-amber-400 to-yellow-500',
        bgColor: 'from-amber-50 to-yellow-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        badgeBg: 'bg-amber-100 text-amber-700',
        icon: AlertTriangle,
    };
    return {
        label: 'Unverified',
        color: 'from-red-400 to-rose-500',
        bgColor: 'from-red-50 to-rose-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        badgeBg: 'bg-red-100 text-red-700',
        icon: XCircle,
    };
}

// Compact badge for product cards (dashboard)
export function CompactAuthBadge({ score }: { score: number }) {
    const config = getScoreConfig(score);
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${config.badgeBg}`}>
            <config.icon className="h-3 w-3" />
            {config.label} • {score}%
        </span>
    );
}

// Full authenticity card for product detail page
export default function AuthenticityBadge({ data, compact, productId, imageUrl, craftType, token }: AuthenticityBadgeProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AuthenticityData | null>(data || null);
    const [error, setError] = useState('');

    const runAuthentication = async () => {
        if (!token || !imageUrl || !craftType) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/ai/authenticate-handmade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ imageUrl, craftType, productId }),
            });

            if (!res.ok) throw new Error('Authentication failed');
            const data = await res.json();
            setResult(data.authenticity);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        } finally {
            setLoading(false);
        }
    };

    // Compact mode — just show badge
    if (compact && result) {
        return <CompactAuthBadge score={result.authenticityScore} />;
    }

    // No data and no way to fetch — show placeholder
    if (!result && !token) {
        return null;
    }

    // Loading state
    if (loading) {
        return (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Analyzing Craft Authenticity...</h2>
                        <p className="text-sm text-gray-500">AI is scanning for handmade indicators</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-16 bg-emerald-100/50 rounded-2xl animate-pulse" />
                    <div className="h-12 bg-emerald-100/50 rounded-2xl animate-pulse w-3/4" />
                </div>
            </div>
        );
    }

    // Not yet analyzed — show CTA
    if (!result) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl p-8 border border-gray-200 text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Fingerprint className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Craft Authenticity Verification</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                    Use AI to verify if this craft is genuinely handmade by analyzing material textures, tool marks, and imperfection patterns.
                </p>
                {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
                <Button
                    onClick={runAuthentication}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2 px-6"
                >
                    <Shield className="h-4 w-4" /> Verify Authenticity
                </Button>
            </div>
        );
    }

    // Full result display
    const config = getScoreConfig(result.authenticityScore);
    const ScoreIcon = config.icon;

    return (
        <div className={`bg-gradient-to-br ${config.bgColor} rounded-3xl p-8 border ${config.borderColor}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">Craft Authenticity Verification</h2>
                    <p className="text-sm text-gray-500">AI-powered handmade detection</p>
                </div>
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.color} flex flex-col items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-bold text-white">{result.authenticityScore}</span>
                    <span className="text-[10px] text-white/80 font-medium uppercase">Score</span>
                </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-6">
                <ScoreIcon className={`h-5 w-5 ${config.textColor}`} />
                <span className={`font-bold text-lg ${config.textColor}`}>{config.label}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Handmade Signals */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Handmade Signals
                    </h3>
                    <div className="space-y-2">
                        {result.handmadeSignals.map((signal, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-emerald-500 mt-0.5">✓</span>
                                {signal}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Machine Signals */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5" /> Machine Indicators
                    </h3>
                    {result.machineSignals.length > 0 ? (
                        <div className="space-y-2">
                            {result.machineSignals.map((signal, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-red-400 mt-0.5">✗</span>
                                    {signal}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No machine-made indicators detected</p>
                    )}
                </div>
            </div>

            {/* Verification Summary */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 mt-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Verification Summary</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{result.verificationSummary}</p>
            </div>
        </div>
    );
}
