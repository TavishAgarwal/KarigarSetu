/**
 * Input sanitization utilities to prevent XSS and injection attacks.
 * Used for sanitizing user-generated content before storage and display.
 */

/**
 * Strip dangerous HTML tags and attributes from user input.
 * Allows basic text content but removes scripts, iframes, event handlers, etc.
 */
export function sanitizeHtml(input: string): string {
    return input
        // Remove script tags and content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove event handlers (onclick, onerror, etc.)
        .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
        // Remove javascript: URLs
        .replace(/javascript\s*:/gi, '')
        // Remove data: URLs in attributes (potential XSS vector)
        .replace(/data\s*:[^;]*;base64/gi, '')
        // Remove iframe, object, embed tags
        .replace(/<(iframe|object|embed|form|input|button)\b[^>]*>/gi, '')
        .replace(/<\/(iframe|object|embed|form|input|button)>/gi, '')
        // Remove style tags (CSS injection)
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .trim();
}

/**
 * Sanitize a plain text string — strips all HTML tags.
 * Use for fields that should only contain plain text (names, titles, etc.).
 */
export function sanitizeText(input: string): string {
    return input
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim();
}

/**
 * Sanitize a URL string — only allow http, https, and relative URLs.
 */
export function sanitizeUrl(input: string): string {
    const trimmed = input.trim();

    // Allow relative URLs
    if (trimmed.startsWith('/')) return trimmed;

    // Allow http and https only
    try {
        const url = new URL(trimmed);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
            return trimmed;
        }
    } catch {
        // Invalid URL
    }

    return '';
}

/**
 * Sanitize search query — prevent SQL-like injection patterns.
 * Prisma already parameterizes queries, but this adds defense in depth.
 */
export function sanitizeSearchQuery(input: string): string {
    return input
        .replace(/['"`;\\]/g, '')
        .replace(/--/g, '')
        .trim()
        .substring(0, 200); // Limit length
}
