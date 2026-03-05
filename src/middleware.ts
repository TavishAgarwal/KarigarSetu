import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — protects dashboard routes and certain API endpoints.
 * Runs at the edge for every matching route.
 *
 * NOTE: We only check cookie EXISTENCE here (not JWT verification) because
 * `jsonwebtoken` uses Node.js crypto which isn't available in Edge runtime.
 * Full JWT verification happens in the API route handlers via `getAuthUser()`.
 */
export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('karigarsetu_token')?.value;

    // Protected pages: redirect unauthenticated users to login
    if (pathname.startsWith('/dashboard')) {
        if (!token) {
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Protected API routes: return 401 for unauthenticated requests
    const protectedApiPrefixes = [
        '/api/dashboard',
        '/api/artisan',
        '/api/orders',
    ];

    if (protectedApiPrefixes.some(prefix => pathname.startsWith(prefix))) {
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/dashboard/:path*',
        '/api/artisan/:path*',
        '/api/orders/:path*',
    ],
};
