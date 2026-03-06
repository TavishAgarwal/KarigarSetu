import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock jsonwebtoken before importing auth module
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn((payload: Record<string, string>, _secret: string, _opts: Record<string, string>) => `mock-token-${payload.userId}`),
        verify: vi.fn((token: string, _secret: string) => {
            if (token === 'valid-token') {
                return { userId: 'user-1', email: 'test@test.com', role: 'artisan' };
            }
            throw new Error('Invalid token');
        }),
    },
}));

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(async (password: string) => `hashed-${password}`),
        compare: vi.fn(async (password: string, hash: string) => hash === `hashed-${password}`),
    },
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

describe('Auth Utilities', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-only';
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should sign and verify tokens', async () => {
        const { signToken, verifyToken } = await import('@/lib/auth');

        const token = signToken({ userId: 'user-1', email: 'test@test.com', role: 'artisan' });
        expect(token).toBeTruthy();
        expect(typeof token).toBe('string');
    });

    it('should hash passwords', async () => {
        const { hashPassword } = await import('@/lib/auth');
        const hash = await hashPassword('password123');
        expect(hash).toBeTruthy();
        expect(hash).not.toBe('password123');
    });

    it('should verify matching passwords', async () => {
        const { verifyPassword } = await import('@/lib/auth');
        const isValid = await verifyPassword('password123', 'hashed-password123');
        expect(isValid).toBe(true);
    });

    it('should reject non-matching passwords', async () => {
        const { verifyPassword } = await import('@/lib/auth');
        const isValid = await verifyPassword('wrong', 'hashed-password123');
        expect(isValid).toBe(false);
    });
});
