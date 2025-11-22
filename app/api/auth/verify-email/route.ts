import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit, RateLimitPresets, secureLog } from '@/app/lib/security';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, RateLimitPresets.AUTH);
  if (!rateLimitResult.success) {
    secureLog('[SECURITY] Email verification rate limit exceeded');
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    // Find the email verification token
    const emailVerification = await prisma.emailVerification.findUnique({
      where: { token },
      include: {
        user: {
          select: { id: true, email: true, emailVerified: true },
        },
      },
    });

    // Validate token exists
    if (!emailVerification) {
      secureLog('[AUTH] Invalid email verification token attempted');
      return NextResponse.json(
        { error: 'Invalid verification link. Please check your email for the correct link.' },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (emailVerification.used) {
      // If already verified, this is fine - just redirect to success
      if (emailVerification.user.emailVerified) {
        secureLog('[AUTH] Email already verified', {
          userId: emailVerification.userId,
        });
        return NextResponse.json({
          message: 'Email already verified',
          alreadyVerified: true,
        });
      }

      secureLog('[AUTH] Used email verification token attempted', {
        userId: emailVerification.userId,
      });
      return NextResponse.json(
        { error: 'This verification link has already been used.' },
        { status: 400 }
      );
    }

    // Update user email verification status and mark token as used in a transaction
    await prisma.$transaction([
      // Mark email as verified
      prisma.user.update({
        where: { id: emailVerification.userId },
        data: { emailVerified: true },
      }),
      // Mark token as used
      prisma.emailVerification.update({
        where: { id: emailVerification.id },
        data: { used: true },
      }),
    ]);

    secureLog('[AUTH] Email verification successful', {
      userId: emailVerification.userId,
      email: emailVerification.user.email,
    });

    return NextResponse.json({
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    secureLog('[ERROR] Email verification failed', { error: error.message });

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
  }
}

// Also support GET requests for email verification links clicked from email
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/verify-email-error?error=missing_token', request.url));
  }

  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, RateLimitPresets.AUTH);
  if (!rateLimitResult.success) {
    return NextResponse.redirect(new URL('/auth/verify-email-error?error=rate_limit', request.url));
  }

  try {
    // Find the email verification token
    const emailVerification = await prisma.emailVerification.findUnique({
      where: { token },
      include: {
        user: {
          select: { id: true, email: true, emailVerified: true },
        },
      },
    });

    // Validate token exists
    if (!emailVerification) {
      return NextResponse.redirect(new URL('/auth/verify-email-error?error=invalid_token', request.url));
    }

    // If already verified, redirect to success
    if (emailVerification.user.emailVerified) {
      return NextResponse.redirect(new URL('/auth/verify-email-success?already_verified=true', request.url));
    }

    // Check if token has already been used but email not verified (edge case)
    if (emailVerification.used) {
      return NextResponse.redirect(new URL('/auth/verify-email-error?error=used_token', request.url));
    }

    // Update user email verification status and mark token as used in a transaction
    await prisma.$transaction([
      // Mark email as verified
      prisma.user.update({
        where: { id: emailVerification.userId },
        data: { emailVerified: true },
      }),
      // Mark token as used
      prisma.emailVerification.update({
        where: { id: emailVerification.id },
        data: { used: true },
      }),
    ]);

    secureLog('[AUTH] Email verification successful (GET)', {
      userId: emailVerification.userId,
      email: emailVerification.user.email,
    });

    // Redirect to success page
    return NextResponse.redirect(new URL('/auth/verify-email-success', request.url));
  } catch (error: any) {
    secureLog('[ERROR] Email verification failed (GET)', { error: error.message });
    return NextResponse.redirect(new URL('/auth/verify-email-error?error=server_error', request.url));
  }
}
