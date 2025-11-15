import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth.config';
import { createPaystackService } from '@/app/lib/paystack';
import { applyRateLimit } from '@/app/lib/security';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(req);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Initialize Paystack service
    const paystackService = createPaystackService();

    // Verify payment
    const response = await paystackService.verifyPayment(reference);

    if (!response.status) {
      return NextResponse.json(
        { error: response.message || 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (response.data?.status !== 'success') {
      return NextResponse.json(
        {
          success: false,
          status: response.data?.status,
          message: 'Payment was not successful',
        },
        { status: 400 }
      );
    }

    // TODO: Update user's subscription or premium status in database
    // This is where you would update the Settings table with premium features
    // Example:
    // await prisma.settings.update({
    //   where: { userId: session.user.email },
    //   data: {
    //     plan: 'premium',
    //     updatedAt: new Date(),
    //   },
    // });

    return NextResponse.json({
      success: true,
      data: {
        reference: response.data.reference,
        amount: response.data.amount,
        currency: response.data.currency,
        status: response.data.status,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
