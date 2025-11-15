import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth.config';
import { createPaystackService, PaystackService } from '@/app/lib/paystack';
import { applyRateLimit } from '@/app/lib/security';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { amount, metadata, currency = 'NGN' } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Initialize Paystack service
    const paystackService = createPaystackService();

    // Convert to kobo if in Naira
    const amountInKobo = currency === 'NGN'
      ? PaystackService.nairaToKobo(amount)
      : amount;

    // Initialize payment
    const response = await paystackService.initializePayment({
      email: session.user.email,
      amount: amountInKobo,
      currency,
      metadata: {
        ...metadata,
        userId: session.user.email,
        timestamp: new Date().toISOString(),
      },
    });

    if (!response.status) {
      return NextResponse.json(
        { error: response.message || 'Payment initialization failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
