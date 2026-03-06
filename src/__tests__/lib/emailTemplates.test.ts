import { describe, it, expect } from 'vitest';
import { generateOrderConfirmationEmail } from '@/lib/emailTemplates';

describe('Email Templates', () => {
    const sampleOrder = {
        orderId: 'ORD-2024-001',
        buyerName: 'Rahul Sharma',
        items: [
            {
                title: 'Blue Pottery Vase',
                artisanName: 'Priya Devi',
                price: 2500,
                quantity: 1,
                imageUrl: '/products/blue-pottery-vase.png',
            },
            {
                title: 'Brass Diya Lamp',
                artisanName: 'Mohan Lal',
                price: 1800,
                quantity: 2,
                imageUrl: '/products/brass-diya-lamp.png',
            },
        ],
        totalAmount: 6100,
        shippingAddress: '42, MG Road, Jaipur, Rajasthan 302001',
    };

    it('generates valid HTML email', () => {
        const html = generateOrderConfirmationEmail(sampleOrder);
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('</html>');
    });

    it('includes order ID', () => {
        const html = generateOrderConfirmationEmail(sampleOrder);
        expect(html).toContain('ORD-2024-001');
    });

    it('includes buyer name', () => {
        const html = generateOrderConfirmationEmail(sampleOrder);
        expect(html).toContain('Rahul Sharma');
    });

    it('includes all product titles', () => {
        const html = generateOrderConfirmationEmail(sampleOrder);
        expect(html).toContain('Blue Pottery Vase');
        expect(html).toContain('Brass Diya Lamp');
    });

    it('includes artisan names', () => {
        const html = generateOrderConfirmationEmail(sampleOrder);
        expect(html).toContain('Priya Devi');
        expect(html).toContain('Mohan Lal');
    });

    it('includes formatted total amount', () => {
        const html = generateOrderConfirmationEmail(sampleOrder);
        expect(html).toContain('6,100');
    });

    it('includes shipping address', () => {
        const html = generateOrderConfirmationEmail(sampleOrder);
        expect(html).toContain('42, MG Road, Jaipur, Rajasthan 302001');
    });

    it('contains KarigarSetu branding', () => {
        const html = generateOrderConfirmationEmail(sampleOrder);
        expect(html).toContain('KarigarSetu');
    });

    it('handles single item order', () => {
        const singleItem = {
            ...sampleOrder,
            items: [sampleOrder.items[0]],
            totalAmount: 2500,
        };
        const html = generateOrderConfirmationEmail(singleItem);
        expect(html).toContain('Blue Pottery Vase');
        expect(html).not.toContain('Brass Diya Lamp');
    });
});
