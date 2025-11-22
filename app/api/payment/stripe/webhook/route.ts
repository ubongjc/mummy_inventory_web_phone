// Stripe webhook handler

import { NextRequest, NextResponse } from 'next/server';
import { createStripeService } from '@/app/lib/stripe';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const payload = await req.text();
    const stripeService = createStripeService();

    // Verify webhook signature
    const isValid = stripeService.verifyWebhookSignature(payload, signature, webhookSecret);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(payload);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const bookingId = paymentIntent.metadata?.bookingId;
    if (!bookingId) {
      console.error('No bookingId in payment metadata');
      return;
    }

    // Get booking to find userId
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true },
    });

    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return;
    }

    // Convert amount from cents/kobo to main currency unit
    const amount = paymentIntent.amount / 100;

    // Record payment
    await prisma.payment.create({
      data: {
        bookingId,
        amount,
        paymentDate: new Date(),
        notes: `Stripe payment (${paymentIntent.id})`,
      },
    });

    console.log(`Payment recorded for booking ${bookingId}: ${amount}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  console.error('Payment failed:', {
    id: paymentIntent.id,
    error: paymentIntent.last_payment_error,
  });
  // Could send notification to user or admin here
}
