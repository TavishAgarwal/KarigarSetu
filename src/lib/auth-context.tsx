'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isFirebaseEnabled } from './featureFlags';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    hasProfile?: boolean;
}

interface AuthContextType {
    user: User | null;
    /** @deprecated Auth is cookie-based. This is a non-null signal for backward compat. */
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role?: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount, validate session via cookie-based /api/auth/me
    useEffect(() => {
        async function validateSession() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setUser(data.user);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch {
                // Cookie session invalid
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
        // Server sets httpOnly cookie automatically — no localStorage needed
        setUser(data.user);
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
        setUser(data.user);
    }, []);

    const loginWithGoogle = useCallback(async () => {
        if (!isFirebaseEnabled()) {
            throw new Error('Google Sign-In is not configured. Please set Firebase environment variables.');
        }

        // Dynamic import to avoid loading Firebase on pages that don't need it
        const { getFirebaseAuth, getGoogleProvider } = await import('./firebase');
        const { signInWithPopup } = await import('firebase/auth');

        const auth = getFirebaseAuth();
        const provider = getGoogleProvider();

        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();

        // Send Firebase token to our backend to create/link user
        const res = await fetch('/api/auth/firebase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Google Sign-In failed');
        }

        const data = await res.json();
        setUser(data.user);
    }, []);

    const logout = useCallback(async () => {
        // Clear server-side cookie
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Ignore network errors during logout
        }

        // Sign out from Firebase if available
        if (isFirebaseEnabled()) {
            try {
                const { getFirebaseAuth } = await import('./firebase');
                const { signOut } = await import('firebase/auth');
                await signOut(getFirebaseAuth());
            } catch {
                // Ignore Firebase signout errors
            }
        }

        // Clear client-side state
        setUser(null);
    }, []);

    // Provide a non-null token signal for backward compat (actual auth is cookie-based)
    const token = user ? 'cookie-auth' : null;

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, loginWithGoogle, logout }}>
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
