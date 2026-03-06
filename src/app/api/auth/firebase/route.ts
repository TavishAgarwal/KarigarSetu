/**
 * Firebase Authentication API Route.
 * Verifies Firebase ID tokens and creates/links user accounts in Prisma.
 *
 * POST /api/auth/firebase
 * Body: { idToken: string }
 * Response: { user, token } + sets httpOnly cookie
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';
import { isFirebaseAdminEnabled } from '@/lib/featureFlags';

export async function POST(req: NextRequest) {
    if (!isFirebaseAdminEnabled()) {
        return NextResponse.json(
            { error: 'Firebase authentication is not configured' },
            { status: 503 }
        );
    }

    try {
        const body = await req.json();
        const { idToken } = body;

        if (!idToken || typeof idToken !== 'string') {
            return NextResponse.json(
                { error: 'idToken is required' },
                { status: 400 }
            );
        }

        // Verify Firebase token
        const decoded = await verifyFirebaseToken(idToken);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid Firebase token' },
                { status: 401 }
            );
        }

        const { uid, email, name, picture } = decoded;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required for authentication' },
                { status: 400 }
            );
        }

        // Find existing user by Firebase UID or email
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { firebaseUid: uid },
                    { email },
                ],
            },
            include: { artisanProfile: true },
        });

        if (user) {
            // Link Firebase UID if not already linked
            if (!user.firebaseUid) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { firebaseUid: uid },
                    include: { artisanProfile: true },
                });
            }
        } else {
            // Create new user from Firebase auth
            user = await prisma.user.create({
                data: {
                    name: name || email.split('@')[0],
                    email,
                    password: '', // No password needed for Firebase auth
                    role: 'buyer', // Default to buyer for Google Sign-In
                    firebaseUid: uid,
                },
                include: { artisanProfile: true },
            });
        }

        // Generate JWT for our httpOnly cookie auth system
        const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const response = NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                hasProfile: !!user.artisanProfile,
            },
            token,
        });

        setAuthCookie(response, token);

        return response;
    } catch (error) {
        console.error('[Firebase Auth] Error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
