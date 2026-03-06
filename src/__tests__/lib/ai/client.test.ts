import { describe, it, expect } from 'vitest';
import { cleanJsonResponse } from '@/lib/ai/client';

describe('cleanJsonResponse', () => {
    it('should strip ```json code fences', () => {
        const input = '```json\n{"key": "value"}\n```';
        expect(cleanJsonResponse(input)).toBe('{"key": "value"}');
    });

    it('should strip ``` code fences without language', () => {
        const input = '```\n{"key": "value"}\n```';
        expect(cleanJsonResponse(input)).toBe('{"key": "value"}');
    });

    it('should trim whitespace', () => {
        const input = '  \n {"key": "value"} \n ';
        expect(cleanJsonResponse(input)).toBe('{"key": "value"}');
    });

    it('should return plain JSON as-is', () => {
        const input = '{"key": "value"}';
        expect(cleanJsonResponse(input)).toBe('{"key": "value"}');
    });

    it('should handle nested JSON structures', () => {
        const input = '```json\n{"tags": ["a", "b"], "nested": {"x": 1}}\n```';
        const result = cleanJsonResponse(input);
        const parsed = JSON.parse(result);
        expect(parsed.tags).toEqual(['a', 'b']);
        expect(parsed.nested.x).toBe(1);
    });

    it('should handle multiple code fences', () => {
        const input = '```json\n```json\n{"key": "value"}\n```\n```';
        const result = cleanJsonResponse(input);
        expect(result).toContain('"key"');
    });
});
