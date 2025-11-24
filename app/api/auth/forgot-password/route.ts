import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sendPasswordResetEmail } from '@/app/lib/email';
import { applyRateLimit, RateLimitPresets, secureLog } from '@/app/lib/security';
import { z } from 'zod';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .transform((val) => val.toLowerCase().trim()),
});

export async function POST(request: NextRequest) {
  // Apply strict rate limiting for password reset requests
  const rateLimitResult = await applyRateLimit(request, RateLimitPresets.AUTH);
  if (!rateLimitResult.success) {
    secureLog('[SECURITY] Password reset rate limit exceeded');
    return NextResponse.json(
      { error: 'Too many password reset attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true },
    });

    // Generate token regardless of whether user exists (for timing consistency)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Process password reset only if user exists
    if (user) {
      // Invalidate any existing unused reset tokens for this user
      await prisma.passwordReset.updateMany({
        where: {
          userId: user.id,
          used: false,
          expiresAt: { gt: new Date() },
        },
        data: {
          used: true,
        },
      });

      // Create new password reset token
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          used: false,
        },
      });

      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, token);
        secureLog('[AUTH] Password reset email sent', { userId: user.id, email: user.email });
      } catch (emailError) {
        console.error('[AUTH] Failed to send password reset email:', emailError);
        secureLog('[ERROR] Password reset email failed', {
          userId: user.id,
          error: (emailError as Error).message,
        });
        // Still return success to user but log the error
        // Add jittered delay before returning to maintain timing consistency
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
        return NextResponse.json(
          {
            error: 'Failed to send password reset email. Please try again or contact support.',
          },
          { status: 500 }
        );
      }
    } else {
      // User doesn't exist - log but don't reveal
      secureLog('[AUTH] Password reset requested for non-existent email', { email });
    }

    // Add randomized delay (800-1200ms) to prevent timing attacks
    // This makes it harder to determine if a user exists based on response time
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

    // Always return the same success message
    return NextResponse.json({
      message: 'If an account with that email exists, we sent a password reset link.',
    });
  } catch (error: any) {
    secureLog('[ERROR] Password reset request failed', { error: error.message });

    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
