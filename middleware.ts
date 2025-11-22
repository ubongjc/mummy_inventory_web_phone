import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import {
  detectScrapingBehavior,
  checkScrapingRateLimit,
  getClientIdentifier,
  isSuspiciousBot,
} from './app/lib/anti-scraping';

// Enhanced middleware with role-based access control and anti-scraping
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Security headers for all responses
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Anti-scraping protection (skip for auth endpoints and cron)
    if (!path.startsWith('/api/auth') && !path.startsWith('/api/cron') && !path.startsWith('/api/payment/webhook')) {
      const userAgent = req.headers.get('user-agent');

      // Block obvious scraping bots
      if (isSuspiciousBot(userAgent)) {
        console.warn(`Blocked suspicious bot: ${userAgent} from ${path}`);
        return new NextResponse('Forbidden', {
          status: 403,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      // Rate limiting for scraping prevention
      const clientId = getClientIdentifier(req);
      const rateLimit = checkScrapingRateLimit(clientId, 200, 60000); // 200 requests/minute

      if (rateLimit.blocked) {
        console.warn(`Rate limit exceeded for ${clientId} on ${path}`);
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Content-Type': 'text/plain',
            'Retry-After': '60',
          },
        });
      }

      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    }

    // Role-based access control for admin routes
    if (path.startsWith('/api/admin') || path.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        // For API routes, return JSON error
        if (path.startsWith('/api/admin')) {
          return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }
        // For page routes, redirect to dashboard with error
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        url.searchParams.set('error', 'admin-required');
        return NextResponse.redirect(url);
      }
    }

    // CSRF protection for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const origin = req.headers.get('origin');
      const host = req.headers.get('host');

      // Check if request is from same origin
      if (origin && !origin.includes(host || '')) {
        return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 });
      }
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - / (homepage - marketing page)
     * - /contact, /privacy, /terms (public marketing pages)
     * - /book (public booking pages)
     * - /team/accept (team invitation acceptance pages)
     * - api/auth (authentication endpoints)
     * - api/contact (contact form endpoint)
     * - api/public-page (public booking page API)
     * - api/team/invitations/[token] (team invitation verification API)
     * - api/payment/webhook (Paystack webhooks - need to be public)
     * - auth/sign-in (login page)
     * - auth/sign-up (registration page)
     * - auth/forgot-password (password reset request page)
     * - auth/reset-password (password reset page with token)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, icons (PWA files)
     * - public/* (public assets)
     */
    '/((?!$|contact|privacy|terms|book|team/accept|api/auth|api/contact|api/public-page|api/team/invitations/.*|api/payment/webhook|auth/sign-in|auth/sign-up|auth/forgot-password|auth/reset-password|_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
