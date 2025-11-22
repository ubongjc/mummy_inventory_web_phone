// Anti-scraping and bot detection middleware

import { NextRequest } from 'next/server';

/**
 * Bot User-Agent patterns to block or rate-limit
 */
const BOT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /scrape/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /scrapy/i,
  /beautifulsoup/i,
  /selenium/i,
  /puppeteer/i,
  /phantomjs/i,
  /headless/i,
];

/**
 * Legitimate bots to allow (search engines, monitoring)
 */
const ALLOWED_BOTS = [
  /googlebot/i,
  /bingbot/i,
  /slackbot/i,
  /twitterbot/i,
  /facebookexternalhit/i,
  /linkedinbot/i,
  /whatsapp/i,
];

/**
 * Detect if user-agent looks like a bot
 */
export function isSuspiciousBot(userAgent: string | null): boolean {
  if (!userAgent) return true; // No user agent = suspicious

  // Allow legitimate bots
  if (ALLOWED_BOTS.some((pattern) => pattern.test(userAgent))) {
    return false;
  }

  // Block known scraping patterns
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

/**
 * Detect scraping behavior patterns
 */
export function detectScrapingBehavior(req: NextRequest): {
  isSuspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const userAgent = req.headers.get('user-agent');
  const referer = req.headers.get('referer');
  const acceptLanguage = req.headers.get('accept-language');
  const acceptEncoding = req.headers.get('accept-encoding');

  // Check 1: Missing or suspicious user agent
  if (!userAgent) {
    reasons.push('No user-agent header');
  } else if (isSuspiciousBot(userAgent)) {
    reasons.push('Suspicious user-agent pattern');
  }

  // Check 2: Missing common browser headers
  if (!acceptLanguage) {
    reasons.push('Missing accept-language header');
  }

  if (!acceptEncoding) {
    reasons.push('Missing accept-encoding header');
  }

  // Check 3: Suspicious header combinations
  if (userAgent && userAgent.length < 20) {
    reasons.push('Unusually short user-agent');
  }

  // Check 4: Direct IP access without referer (might be API scraping)
  const url = new URL(req.url);
  if (!referer && !url.pathname.startsWith('/api/auth') && !url.pathname.startsWith('/api/cron')) {
    // Missing referer is OK for initial page loads and certain API endpoints
    // but suspicious for deep links
    const pathDepth = url.pathname.split('/').filter(Boolean).length;
    if (pathDepth > 2) {
      reasons.push('Deep link access without referer');
    }
  }

  // Check 5: Suspicious request patterns
  const suspiciousParams = ['debug', 'test', 'admin', 'phpMyAdmin', 'wp-admin', '.env'];
  const hasSuspiciousParams = suspiciousParams.some((param) =>
    url.pathname.toLowerCase().includes(param)
  );
  if (hasSuspiciousParams) {
    reasons.push('Suspicious URL pattern (vulnerability scanning)');
  }

  return {
    isSuspicious: reasons.length >= 2, // Flag as suspicious if 2+ red flags
    reasons,
  };
}

/**
 * Rate limiting for scraping detection
 * Returns true if request should be blocked
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkScrapingRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { blocked: boolean; remaining: number } {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  // Clean up old records periodically
  if (Math.random() < 0.01) {
    // 1% chance to clean up
    for (const [key, value] of requestCounts.entries()) {
      if (value.resetAt < now) {
        requestCounts.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // New window
    requestCounts.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { blocked: false, remaining: maxRequests - 1 };
  }

  record.count++;

  if (record.count > maxRequests) {
    return { blocked: true, remaining: 0 };
  }

  return { blocked: false, remaining: maxRequests - record.count };
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(req: NextRequest): string {
  // Use forwarded IP if behind proxy (Vercel)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');

  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

  // Include user-agent hash for more specific identification
  const userAgent = req.headers.get('user-agent') || '';
  const uaHash = simpleHash(userAgent);

  return `${ip}:${uaHash}`;
}

/**
 * Simple hash function for user-agent
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}

/**
 * Honeypot detection - add hidden fields to forms
 */
export function createHoneypot(): {
  fieldName: string;
  checkValue: (value: string | null | undefined) => boolean;
} {
  const timestamp = Date.now();
  const fieldName = `email_confirm_${timestamp}`;

  return {
    fieldName,
    checkValue: (value) => {
      // Honeypot should be empty
      return !value || value.trim() === '';
    },
  };
}
