'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-white font-bold text-2xl">K</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                            <p className="text-gray-500 mt-1">Sign in to your KarigarSetu account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                                    {error}
                                </div>
                            )}

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
                                    placeholder="••••••••"
                                    className="rounded-xl h-12"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        <p className="text-center text-gray-500 text-sm mt-6">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-orange-600 hover:text-orange-700 font-medium">
                                Register as Artisan
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
