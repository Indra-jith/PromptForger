import { Env, RefinementStage } from './types';

/**
 * SHA-256 hash function for generating cache keys
 */
export async function hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, 5000); // Max 5000 characters
}

/**
 * Format error response
 */
export function errorResponse(message: string, status: number = 500) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Get user identifier from request (IP hash for MVP)
 */
export function getUserId(request: Request): string {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    return `ip_${ip.replace(/\./g, '_')}`;
}

/**
 * Calculate latency in milliseconds
 */
export function calculateLatency(startTime: number): number {
    return Date.now() - startTime;
}

/**
 * Parse JSON safely
 */
export function safeJSONParse<T>(str: string, fallback: T): T {
    try {
        return JSON.parse(str) as T;
    } catch {
        return fallback;
    }
}
