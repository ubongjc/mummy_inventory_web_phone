import { NextRequest, NextResponse } from 'next/server';
import { createPaystackService } from '@/app/lib/paystack';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Get the signature from headers
    const signature = req.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Get the raw body as text
    const body = await req.text();

    // Initialize Paystack service
    const paystackService = createPaystackService();

    // Validate webhook signature
    const isValid = paystackService.validateWebhook(signature, body);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the body
    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;

      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;

      case 'subscription.create':
        await handleSubscriptionCreated(event.data);
        break;

      case 'subscription.disable':
        await handleSubscriptionDisabled(event.data);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const { reference, amount, customer, metadata } = data;

    console.log('Payment successful:', {
      reference,
      amount,
      email: customer.email,
      metadata,
    });

    // Update user's premium status
    if (metadata?.userId) {
      await prisma.subscription.upsert({
        where: { userId: metadata.userId },
        create: {
          userId: metadata.userId,
          plan: 'premium',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          plan: 'premium',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          updatedAt: new Date(),
        },
      });

      console.log('User upgraded to premium plan:', metadata.userId);
    }

    // TODO: Send confirmation email
    // TODO: Log transaction in payment history table
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { reference, customer } = data;

    console.log('Payment failed:', {
      reference,
      email: customer.email,
    });

    // TODO: Send failure notification
    // TODO: Log failed transaction
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function handleSubscriptionCreated(data: any) {
  try {
    console.log('Subscription created:', data);
    // TODO: Handle subscription creation
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

async function handleSubscriptionDisabled(data: any) {
  try {
    console.log('Subscription disabled:', data);
    // TODO: Handle subscription cancellation
  } catch (error) {
    console.error('Error handling subscription disable:', error);
  }
}
