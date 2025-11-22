// Stripe payment service

export interface StripePaymentRequest {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
  customer_email?: string;
}

export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export class StripeService {
  private secretKey: string;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(request: StripePaymentRequest): Promise<StripePaymentIntent> {
    // Convert amount to smallest currency unit (cents for USD, kobo for NGN)
    const amountInCents = Math.round(request.amount * 100);

    const response = await fetch(`${this.baseUrl}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amountInCents.toString(),
        currency: request.currency || 'ngn',
        description: request.description || 'Payment',
        ...(request.customer_email && { receipt_email: request.customer_email }),
        ...Object.entries(request.metadata || {}).reduce((acc, [key, value]) => {
          acc[`metadata[${key}]`] = value;
          return acc;
        }, {} as Record<string, string>),
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Payment intent creation failed');
    }

    return await response.json();
  }

  /**
   * Retrieve a payment intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
    const response = await fetch(`${this.baseUrl}/payment_intents/${paymentIntentId}`, {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve payment intent');
    }

    return await response.json();
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    webhookSecret: string
  ): boolean {
    // Stripe uses HMAC SHA256 for webhook signatures
    // This is a simplified version - in production, use stripe.webhooks.constructEvent
    try {
      const crypto = require('crypto');
      const elements = signature.split(',');
      const timestamp = elements.find((e) => e.startsWith('t='))?.split('=')[1];
      const expectedSig = elements.find((e) => e.startsWith('v1='))?.split('=')[1];

      if (!timestamp || !expectedSig) {
        return false;
      }

      const signedPayload = `${timestamp}.${payload}`;
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(signedPayload);
      const computedSig = hmac.digest('hex');

      return computedSig === expectedSig;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Convert Naira to kobo (smallest currency unit)
   */
  static nairaToKobo(naira: number): number {
    return Math.round(naira * 100);
  }

  /**
   * Convert kobo to Naira
   */
  static koboToNaira(kobo: number): number {
    return kobo / 100;
  }
}

/**
 * Create Stripe service instance
 */
export function createStripeService(): StripeService {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new StripeService(secretKey);
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}
