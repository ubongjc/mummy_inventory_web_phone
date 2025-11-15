/**
 * Rate limiting utilities
 * Provides a simple in-memory rate limiter for API endpoints
 */

import { NextRequest } from 'next/server';

// Simple in-memory rate limiter (for production, consider using Redis or Upstash)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
}

/**
 * Create a rate limiter with specific configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
  return config;
}

/**
 * Apply rate limiting to a specific identifier (e.g., IP address, user ID)
 */
export async function applyRateLimit(
  config: RateLimitConfig,
  identifier: string
): Promise<RateLimitResult> {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: resetTime,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  // Increment count
  record.count++;
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    reset: record.resetTime,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Clean up expired rate limit records (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

/**
 * Pre-configured rate limiters for common use cases
 */

// API rate limiter: 30 requests per minute
export const apiRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
});

// Contact form rate limiter: 3 submissions per hour
export const contactRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
});

// Auth rate limiter: 5 attempts per 15 minutes
export const authRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

// Payment rate limiter: 10 requests per minute
export const paymentRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
});
