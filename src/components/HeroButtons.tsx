'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function HeroButtons() {
    const { user, token } = useAuth();
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);

    // Check if artisan has a completed profile
    useEffect(() => {
        if (user?.role === 'artisan' && token) {
            fetch('/api/artisan/profile', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((r) => {
                    setHasProfile(r.ok);
                })
                .catch(() => setHasProfile(false));
        }
    }, [user, token]);

    // Logged in as artisan
    if (user?.role === 'artisan') {
        const href = hasProfile ? '/dashboard' : '/onboarding';
        const label = hasProfile ? 'Go to Dashboard →' : 'Complete Registration →';
        return (
            <div className="flex flex-wrap gap-4">
                <Link
                    href={href}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                    {label}
                </Link>
            </div>
        );
    }

    // Logged in as buyer → only "Explore Crafts"
    if (user && user.role !== 'artisan') {
        return (
            <div className="flex flex-wrap gap-4">
                <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                    Explore Crafts →
                </Link>
            </div>
        );
    }

    // Logged out → both buttons
    return (
        <div className="flex flex-wrap gap-4">
            <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
                Start as an Artisan →
            </Link>
            <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-800 font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all hover:-translate-y-0.5"
            >
                Explore Crafts
            </Link>
        </div>
    );
}
