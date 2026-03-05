/** Shared product-related types used across pages, components, and API routes. */

export interface Product {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    category: string;
    stock: number;
    description: string;
    story?: string | null;
    tags: string;
    artisanId: string;
    createdAt: string;
}

export interface ProductWithArtisan extends Product {
    artisan: {
        id: string;
        location: string;
        craftType: string;
        experienceYears: number;
        materialsUsed?: string | null;
        techniquesUsed?: string | null;
        workshopSize?: number | null;
        user: { name: string };
    };
    craftStory?: {
        craftStory: string;
        craftHistory: string;
        artisanJourney: string;
        culturalSymbolism: string;
    } | null;
    craftProvenance?: {
        craftOrigin: string;
        traditionalTechnique: string;
        culturalSignificance: string;
        authenticityScore: number;
        verificationSummary: string;
    } | null;
    craftAuthenticity?: {
        authenticityScore: number;
        handmadeSignals: string;
        machineSignals: string;
        verificationSummary: string;
    } | null;
    artisanImpact?: {
        estimatedLaborHours: number;
        artisanFamilyMembers: number;
        craftAgeYears: number;
        impactSummary: string;
    } | null;
}

export interface ProductListItem {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    category: string;
    artisan: {
        location: string;
        user: { name: string };
    };
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
