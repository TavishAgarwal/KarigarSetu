/** Shared artisan and user types used across pages, components, and API routes. */

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'artisan' | 'buyer';
    hasProfile?: boolean;
}

export interface ArtisanProfile {
    id: string;
    userId: string;
    craftType: string;
    craftSpecialization?: string | null;
    materialsUsed?: string | null;
    techniquesUsed?: string | null;
    location: string;
    state: string;
    district: string;
    pincode?: string | null;
    experienceYears: number;
    productionCapacity?: number | null;
    workshopSize?: number | null;
    acceptsBulkOrders: boolean;
    shipsDomestic: boolean;
    shipsInternational: boolean;
    bio: string;
    profileImage?: string | null;
    bankAccount?: string | null;
    ifscCode?: string | null;
    upiId?: string | null;
    verificationStatus: string;
    createdAt: string;
}

export interface DashboardStats {
    totalProducts: number;
    totalRevenue: number;
    totalStock: number;
    weeklyData: number[];
    monthlyData: { month: string; revenue: number }[];
}
