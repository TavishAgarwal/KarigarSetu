'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    hasProfile?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount, validate session via cookie-based /api/auth/me
    // Fall back to localStorage for backward compatibility
    useEffect(() => {
        async function validateSession() {
            try {
                // Try cookie-based session first
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                        // Keep token from localStorage if available (for existing Bearer header fetches)
                        const savedToken = localStorage.getItem('token');
                        if (savedToken) setToken(savedToken);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch {
                // Cookie session invalid — fall through to localStorage check
            }

            // Fall back to localStorage (for existing sessions before cookie migration)
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
            setIsLoading(false);
        }

        validateSession();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Login failed');
        }

        const data = await res.json();
        // Server sets httpOnly cookie automatically
        // Keep token + user in state/localStorage for backward-compatible Bearer header fetches
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }, []);

    const register = useCallback(async (name: string, email: string, password: string, role = 'artisan') => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Registration failed');
        }

        const data = await res.json();
        // Server sets httpOnly cookie automatically
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }, []);

    const logout = useCallback(async () => {
        // Clear server-side cookie
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Ignore network errors during logout
        }
        // Clear client-side state
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
