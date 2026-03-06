import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, createProductSchema, createOrderSchema, updateOrderStatusSchema, formatZodError } from '@/lib/schemas';

describe('loginSchema', () => {
    it('should accept valid login data', () => {
        const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
        expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
        const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
        expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
        const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
        expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
        const result = loginSchema.safeParse({});
        expect(result.success).toBe(false);
    });
});

describe('registerSchema', () => {
    it('should accept valid registration data', () => {
        const result = registerSchema.safeParse({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'artisan',
        });
        expect(result.success).toBe(true);
    });

    it('should reject short password', () => {
        const result = registerSchema.safeParse({
            name: 'Test User',
            email: 'test@example.com',
            password: '1234',
            role: 'artisan',
        });
        expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
        const result = registerSchema.safeParse({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'admin',
        });
        expect(result.success).toBe(false);
    });

    it('should default role to artisan', () => {
        const result = registerSchema.safeParse({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.role).toBe('artisan');
        }
    });
});

describe('createProductSchema', () => {
    it('should accept valid product data', () => {
        const result = createProductSchema.safeParse({
            title: 'Blue Pottery Vase',
            description: 'A beautiful vase',
            price: 1500,
            category: 'Pottery',
            imageUrl: '/products/vase.png',
        });
        expect(result.success).toBe(true);
    });

    it('should reject negative price', () => {
        const result = createProductSchema.safeParse({
            title: 'Blue Pottery Vase',
            description: 'A beautiful vase',
            price: -100,
            category: 'Pottery',
            imageUrl: '/products/vase.png',
        });
        expect(result.success).toBe(false);
    });

    it('should reject zero price', () => {
        const result = createProductSchema.safeParse({
            title: 'Blue Pottery Vase',
            description: 'A beautiful vase',
            price: 0,
            category: 'Pottery',
            imageUrl: '/products/vase.png',
        });
        expect(result.success).toBe(false);
    });

    it('should reject missing title', () => {
        const result = createProductSchema.safeParse({
            description: 'A beautiful vase',
            price: 1500,
            category: 'Pottery',
            imageUrl: '/products/vase.png',
        });
        expect(result.success).toBe(false);
    });

    it('should coerce string price to number', () => {
        const result = createProductSchema.safeParse({
            title: 'Blue Pottery Vase',
            description: 'A beautiful vase',
            price: '1500',
            category: 'Pottery',
            imageUrl: '/products/vase.png',
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.price).toBe(1500);
        }
    });

    it('should default stock to 1', () => {
        const result = createProductSchema.safeParse({
            title: 'Blue Pottery Vase',
            description: 'A beautiful vase',
            price: 1500,
            category: 'Pottery',
            imageUrl: '/products/vase.png',
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.stock).toBe(1);
        }
    });
});

describe('createOrderSchema', () => {
    it('should accept valid order data', () => {
        const result = createOrderSchema.safeParse({
            items: [{ productId: 'abc123', quantity: 2 }],
        });
        expect(result.success).toBe(true);
    });

    it('should reject empty items array', () => {
        const result = createOrderSchema.safeParse({ items: [] });
        expect(result.success).toBe(false);
    });

    it('should reject items with zero quantity', () => {
        const result = createOrderSchema.safeParse({
            items: [{ productId: 'abc123', quantity: 0 }],
        });
        expect(result.success).toBe(false);
    });

    it('should reject items with negative quantity', () => {
        const result = createOrderSchema.safeParse({
            items: [{ productId: 'abc123', quantity: -1 }],
        });
        expect(result.success).toBe(false);
    });
});

describe('updateOrderStatusSchema', () => {
    it('should accept valid status values', () => {
        const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        for (const status of validStatuses) {
            const result = updateOrderStatusSchema.safeParse({ status });
            expect(result.success).toBe(true);
        }
    });

    it('should reject invalid status', () => {
        const result = updateOrderStatusSchema.safeParse({ status: 'INVALID' });
        expect(result.success).toBe(false);
    });
});

describe('formatZodError', () => {
    it('should format validation errors into readable string', () => {
        const result = loginSchema.safeParse({ email: 'bad', password: '' });
        if (!result.success) {
            const message = formatZodError(result.error);
            expect(message).toBeTruthy();
            expect(typeof message).toBe('string');
        }
    });
});
