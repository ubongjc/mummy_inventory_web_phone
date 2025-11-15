/**
 * Paystack Integration for NGN Payments
 * Handles payment initialization, verification, and webhooks
 */

import crypto from 'crypto';

export interface PaystackConfig {
  publicKey: string;
  secretKey: string;
  callbackUrl: string;
}

export interface PaymentData {
  email: string;
  amount: number; // Amount in kobo (smallest currency unit)
  reference?: string;
  metadata?: Record<string, any>;
  currency?: string;
  channels?: string[];
}

export interface PaymentResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerificationResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: Record<string, any>;
  };
}

export class PaystackService {
  private secretKey: string;
  private publicKey: string;
  private baseUrl = 'https://api.paystack.co';

  constructor(config: PaystackConfig) {
    this.secretKey = config.secretKey;
    this.publicKey = config.publicKey;
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(data: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          amount: data.amount,
          reference: data.reference || this.generateReference(),
          metadata: data.metadata,
          currency: data.currency || 'NGN',
          channels: data.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw new Error('Failed to initialize payment');
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference: string): Promise<VerificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Validate Paystack webhook signature
   */
  validateWebhook(signature: string, body: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(body)
      .digest('hex');
    return hash === signature;
  }

  /**
   * Generate a unique payment reference
   */
  private generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `RENTAL-${timestamp}-${random}`;
  }

  /**
   * Convert Naira to Kobo
   */
  static nairaToKobo(naira: number): number {
    return Math.round(naira * 100);
  }

  /**
   * Convert Kobo to Naira
   */
  static koboToNaira(kobo: number): number {
    return kobo / 100;
  }

  /**
   * Get public key for client-side integration
   */
  getPublicKey(): string {
    return this.publicKey;
  }
}

/**
 * Create a Paystack service instance
 */
export function createPaystackService(): PaystackService {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const callbackUrl = process.env.NEXT_PUBLIC_PAYSTACK_CALLBACK_URL || '/api/payment/callback';

  if (!publicKey || !secretKey) {
    throw new Error('Paystack keys not configured. Please set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY and PAYSTACK_SECRET_KEY environment variables.');
  }

  return new PaystackService({
    publicKey,
    secretKey,
    callbackUrl,
  });
}
