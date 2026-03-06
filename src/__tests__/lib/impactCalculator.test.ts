import { describe, it, expect } from 'vitest';
import { calculateCraftImpact } from '@/lib/impactCalculator';

describe('calculateCraftImpact', () => {
    const baseProduct = {
        price: 2500,
        category: 'Pottery',
        title: 'Blue Pottery Vase',
        description: 'A beautiful handcrafted blue pottery vase from Jaipur',
        artisan: {
            craftType: 'Blue Pottery',
            experienceYears: 15,
            materialsUsed: 'Quartz stone powder, glass',
            techniquesUsed: 'Hand-painting, kiln firing',
            workshopSize: 3,
        },
    };

    it('should calculate labor days based on price', () => {
        const impact = calculateCraftImpact(baseProduct);
        expect(impact.laborDays).toBeGreaterThan(0);
        expect(impact.laborDays).toBeTypeOf('number');
    });

    it('should return positive families supported', () => {
        const impact = calculateCraftImpact(baseProduct);
        expect(impact.familiesSupported).toBeGreaterThan(0);
    });

    it('should detect craft heritage age for known crafts', () => {
        const impact = calculateCraftImpact({
            ...baseProduct,
            category: 'Madhubani Painting',
            artisan: { ...baseProduct.artisan, craftType: 'Madhubani Painting' },
        });
        expect(impact.craftAge).toBeGreaterThanOrEqual(2000);
    });

    it('should return a non-empty impact summary', () => {
        const impact = calculateCraftImpact(baseProduct);
        expect(impact.impactSummary).toBeTruthy();
        expect(impact.impactSummary.length).toBeGreaterThan(10);
    });

    it('should estimate labor hours', () => {
        const impact = calculateCraftImpact(baseProduct);
        expect(impact.estimatedLaborHours).toBeGreaterThan(0);
    });

    it('should handle higher prices with more labor days', () => {
        const cheapProduct = { ...baseProduct, price: 500 };
        const expensiveProduct = { ...baseProduct, price: 10000 };
        const cheapImpact = calculateCraftImpact(cheapProduct);
        const expensiveImpact = calculateCraftImpact(expensiveProduct);
        expect(expensiveImpact.laborDays).toBeGreaterThanOrEqual(cheapImpact.laborDays);
    });

    it('should apply complexity multiplier for silk crafts', () => {
        const silkProduct = {
            ...baseProduct,
            title: 'Silk Saree',
            artisan: { ...baseProduct.artisan, materialsUsed: 'Pure silk, zari thread' },
        };
        const cottonProduct = {
            ...baseProduct,
            title: 'Cotton Fabric',
            artisan: { ...baseProduct.artisan, materialsUsed: 'Cotton thread' },
        };
        const silkImpact = calculateCraftImpact(silkProduct);
        const cottonImpact = calculateCraftImpact(cottonProduct);
        expect(silkImpact.estimatedLaborHours).toBeGreaterThanOrEqual(cottonImpact.estimatedLaborHours);
    });
});
