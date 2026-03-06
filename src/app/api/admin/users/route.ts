import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/users — List all users (admin only)
 */
export async function GET(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');
        const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100);

        const where: Record<string, unknown> = {};
        if (role) where.role = role;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    artisanProfile: {
                        select: {
                            id: true,
                            craftType: true,
                            location: true,
                            verificationStatus: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            users,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Admin list users error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/users — Update a user's role (admin only)
 * Body: { userId: string, role: 'artisan' | 'buyer' | 'admin' }
 */
export async function PATCH(req: NextRequest) {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;

    try {
        const { userId, role } = await req.json();

        if (!userId || !['artisan', 'buyer', 'admin'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid userId or role. Role must be artisan, buyer, or admin.' },
                { status: 400 }
            );
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, name: true, email: true, role: true },
        });

        return NextResponse.json({ user: updated });
    } catch (error) {
        console.error('Admin update user error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
