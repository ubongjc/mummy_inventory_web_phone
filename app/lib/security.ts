/**
 * Security utilities for authentication, rate limiting, and input sanitization
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Apply rate limiting to prevent brute force attacks
 */
export function rateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return true;
  }

  if (record.count >= config.maxRequests) {
    return false; // Rate limit exceeded
  }

  // Increment count
  record.count++;
  return true;
}

/**
 * Clean up expired rate limit records (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Cleanup interval management (prevent memory leaks)
let cleanupInterval: NodeJS.Timeout | null = null;

// Start cleanup interval (only once)
if (typeof window === "undefined" && !cleanupInterval) {
  cleanupInterval = setInterval(cleanupRateLimits, 60 * 1000); // Every 1 minute
  // Ensure cleanup on process termination
  process.on('beforeExit', () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  });
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Strict limits for authentication endpoints
  AUTH: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes

  // Standard limits for general API endpoints
  STANDARD: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute

  // Stricter limits for write operations
  WRITE: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests per minute

  // Generous limits for read operations
  READ: { maxRequests: 200, windowMs: 60 * 1000 }, // 200 requests per minute

  // Very strict for payment operations
  PAYMENT: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute

  // Strict for password reset
  PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
};

/**
 * Apply rate limiting to a request with automatic IP detection
 */
export async function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RateLimitPresets.STANDARD
): Promise<{ success: boolean; remaining?: number; resetTime?: number }> {
  const ip = getClientIp(request);
  const identifier = `${ip}:${request.nextUrl.pathname}`;

  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    const resetTime = now + config.windowMs;
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count++;
  return {
    success: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * Sanitize string input to prevent XSS
 * Strategy: Encode all special characters instead of removing tags
 * This prevents any HTML/JavaScript execution while preserving the text content
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Encode special characters in correct order (& must be first!)
  const sanitized = input
    .replace(/&/g, "&amp;")   // Must be first to avoid double-encoding
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  return sanitized.trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "object" ? sanitizeObject(item) : item
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  const sanitized = email.toLowerCase().trim();
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : "";
}

/**
 * Check if user is authenticated
 */
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      authenticated: false,
      user: null,
      response: Response.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true,
    user: session.user,
    response: null,
  };
}

/**
 * Check if user has admin role
 */
export async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request);

  if (!auth.authenticated) {
    return {
      authorized: false,
      user: null,
      response: auth.response,
    };
  }

  if (auth.user?.role !== "admin") {
    return {
      authorized: false,
      user: auth.user,
      response: Response.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: auth.user,
    response: null,
  };
}

/**
 * Validate environment variables
 */
export function validateEnv() {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

/**
 * Secure logging - remove sensitive data in production
 */
export function secureLog(message: string, data?: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(message, data);
  } else {
    // In production, only log errors without sensitive data
    if (data && typeof data === "object") {
      const sanitized = { ...data };
      // Remove sensitive fields
      delete sanitized.password;
      delete sanitized.passwordHash;
      delete sanitized.token;
      delete sanitized.secret;
      console.log(message, sanitized);
    } else {
      console.log(message);
    }
  }
}

/**
 * Sanitize error response based on environment
 * In production: Return generic error message
 * In development: Return detailed error information
 *
 * @param error - The error object
 * @param genericMessage - Generic message to show in production
 * @param detailsForDev - Additional details to show in development (optional)
 * @returns Object with error message and optional details
 */
export function sanitizeErrorResponse(
  error: any,
  genericMessage: string = "An error occurred",
  detailsForDev?: Record<string, any>
): Record<string, any> {
  // Always log the actual error securely
  secureLog(`[ERROR] ${genericMessage}`, {
    message: error?.message,
    stack: error?.stack,
    ...detailsForDev,
  });

  // In development, return detailed error information
  if (process.env.NODE_ENV === "development") {
    return {
      error: genericMessage,
      details: error?.message || "Unknown error",
      stack: error?.stack,
      ...detailsForDev,
    };
  }

  // In production, return only the generic message
  return {
    error: genericMessage,
  };
}
