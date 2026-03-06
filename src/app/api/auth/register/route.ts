import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { authLimiter } from '@/lib/rate-limiter';
import { registerSchema, formatZodError } from '@/lib/schemas';

export async function POST(req: NextRequest) {
    // Rate limit: 10 registration attempts per minute per IP
    const rateLimited = authLimiter.check(req);
    if (rateLimited) return rateLimited;

    try {
        const body = await req.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodError(parsed.error) },
                { status: 400 }
            );
        }

        const { name, email, password, role } = parsed.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const response = NextResponse.json(
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        );

        setAuthCookie(response, token);
        return response;
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
