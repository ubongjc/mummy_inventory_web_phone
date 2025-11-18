'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Loader2,
  CreditCard,
  Shield,
  Zap,
  Crown,
} from 'lucide-react';

function BillingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isPremium = session?.user?.isPremium || false;
  const subscriptionStatus = session?.user?.subscriptionStatus;

  useEffect(() => {
    // Show success/cancel messages from Stripe redirect
    if (searchParams.get('success') === 'true') {
      setSuccess('Subscription activated successfully! Welcome to Premium.');
    }
    if (searchParams.get('canceled') === 'true') {
      setError('Subscription upgrade was canceled.');
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed message if available (e.g., "Billing not configured")
        const errorMessage = data.message || data.error || 'Failed to create checkout session';
        throw new Error(errorMessage);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again later.');
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed message if available (e.g., "Billing portal not configured")
        const errorMessage = data.message || data.error || 'Failed to create portal session';
        throw new Error(errorMessage);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again later.');
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    router.push('/auth/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Billing & Subscription
              </h1>
              <p className="text-sm text-gray-600">
                Manage your subscription and billing
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Current Plan Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Current Plan
              </h2>
              <div className="flex items-center gap-3">
                {isPremium ? (
                  <>
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        Premium
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: {subscriptionStatus || 'Active'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Shield className="w-6 h-6 text-gray-500" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">Free</p>
                      <p className="text-sm text-gray-600">
                        15 items • 50 customers • Basic features
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {isPremium ? (
              <button
                onClick={handleManageBilling}
                disabled={loading}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Manage Billing
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">₦0</span>
                <span className="text-gray-600">/ forever</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">15 items maximum</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">50 customers maximum</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">15 active bookings</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">25 bookings per month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Last 3 months history</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  Calendar & booking management
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Email support</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full px-6 py-3 bg-gray-200 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
            >
              {isPremium ? 'Upgrade Applied' : 'Current Plan'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 border-2 border-yellow-400 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                BEST VALUE
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <p className="text-blue-100">Everything you need to grow</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">₦15,000</span>
                <span className="text-blue-100">/ month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white font-semibold">
                  Everything in Free, plus:
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  Unlimited items, customers & bookings
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Complete booking history</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Tax calculator (VAT 7.5%)</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Events near you</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  Custom analytics & revenue insights
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Online payments (Stripe)</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  Automated customer reminders
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Public booking page</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  Team collaboration (up to 5 members)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  Photo uploads & damage logging
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">QR code check-in/out</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Bundles & kits</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Delivery/pickup scheduler</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Dynamic pricing rules</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Maintenance tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">CSV/Excel exports</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">
                  Priority WhatsApp & email support
                </span>
              </li>
            </ul>

            {!isPremium && (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    Upgrade to Premium
                  </>
                )}
              </button>
            )}

            {isPremium && (
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <p className="text-white font-semibold">
                  ✨ You&apos;re on Premium!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time from the
                billing portal. You&apos;ll continue to have access to Premium
                features until the end of your current billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit and debit cards through Stripe. Your
                payment information is securely processed and never stored on
                our servers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                We offer a generous free plan that you can use indefinitely. You
                can upgrade to Premium at any time to unlock advanced features.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-gray-600">
                Your data is always safe. If you cancel Premium, you&apos;ll revert
                to the Free plan limits, but all your data will be preserved.
                You can upgrade again at any time.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
