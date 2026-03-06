import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set. Please add it to your .env file.');
    }
    return secret;
}

const JWT_SECRET = getJwtSecret();

const COOKIE_NAME = 'karigarsetu_token';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    } catch {
        return null;
    }
}

/**
 * Set an httpOnly auth cookie on the response.
 */
export function setAuthCookie(response: NextResponse, token: string): void {
    response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
    });
}

/**
 * Clear the auth cookie on the response.
 */
export function clearAuthCookie(response: NextResponse): void {
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });
}

/**
 * Get the authenticated user from the request.
 * Checks both httpOnly cookie and Authorization header for backward compatibility.
 */
export async function getAuthUser(req: NextRequest) {
    // Try cookie first
    const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
    // Fall back to Authorization header
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    const token = cookieToken || headerToken;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { artisanProfile: true },
    });

    return user;
}

/**
 * Verify auth token from cookie only (used in middleware).
 * Does NOT hit the database — returns only the JWT payload.
 */
export function verifyAuthCookie(req: NextRequest): { userId: string; email: string; role: string } | null {
    const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
    if (!cookieToken) return null;
    return verifyToken(cookieToken);
}

/**
 * Require the authenticated user to have the 'admin' role.
 * Returns the user if authorized, or a 403 NextResponse if not.
 */
export async function requireAdmin(req: NextRequest): Promise<
    { user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>> } |
    { error: NextResponse }
> {
    const user = await getAuthUser(req);
    if (!user) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    if (user.role !== 'admin') {
        return { error: NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 }) };
    }
    return { user };
}
