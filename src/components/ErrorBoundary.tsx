'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * React Error Boundary — catches unhandled render errors
 * and shows a user-friendly fallback instead of a blank page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    fontFamily: 'system-ui, sans-serif',
                }}>
                    <div style={{ textAlign: 'center', maxWidth: '480px' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                            Something went wrong
                        </h2>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            style={{
                                padding: '0.5rem 1.5rem',
                                border: '1px solid #ccc',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                backgroundColor: '#fff',
                            }}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
