'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('artisan');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(name, email, password, role);
            router.push(role === 'artisan' ? '/onboarding' : '/marketplace');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-2xl">K</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Join KarigarSetu</h1>
                            <p className="text-gray-500 mt-1">Start your digital craft journey</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <Label htmlFor="name" className="text-gray-700 mb-2 block">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="rounded-xl h-12"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-gray-700 mb-2 block">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="artisan@example.com"
                                    className="rounded-xl h-12"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-gray-700 mb-2 block">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    className="rounded-xl h-12"
                                    minLength={8}
                                    required
                                />
                            </div>

                            {/* Role Selection */}
                            <div>
                                <Label className="text-gray-700 mb-3 block">I want to</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole('artisan')}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${role === 'artisan'
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 text-gray-600 hover:border-orange-200'
                                            }`}
                                    >
                                        <span className="text-2xl block mb-1">🎨</span>
                                        <span className="font-medium text-sm">Sell Crafts</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('buyer')}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${role === 'buyer'
                                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 text-gray-600 hover:border-orange-200'
                                            }`}
                                    >
                                        <span className="text-2xl block mb-1">🛒</span>
                                        <span className="font-medium text-sm">Buy Crafts</span>
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>

                        <p className="text-center text-gray-500 text-sm mt-6">
                            Already have an account?{' '}
                            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
