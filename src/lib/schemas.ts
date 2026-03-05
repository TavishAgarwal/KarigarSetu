/**
 * Zod validation schemas for all API routes.
 * Centralizes input validation to ensure type-safe runtime checks.
 */
import { z } from 'zod';

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    role: z.enum(['artisan', 'buyer']).default('artisan'),
});

// ─── Artisan Schemas ─────────────────────────────────────────────────────────

export const createProfileSchema = z.object({
    craftType: z.string().min(1, 'Craft type is required'),
    location: z.string().min(1, 'Location is required'),
    experienceYears: z.coerce.number().int().min(0),
    bio: z.string().min(1, 'Bio is required'),
    profileImage: z.string().optional().nullable(),
    craftSpecialization: z.string().optional().nullable(),
    materialsUsed: z.string().optional().nullable(),
    techniquesUsed: z.string().optional().nullable(),
    state: z.string().optional().default(''),
    district: z.string().optional().default(''),
    pincode: z.string().optional().nullable(),
    productionCapacity: z.coerce.number().int().optional().nullable(),
    workshopSize: z.coerce.number().int().optional().nullable(),
    acceptsBulkOrders: z.boolean().optional().default(false),
    shipsDomestic: z.boolean().optional().default(true),
    shipsInternational: z.boolean().optional().default(false),
    bankAccount: z.string().optional().nullable(),
    ifscCode: z.string().optional().nullable(),
    upiId: z.string().optional().nullable(),
});

// ─── Product Schemas ─────────────────────────────────────────────────────────

export const createProductSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required'),
    story: z.string().optional().default(''),
    price: z.coerce.number().positive('Price must be positive'),
    category: z.string().min(1, 'Category is required'),
    tags: z.union([z.string(), z.array(z.string())]).optional().default('[]'),
    imageUrl: z.string().min(1, 'Image URL is required'),
    stock: z.coerce.number().int().min(0).optional().default(1),
    craftStoryData: z.object({
        craftStory: z.string().optional().default(''),
        craftHistory: z.string().optional().default(''),
        artisanJourney: z.string().optional().default(''),
        culturalSymbolism: z.string().optional().default(''),
    }).optional(),
    craftProvenanceData: z.object({
        craftOrigin: z.string().optional().default(''),
        traditionalTechnique: z.string().optional().default(''),
        culturalSignificance: z.string().optional().default(''),
        authenticityScore: z.number().optional().default(82),
        verificationSummary: z.string().optional().default(''),
    }).optional(),
});

// ─── Order Schemas ───────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
    })).min(1, 'Cart is empty'),
    shippingForm: z.object({
        fullName: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        phone: z.string().optional(),
    }).optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
    ]),
});

/**
 * Helper to format Zod errors into a user-friendly message.
 */
export function formatZodError(error: z.ZodError): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return error.issues.map((e: any) => {
        const path = e.path?.length > 0 ? `${e.path.join('.')}: ` : '';
        return `${path}${e.message}`;
    }).join(', ');
}
