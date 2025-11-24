import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Enhanced middleware with role-based access control
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

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
      const referer = req.headers.get('referer');
      const host = req.headers.get('host');

      // Skip CSRF check for webhook endpoints (they use signature validation)
      if (path.startsWith('/api/payment/webhook')) {
        return NextResponse.next();
      }

      // Require either origin or referer header
      if (!origin && !referer) {
        return NextResponse.json({ error: 'Missing origin/referer header' }, { status: 403 });
      }

      // Parse and compare hosts properly (exact match, not substring)
      try {
        const originHost = origin ? new URL(origin).host : null;
        const refererHost = referer ? new URL(referer).host : null;

        // At least one must match the server host
        if (originHost !== host && refererHost !== host) {
          return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 });
        }
      } catch (error) {
        // Invalid URL in origin/referer header
        return NextResponse.json({ error: 'Invalid origin/referer header' }, { status: 403 });
      }
    }

    return NextResponse.next();
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
     * - /contact, /faq, /privacy, /terms (public marketing pages)
     * - api/auth (authentication endpoints)
     * - api/contact (contact form endpoint)
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
    '/((?!$|contact|faq|privacy|terms|api/auth|api/contact|api/payment/webhook|auth/sign-in|auth/sign-up|auth/forgot-password|auth/reset-password|_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
