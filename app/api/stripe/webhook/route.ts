import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import Stripe from "stripe";

// Check for required Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY not configured. Webhooks will be disabled.");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn("STRIPE_WEBHOOK_SECRET not configured. Webhooks cannot be verified.");
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      console.error("Webhook received but Stripe is not configured");
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    if (!webhookSecret) {
      console.error("Webhook received but STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 503 }
      );
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!stripe) {
    console.error("Stripe not configured");
    return;
  }

  const userId = session.metadata?.userId;
  const customerId = session.customer as string;

  if (!userId) {
    console.error("No userId in checkout session metadata");
    return;
  }

  // Get the subscription
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.error("No subscription ID in checkout session");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update or create subscription record
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      stripeSubscriptionId: subscriptionId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Update user's isPremium flag
  const isPremium = ["active", "trialing"].includes(subscription.status);
  await prisma.user.update({
    where: { id: userId },
    data: { isPremium },
  });

  console.log(
    `Subscription activated for user ${userId}: ${subscription.status}`
  );
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find subscription by Stripe customer ID
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!dbSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Update user's isPremium flag
  const isPremium = ["active", "trialing"].includes(subscription.status);
  await prisma.user.update({
    where: { id: dbSubscription.userId },
    data: { isPremium },
  });

  console.log(
    `Subscription updated for user ${dbSubscription.userId}: ${subscription.status}`
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find subscription by Stripe customer ID
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!dbSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Update subscription status to canceled
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: "canceled",
      cancelAtPeriodEnd: false,
    },
  });

  // Set isPremium to false
  await prisma.user.update({
    where: { id: dbSubscription.userId },
    data: { isPremium: false },
  });

  console.log(`Subscription canceled for user ${dbSubscription.userId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  // Find subscription
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!dbSubscription) {
    return;
  }

  // Ensure subscription is active
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: { status: "active" },
  });

  // Ensure isPremium is true
  await prisma.user.update({
    where: { id: dbSubscription.userId },
    data: { isPremium: true },
  });

  console.log(`Invoice paid for user ${dbSubscription.userId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Find subscription
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!dbSubscription) {
    return;
  }

  // Update status to past_due
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: { status: "past_due" },
  });

  // Keep isPremium true for grace period, but status shows past_due
  // The subscription will be canceled by Stripe after retry attempts

  console.log(`Invoice payment failed for user ${dbSubscription.userId}`);
}
