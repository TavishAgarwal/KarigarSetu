import { describe, it, expect } from 'vitest';
import { VALID_ORDER_STATUSES, VALID_TRANSITIONS } from '@/types/order';

describe('Order Status Types', () => {
    it('should have 6 valid statuses', () => {
        expect(VALID_ORDER_STATUSES).toHaveLength(6);
    });

    it('should include all expected statuses', () => {
        expect(VALID_ORDER_STATUSES).toContain('PENDING');
        expect(VALID_ORDER_STATUSES).toContain('CONFIRMED');
        expect(VALID_ORDER_STATUSES).toContain('PROCESSING');
        expect(VALID_ORDER_STATUSES).toContain('SHIPPED');
        expect(VALID_ORDER_STATUSES).toContain('DELIVERED');
        expect(VALID_ORDER_STATUSES).toContain('CANCELLED');
    });

    it('PENDING should only transition to CONFIRMED or CANCELLED', () => {
        expect(VALID_TRANSITIONS.PENDING).toEqual(['CONFIRMED', 'CANCELLED']);
    });

    it('CONFIRMED should only transition to PROCESSING or CANCELLED', () => {
        expect(VALID_TRANSITIONS.CONFIRMED).toEqual(['PROCESSING', 'CANCELLED']);
    });

    it('PROCESSING should only transition to SHIPPED', () => {
        expect(VALID_TRANSITIONS.PROCESSING).toEqual(['SHIPPED']);
    });

    it('SHIPPED should only transition to DELIVERED', () => {
        expect(VALID_TRANSITIONS.SHIPPED).toEqual(['DELIVERED']);
    });

    it('DELIVERED should not have valid transitions (terminal state)', () => {
        expect(VALID_TRANSITIONS.DELIVERED).toBeUndefined();
    });

    it('CANCELLED should not have valid transitions (terminal state)', () => {
        expect(VALID_TRANSITIONS.CANCELLED).toBeUndefined();
    });
});
