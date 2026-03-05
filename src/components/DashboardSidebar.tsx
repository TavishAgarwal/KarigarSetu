'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
    LayoutDashboard,
    Package,
    ClipboardList,
    Sparkles,
    TrendingUp,
    MessageSquare,
    Megaphone,
    BarChart3,
    Heart,
    Factory,
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Products', href: '/dashboard/products', icon: Package },
    { label: 'Orders', href: '/dashboard/orders', icon: ClipboardList },
    { label: 'AI Generator', href: '/dashboard/ai-generator', icon: Sparkles },
    { label: 'Marketing', href: '/dashboard/marketing', icon: Megaphone },
    { label: 'Trends', href: '/dashboard/trends', icon: TrendingUp },
    { label: 'Production', href: '/dashboard/production', icon: Factory },
    { label: 'Impact', href: '/dashboard/impact', icon: Heart },
    { label: 'Sales', href: '/dashboard/sales', icon: BarChart3 },
    { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
];

export default function DashboardSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col">
            {/* Brand */}
            <div className="p-6 border-b border-gray-100">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-gray-900">KarigarSetu</span>
                        <p className="text-xs text-orange-500 font-medium uppercase tracking-wider">
                            Artisan Portal
                        </p>
                    </div>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            {user && (
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-600 font-bold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-orange-500">Master Artisan</p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
