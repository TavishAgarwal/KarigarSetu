import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';
import { authLimiter } from '@/lib/rate-limiter';
import { loginSchema, formatZodError } from '@/lib/schemas';

export async function POST(req: NextRequest) {
    // Rate limit: 10 login attempts per minute per IP
    const rateLimited = authLimiter.check(req);
    if (rateLimited) return rateLimited;

    try {
        const body = await req.json();
        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodError(parsed.error) },
                { status: 400 }
            );
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { artisanProfile: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Reject login for accounts that only have Google Sign-In (empty password hash)
        if (!user.password) {
            return NextResponse.json(
                { error: 'This account uses Google Sign-In. Please log in with Google.' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

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
        });

        setAuthCookie(response, token);
        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
