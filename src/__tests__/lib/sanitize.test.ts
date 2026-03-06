import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeText, sanitizeUrl, sanitizeSearchQuery } from '@/lib/sanitize';

describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
        const input = 'Hello <script>alert("xss")</script> World';
        expect(sanitizeHtml(input)).toBe('Hello  World');
    });

    it('should remove event handlers', () => {
        const input = '<img src="x" onerror="alert(1)">';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('onerror');
    });

    it('should remove javascript: URLs', () => {
        const input = '<a href="javascript:alert(1)">click</a>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('javascript:');
    });

    it('should remove iframe tags', () => {
        const input = 'text <iframe src="evil.com"></iframe> more';
        expect(sanitizeHtml(input)).toBe('text  more');
    });

    it('should remove style tags', () => {
        const input = '<style>body{display:none}</style>Hello';
        expect(sanitizeHtml(input)).toBe('Hello');
    });

    it('should preserve safe text content', () => {
        const input = 'Beautiful handcrafted pottery from Jaipur';
        expect(sanitizeHtml(input)).toBe(input);
    });
});

describe('sanitizeText', () => {
    it('should strip all HTML tags', () => {
        const input = '<b>Bold</b> <i>text</i> with <a href="x">link</a>';
        expect(sanitizeText(input)).toBe('Bold text with link');
    });

    it('should preserve plain text', () => {
        const input = 'A lovely Madhubani painting worth ₹5000';
        expect(sanitizeText(input)).toBe(input);
    });
});

describe('sanitizeUrl', () => {
    it('should allow https URLs', () => {
        expect(sanitizeUrl('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
    });

    it('should allow relative URLs', () => {
        expect(sanitizeUrl('/products/vase.png')).toBe('/products/vase.png');
    });

    it('should reject javascript: URLs', () => {
        expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    it('should reject data: URLs', () => {
        expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('should reject ftp: URLs', () => {
        expect(sanitizeUrl('ftp://evil.com/file')).toBe('');
    });
});

describe('sanitizeSearchQuery', () => {
    it('should remove SQL injection characters', () => {
        const input = "'; DROP TABLE products; --";
        const result = sanitizeSearchQuery(input);
        expect(result).not.toContain("'");
        expect(result).not.toContain(';');
        expect(result).not.toContain('--');
    });

    it('should truncate long queries', () => {
        const input = 'a'.repeat(500);
        expect(sanitizeSearchQuery(input).length).toBeLessThanOrEqual(200);
    });

    it('should preserve normal search terms', () => {
        expect(sanitizeSearchQuery('blue pottery vase')).toBe('blue pottery vase');
    });
});
