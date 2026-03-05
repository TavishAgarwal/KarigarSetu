import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createProfileSchema, formatZodError } from '@/lib/schemas';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (user.role !== 'artisan') {
            return NextResponse.json(
                { error: 'Only artisans can create profiles' },
                { status: 403 }
            );
        }

        // Check if profile already exists
        const existing = await prisma.artisanProfile.findUnique({
            where: { userId: user.id },
        });
        if (existing) {
            return NextResponse.json(
                { error: 'Profile already exists' },
                { status: 409 }
            );
        }

        const body = await req.json();
        const parsed = createProfileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: formatZodError(parsed.error) },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const profile = await prisma.artisanProfile.create({
            data: {
                userId: user.id,
                craftType: data.craftType,
                location: data.location,
                experienceYears: data.experienceYears,
                bio: data.bio,
                profileImage: data.profileImage || null,
                craftSpecialization: data.craftSpecialization || null,
                materialsUsed: data.materialsUsed || null,
                techniquesUsed: data.techniquesUsed || null,
                state: data.state || '',
                district: data.district || '',
                pincode: data.pincode || null,
                productionCapacity: data.productionCapacity || null,
                workshopSize: data.workshopSize || null,
                acceptsBulkOrders: data.acceptsBulkOrders || false,
                shipsDomestic: data.shipsDomestic !== undefined ? data.shipsDomestic : true,
                shipsInternational: data.shipsInternational || false,
                bankAccount: data.bankAccount || null,
                ifscCode: data.ifscCode || null,
                upiId: data.upiId || null,
            },
            include: { user: { select: { name: true, email: true } } },
        });

        return NextResponse.json({ profile }, { status: 201 });
    } catch (error) {
        console.error('Create profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
