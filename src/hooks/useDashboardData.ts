'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface DashboardProduct {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    stock: number;
}

interface DashboardProfile {
    id: string;
    craftType: string;
    products: DashboardProduct[];
}

interface DashboardStats {
    totalProducts: number;
    totalRevenue: number;
    totalStock: number;
    weeklyData: number[];
    monthlyData: { month: string; revenue: number }[];
}

interface TrendInsight {
    trendSummary: string;
    recommendedStyles: string[];
    recommendedColors: string[];
    targetMarkets: string[];
}

interface ArtisanTip {
    text: string;
    sub: string;
    done: boolean;
}

export interface DashboardData {
    profile: DashboardProfile | null;
    stats: DashboardStats | null;
    trendInsight: TrendInsight | null;
    loading: boolean;
    trendLoading: boolean;
    tips: ArtisanTip[];
    weeklyData: number[];
    maxVal: number;
    totalProducts: number;
    totalRevenue: number;
}

/**
 * Custom hook that encapsulates all dashboard data fetching, AI trend insights,
 * and artisan tip generation logic.
 */
export function useDashboardData(): DashboardData {
    const { token } = useAuth();
    const [profile, setProfile] = useState<DashboardProfile | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [trendInsight, setTrendInsight] = useState<TrendInsight | null>(null);
    const [loading, setLoading] = useState(true);
    const [trendLoading, setTrendLoading] = useState(false);

    useEffect(() => {
        if (!token) return;

        // Fetch profile and stats in parallel
        Promise.all([
            fetch('/api/artisan/profile', {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json()),
            fetch('/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json()),
        ])
            .then(([profileData, statsData]) => {
                if (profileData.profile) {
                    setProfile(profileData.profile);
                    // Fetch trend insights for artisan's craft type
                    const craftType = profileData.profile.craftType || 'Crafts';
                    setTrendLoading(true);
                    fetch('/api/ai/craft-trends', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ craftType }),
                    })
                        .then((r) => r.json())
                        .then((d) => { if (d.prediction) setTrendInsight(d.prediction); })
                        .catch(console.error)
                        .finally(() => setTrendLoading(false));
                }
                setStats(statsData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    // Derived values
    const weeklyData = stats?.weeklyData || [0, 0, 0, 0, 0, 0, 0];
    const maxVal = Math.max(...weeklyData, 1);
    const totalProducts = stats?.totalProducts || 0;
    const totalRevenue = stats?.totalRevenue || 0;

    // Dynamic artisan tips based on actual data
    const tips: ArtisanTip[] = [];
    if (totalProducts === 0) {
        tips.push({ text: 'Create your first product listing', sub: 'Use AI Generator to get started quickly.', done: false });
    }
    if (totalProducts > 0 && totalProducts < 5) {
        tips.push({ text: `Add more products (${totalProducts} listed)`, sub: 'Shops with 5+ listings get 3x more views.', done: false });
    }
    if (profile && !profile.craftType) {
        tips.push({ text: 'Complete your craft profile', sub: 'Help buyers find you by specifying your craft type.', done: false });
    }
    if (totalProducts >= 5) {
        tips.push({ text: 'Great product catalog!', sub: `${totalProducts} products listed. Keep going!`, done: true });
    }
    if (tips.length === 0) {
        tips.push({ text: 'You\'re all set!', sub: 'Your store is looking great.', done: true });
    }

    return {
        profile,
        stats,
        trendInsight,
        loading,
        trendLoading,
        tips,
        weeklyData,
        maxVal,
        totalProducts,
        totalRevenue,
    };
}
