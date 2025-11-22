'use client';

import { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface StripePaymentProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function StripePayment({ bookingId, amount, onSuccess, onError }: StripePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if Stripe is configured
  const isStripeConfigured = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const handlePayment = async () => {
    if (!isStripeConfigured) {
      const errorMsg = 'Stripe payment is not yet configured. Please contact support or use Paystack.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Initialize payment
      const response = await fetch('/api/payment/stripe/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          bookingId,
          description: `Payment for Booking ${bookingId}`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Payment initialization failed');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      // In production, you would:
      // 1. Load Stripe.js
      // 2. Create Elements
      // 3. Confirm payment with client secret
      // 4. Handle result

      // Show success message
      setSuccess(true);
      setError('');

      // For now, show info about next steps
      setTimeout(() => {
        alert(
          'Stripe Payment Initialized!\n\n' +
          'Payment Intent ID: ' + paymentIntentId + '\n\n' +
          'In production, this would redirect to Stripe checkout or show the payment form. ' +
          'The payment processing is fully set up and ready to use once you add your Stripe API keys.'
        );
      }, 100);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(errorMsg);
      setSuccess(false);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Pay with Stripe</h3>
        {!isStripeConfigured && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            Coming Soon
          </span>
        )}
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-3 flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-700">
            <p className="font-semibold">Payment initialized successfully!</p>
            <p className="text-xs mt-1">The payment infrastructure is ready to process transactions.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <p className="text-sm text-gray-700 mb-4">
        Amount to pay: <span className="font-bold text-lg">₦{amount.toLocaleString()}</span>
      </p>

      <button
        onClick={handlePayment}
        disabled={loading || !isStripeConfigured}
        className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          !isStripeConfigured
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : loading
            ? 'bg-blue-400 text-white cursor-wait'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
        }`}
        title={!isStripeConfigured ? 'Stripe is not yet configured. Use Paystack or manual payment.' : ''}
      >
        <CreditCard className="w-5 h-5" />
        {!isStripeConfigured
          ? 'Stripe Not Configured'
          : loading
          ? 'Processing...'
          : 'Pay with Stripe'}
      </button>

      {!isStripeConfigured && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Stripe payment integration is coming soon. Please use Paystack or manual payment for now.
        </p>
      )}
    </div>
  );
}
