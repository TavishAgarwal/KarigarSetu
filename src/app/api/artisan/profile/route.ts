import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profile = await prisma.artisanProfile.findUnique({
            where: { userId: user.id },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                products: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            name, location, craftType, experienceYears, bio,
            // New onboarding fields
            craftSpecialization, materialsUsed, techniquesUsed,
            state, district, pincode,
            productionCapacity, workshopSize, acceptsBulkOrders,
            shipsDomestic, shipsInternational,
            bankAccount, ifscCode, upiId,
        } = body;

        // Update user name if provided
        if (name) {
            await prisma.user.update({
                where: { id: user.id },
                data: { name },
            });
        }

        // Update artisan profile fields
        const profile = await prisma.artisanProfile.update({
            where: { userId: user.id },
            data: {
                ...(location !== undefined && { location }),
                ...(craftType !== undefined && { craftType }),
                ...(experienceYears !== undefined && { experienceYears: Number(experienceYears) }),
                ...(bio !== undefined && { bio }),
                ...(craftSpecialization !== undefined && { craftSpecialization }),
                ...(materialsUsed !== undefined && { materialsUsed }),
                ...(techniquesUsed !== undefined && { techniquesUsed }),
                ...(state !== undefined && { state }),
                ...(district !== undefined && { district }),
                ...(pincode !== undefined && { pincode }),
                ...(productionCapacity !== undefined && { productionCapacity: productionCapacity ? Number(productionCapacity) : null }),
                ...(workshopSize !== undefined && { workshopSize: workshopSize ? Number(workshopSize) : null }),
                ...(acceptsBulkOrders !== undefined && { acceptsBulkOrders }),
                ...(shipsDomestic !== undefined && { shipsDomestic }),
                ...(shipsInternational !== undefined && { shipsInternational }),
                ...(bankAccount !== undefined && { bankAccount }),
                ...(ifscCode !== undefined && { ifscCode }),
                ...(upiId !== undefined && { upiId }),
            },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
                products: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
