'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { buttonVariants } from '@/components/ui/button';
import { Menu, X, LayoutDashboard, LogOut, User, ChevronDown, ShoppingCart, Sparkles, Heart, Package } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isBuyer = user?.role === 'buyer';

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
        router.push('/');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2" aria-label="KarigarSetu Home">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">K</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">KarigarSetu</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/marketplace" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                            Explore Crafts
                        </Link>
                        <Link href="/impact" className="text-gray-700 hover:text-orange-600 font-medium transition-colors flex items-center gap-1.5">
                            <Heart className="h-4 w-4" />
                            Our Impact
                        </Link>
                        <Link href="/ai-shopper" className="text-gray-700 hover:text-orange-600 font-medium transition-colors flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4" />
                            AI Craft Shopper
                        </Link>
                    </div>

                    {/* Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <>
                                {isBuyer ? (
                                    <>
                                        <Link href="/cart" className={buttonVariants({ variant: "outline", className: "gap-2 rounded-xl border-gray-200 hover:border-orange-300 hover:bg-orange-50 relative" })}>
                                            <ShoppingCart className="h-4 w-4" />
                                            Cart
                                            {cartCount > 0 && (
                                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                    {cartCount > 99 ? '99+' : cartCount}
                                                </span>
                                            )}
                                        </Link>
                                        <Link href="/dashboard/buyer-orders" className={buttonVariants({ variant: "outline", className: "gap-2 rounded-xl border-gray-200 hover:border-orange-300 hover:bg-orange-50" })}>
                                            <Package className="h-4 w-4" />
                                            My Orders
                                        </Link>
                                    </>
                                ) : (
                                    <Link href="/dashboard" className={buttonVariants({ variant: "outline", className: "gap-2 rounded-xl border-gray-200 hover:border-orange-300 hover:bg-orange-50" })}>
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                )}

                                {/* User Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                                            <span className="text-white font-medium text-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 hidden lg:block">
                                            {user.name}
                                        </span>
                                        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                            <div className="px-4 py-2.5 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            {!isBuyer && (
                                                <Link
                                                    href="/dashboard/profile"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                                >
                                                    <User className="h-4 w-4" />
                                                    My Profile
                                                </Link>
                                            )}
                                            <div className="border-t border-gray-100 mt-1 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className={buttonVariants({ variant: "ghost", className: "text-gray-700 hover:text-orange-600" })}>
                                    Login
                                </Link>
                                <Link href="/register" className={buttonVariants({ className: "bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6" })}>
                                    Join Now
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
                    <Link href="/marketplace" className="block text-gray-700 hover:text-orange-600 font-medium py-2">
                        Explore Crafts
                    </Link>
                    <Link href="/impact" className="flex items-center gap-2 text-gray-700 hover:text-orange-600 font-medium py-2">
                        <Heart className="h-4 w-4" />
                        Our Impact
                    </Link>
                    <Link href="/ai-shopper" className="flex items-center gap-2 text-gray-700 hover:text-orange-600 font-medium py-2">
                        <Sparkles className="h-4 w-4" />
                        AI Craft Shopper
                    </Link>
                    {user ? (
                        <>
                            {isBuyer ? (
                                <Link href="/cart" className="flex items-center gap-2 text-gray-700 hover:text-orange-600 font-medium py-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    Cart
                                    {cartCount > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            ) : (
                                <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-orange-600 font-medium py-2">
                                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                                </Link>
                            )}
                            {!isBuyer && (
                                <Link href="/dashboard/profile" className="flex items-center gap-2 text-gray-700 hover:text-orange-600 font-medium py-2">
                                    <User className="h-4 w-4" /> My Profile
                                </Link>
                            )}
                            <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 font-medium py-2">
                                <LogOut className="h-4 w-4" /> Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-2 pt-2">
                            <Link href="/login" className={buttonVariants({ variant: "outline", className: "flex-1 w-full" })}>
                                Login
                            </Link>
                            <Link href="/register" className={buttonVariants({ className: "flex-1 w-full bg-orange-500 hover:bg-orange-600 text-white" })}>
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
