import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import {
  applyRateLimit,
  RateLimitPresets,
  getClientIp,
  sanitizeEmail,
  secureLog,
} from '@/app/lib/security';
import { sendEmailVerification } from '@/app/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

const resendVerificationSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform((val) => val.toLowerCase().trim()),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting for authentication (strict)
  const rateLimitResult = await applyRateLimit(request, RateLimitPresets.AUTH);
  if (!rateLimitResult.success) {
    const clientIp = getClientIp(request);
    secureLog('[SECURITY] Resend verification rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validated = resendVerificationSchema.parse(body);

    // Sanitize input
    const email = sanitizeEmail(validated.email);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    // Security: Always return success to prevent email enumeration
    // Don't reveal if user exists or not
    if (!user) {
      secureLog('[SECURITY] Resend verification for non-existent user', { email });
      return NextResponse.json({
        message: 'If an account with this email exists and is not verified, a verification email has been sent.',
      });
    }

    // If already verified, return success message
    if (user.emailVerified) {
      secureLog('[AUTH] Resend verification for already verified user', {
        userId: user.id,
        email: user.email,
      });
      return NextResponse.json({
        message: 'This email is already verified. You can sign in to your account.',
        alreadyVerified: true,
      });
    }

    // Generate new email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Invalidate any existing unused verification tokens for this user
    await prisma.emailVerification.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Create new email verification token
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        used: false,
      },
    });

    // Send verification email
    try {
      await sendEmailVerification(user.email, verificationToken);
      secureLog('[AUTH] Verification email resent', {
        userId: user.id,
        email: user.email,
      });
    } catch (emailError) {
      console.error('[AUTH] Failed to resend verification email:', emailError);
      secureLog('[ERROR] Resend verification email failed', {
        userId: user.id,
        error: (emailError as Error).message,
      });
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error: any) {
    secureLog('[ERROR] Resend verification failed', { error: error.message });

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid email address', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
