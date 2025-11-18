'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Globe,
  Bell,
  CreditCard,
  Users,
  BarChart3,
  Lock,
  Calculator,
  BellRing,
  FileDown,
  MapPin,
  Loader2,
  Settings,
  ExternalLink,
} from 'lucide-react';

export default function PremiumPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const isPremium = session?.user?.isPremium || false;

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Premium users see the features dashboard
  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-white shadow-lg border-b-2">
          <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg font-semibold transition-all duration-200 shadow-md text-xs md:text-sm"
              >
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="flex-1">
                <h1 className="text-sm md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1 md:gap-2">
                  <Sparkles className="w-4 h-4 md:w-7 md:h-7 text-yellow-500" />
                  <span className="hidden sm:inline">Premium Features</span>
                  <span className="sm:hidden">Premium</span>
                </h1>
                <p className="text-[10px] md:text-sm text-gray-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  Active Premium Subscription
                </p>
              </div>
              <Link
                href="/billing"
                className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm bg-white border-2 border-gray-300 hover:border-gray-400 rounded-lg transition-all"
              >
                <Settings className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Manage</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8 space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 md:p-8 text-white">
            <h2 className="text-xl md:text-3xl font-bold mb-2">Welcome to Premium! 🎉</h2>
            <p className="text-sm md:text-lg opacity-90">
              You now have access to all premium features. Select any feature below to get started.
            </p>
          </div>

          {/* Premium Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tax Calculator */}
            <Link
              href="/settings"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <Calculator className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-between">
                    Tax Calculator
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure tax settings for automatic calculation on all rentals
                  </p>
                </div>
              </div>
              <div className="text-xs text-blue-600 font-semibold">Configure in Settings →</div>
            </Link>

            {/* Events Near You */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Events Near You</h3>
                  <p className="text-sm text-gray-600">
                    Get notified about local events that could need your rentals
                  </p>
                </div>
              </div>
              <div className="text-xs text-purple-600 font-semibold">Coming Soon</div>
            </div>

            {/* Custom Analytics */}
            <Link
              href="/admin/analytics"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-600 transition-colors">
                  <BarChart3 className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-between">
                    Custom Analytics
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                  </h3>
                  <p className="text-sm text-gray-600">
                    Track revenue, utilization rates, and identify top items
                  </p>
                </div>
              </div>
              <div className="text-xs text-green-600 font-semibold">View Analytics →</div>
            </Link>

            {/* Online Payments */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Online Payments</h3>
                  <p className="text-sm text-gray-600">
                    Accept secure payments through Stripe integration
                  </p>
                </div>
              </div>
              <div className="text-xs text-orange-600 font-semibold">Coming Soon</div>
            </div>

            {/* Customer Reminders */}
            <Link
              href="/settings"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-pink-500 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-600 transition-colors">
                  <BellRing className="w-6 h-6 text-pink-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-between">
                    Customer Reminders
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-pink-600" />
                  </h3>
                  <p className="text-sm text-gray-600">
                    Send automated reminders for rentals and returns
                  </p>
                </div>
              </div>
              <div className="text-xs text-pink-600 font-semibold">Configure in Settings →</div>
            </Link>

            {/* Automated Notifications */}
            <Link
              href="/settings"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-500 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-colors">
                  <Bell className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-between">
                    Smart Notifications
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get alerts for overdue payments and low stock
                  </p>
                </div>
              </div>
              <div className="text-xs text-indigo-600 font-semibold">Configure in Settings →</div>
            </Link>

            {/* Public Booking Page */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-cyan-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-cyan-100 rounded-lg">
                  <Globe className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Public Booking Page</h3>
                  <p className="text-sm text-gray-600">
                    Share a custom link for customers to check availability
                  </p>
                </div>
              </div>
              <div className="text-xs text-cyan-600 font-semibold">Coming Soon</div>
            </div>

            {/* Team Collaboration */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-rose-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-rose-100 rounded-lg">
                  <Users className="w-6 h-6 text-rose-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Team Collaboration</h3>
                  <p className="text-sm text-gray-600">
                    Add team members with custom roles and permissions
                  </p>
                </div>
              </div>
              <div className="text-xs text-rose-600 font-semibold">Coming Soon</div>
            </div>

            {/* Data Export */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <FileDown className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Data Export</h3>
                  <p className="text-sm text-gray-600">
                    Export your data in CSV, Excel, or PDF formats
                  </p>
                </div>
              </div>
              <div className="text-xs text-emerald-600 font-semibold">Available in all pages</div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              As a premium member, you get priority support via email and WhatsApp. If you have any questions about using these features, feel free to reach out!
            </p>
            <Link
              href="/billing"
              className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-sm transition-all"
            >
              Manage Subscription
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Non-premium users see the upgrade page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg font-semibold transition-all duration-200 shadow-md text-xs md:text-sm"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-sm md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-1 md:gap-2">
                <Sparkles className="w-4 h-4 md:w-7 md:h-7 text-yellow-500" />
                <span className="hidden sm:inline">Very Simple Inventory - Premium Features</span>
                <span className="sm:hidden">Premium Features</span>
              </h1>
              <p className="text-[10px] md:text-sm text-gray-600">Grow your rental business</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8 space-y-6 md:space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-lg md:text-4xl font-bold text-black mb-2 md:mb-4">
            Unlock Premium Features
          </h2>
          <p className="text-xs md:text-lg text-gray-700">
            Upgrade to Premium for ₦15,000/month and unlock unlimited growth for your rental business
          </p>
          <div className="mt-4 md:mt-6">
            <Link
              href="/billing"
              className="inline-block px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg md:rounded-xl font-bold text-sm md:text-lg shadow-lg transition-all"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-12 border-4 border-yellow-200">
          <div className="grid grid-cols-2 gap-2 md:gap-6">
            {/* Tax Calculator */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-2xl border border-blue-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-blue-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Calculator className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Tax Calculator</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Automatically calculate taxes on rentals based on your location
                </p>
              </div>
            </div>

            {/* Events Near You */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg md:rounded-2xl border border-purple-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-purple-600 rounded-lg md:rounded-xl flex-shrink-0">
                <MapPin className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Events Near You</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Get notified about local events that could need your rentals
                </p>
              </div>
            </div>

            {/* Custom Analytics */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg md:rounded-2xl border border-green-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-green-600 rounded-lg md:rounded-xl flex-shrink-0">
                <BarChart3 className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Custom Analytics</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Track utilization rates and revenue trends
                </p>
              </div>
            </div>

            {/* Online Payments */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg md:rounded-2xl border border-orange-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-orange-600 rounded-lg md:rounded-xl flex-shrink-0">
                <CreditCard className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Online Payments</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Let customers pay securely through Stripe
                </p>
              </div>
            </div>

            {/* Customer Reminders */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg md:rounded-2xl border border-pink-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-pink-600 rounded-lg md:rounded-xl flex-shrink-0">
                <BellRing className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Customer Reminders</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Send automated reminders to customers
                </p>
              </div>
            </div>

            {/* Automated Notifications */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg md:rounded-2xl border border-indigo-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-indigo-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Bell className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Smart Notifications</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Email and SMS alerts for important events
                </p>
              </div>
            </div>

            {/* Public Booking Page */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg md:rounded-2xl border border-cyan-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-cyan-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Globe className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Public Booking Page</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Share a custom link for customer inquiries
                </p>
              </div>
            </div>

            {/* Team Collaboration */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg md:rounded-2xl border border-rose-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-rose-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Users className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Team Collaboration</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Add team members with custom permissions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-8 border border-gray-200">
          <div className="flex items-start gap-2 md:gap-4">
            <div className="p-2 md:p-3 bg-blue-100 rounded-lg md:rounded-xl">
              <Lock className="w-5 h-5 md:w-8 md:h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm md:text-xl font-bold text-black mb-1 md:mb-2">
                Secure & Reliable
              </h3>
              <p className="text-xs md:text-base text-gray-600 mb-2 md:mb-4">
                Your data is encrypted and backed up daily. Industry-standard security practices.
              </p>
              <ul className="space-y-1 md:space-y-2">
                <li className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-700">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                  Cancel anytime, no questions asked
                </li>
                <li className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-700">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                  14-day money-back guarantee
                </li>
                <li className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-700">
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                  No setup fees or hidden charges
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
