// Initialize Stripe payment

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createStripeService, isStripeConfigured } from '@/app/lib/stripe';
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
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe payment is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Verify authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, bookingId, description, currency = 'NGN' } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (amount > 10000000) {
      return NextResponse.json(
        { error: 'Amount cannot exceed ₦10,000,000' },
        { status: 400 }
      );
    }

    // Initialize Stripe service
    const stripeService = createStripeService();

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency: currency.toLowerCase(),
      description: description || `Payment for Booking`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.email,
        bookingId: bookingId || '',
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    console.error('Stripe payment initialization error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Payment initialization failed',
        details: 'Please ensure Stripe is properly configured'
      },
      { status: 500 }
    );
  }
}
