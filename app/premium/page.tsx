'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Star,
  Package,
  ShoppingCart,
} from 'lucide-react';

export default function PremiumPage() {
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
              <p className="text-[10px] md:text-sm text-gray-600">Upgrade to unlock more</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8 space-y-4 md:space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1 md:gap-2 bg-purple-100 text-purple-700 px-2 py-1 md:px-4 md:py-2 rounded-full font-semibold text-xs md:text-sm mb-2 md:mb-4">
            <Star className="w-3 h-3 md:w-4 md:h-4" />
            Free vs Premium
          </div>
          <h2 className="text-lg md:text-4xl font-bold text-black mb-2 md:mb-4">
            Upgrade When You're Ready to Grow
          </h2>
          <p className="text-xs md:text-lg text-gray-700">
            Start with our generous free plan. Upgrade to Premium when your business outgrows the free limits.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-3 gap-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-gray-200">
            <div className="p-2 md:p-6">
              <h4 className="text-xs md:text-xl font-bold text-gray-900">Feature</h4>
            </div>
            <div className="p-2 md:p-6 text-center border-l border-gray-200">
              <h4 className="text-xs md:text-xl font-bold text-gray-900">Free</h4>
              <p className="text-[10px] md:text-sm text-gray-600 mt-1">Current Plan</p>
            </div>
            <div className="p-2 md:p-6 text-center border-l border-gray-200 bg-gradient-to-br from-purple-100 to-blue-100">
              <h4 className="text-xs md:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Premium</h4>
              <p className="text-[10px] md:text-sm text-purple-700 mt-1 font-semibold">Coming Soon</p>
            </div>
          </div>

          {/* Inventory Limits */}
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Items</h5>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-900">15 items</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700">Unlimited</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Customers</h5>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-900">50 customers</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700">Unlimited</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Active Bookings</h5>
                <p className="text-[8px] md:text-xs text-gray-500">CONFIRMED + OUT</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-900">15 concurrent</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700">Unlimited</p>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-gray-300">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Bookings Per Month</h5>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-900">25/month</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700">Unlimited</p>
              </div>
            </div>
          </div>

          {/* Time-Based Limits */}
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Booking History</h5>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-900">Last 3 months</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700">Unlimited</p>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-gray-300">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Data Export</h5>
                <p className="text-[8px] md:text-xs text-gray-500">Excel/CSV</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700"><CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline" /></p>
              </div>
            </div>
          </div>

          {/* Feature Limits */}
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Photos Per Item</h5>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-500">0 photos</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700">5 photos</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Notifications</h5>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-500">Manual only</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700">Automated</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Public Booking Page</h5>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700"><CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline" /></p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Team Members</h5>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-900">1 user</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700">Up to 5 users</p>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-gray-300">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Wholesale Supplier Connection</h5>
                <p className="text-[8px] md:text-xs text-gray-500">Connect with suppliers for chairs, tables, carpets, etc.</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700"><CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline" /></p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-2 md:p-4">
                <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Support</h5>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200">
                <p className="text-[10px] md:text-base font-bold text-gray-900">Email only</p>
              </div>
              <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                <p className="text-[10px] md:text-base font-bold text-purple-700">Priority + WhatsApp</p>
              </div>
            </div>
          </div>

          {/* CTA Row */}
          <div className="grid grid-cols-3 gap-0 bg-gradient-to-r from-gray-50 to-purple-50">
            <div className="p-2 md:p-6"></div>
            <div className="p-2 md:p-6 text-center border-l border-gray-200">
              <div className="px-2 py-1 md:px-6 md:py-3 bg-gray-400 text-white font-bold rounded-lg shadow-md text-[10px] md:text-base cursor-default">
                Current Plan
              </div>
            </div>
            <div className="p-2 md:p-6 text-center border-l border-gray-200">
              <div className="px-2 py-1 md:px-6 md:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg shadow-md text-[10px] md:text-base opacity-60 cursor-not-allowed">
                Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {/* Why Upgrade */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-200">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg">
                <Star className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xs md:text-lg font-bold text-black mb-1 md:mb-2">
                  Why Upgrade to Premium?
                </h3>
                <ul className="space-y-0.5 md:space-y-1 text-[10px] md:text-sm text-gray-700">
                  <li className="flex items-start gap-1 md:gap-2">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>No limits on items, customers, or bookings</span>
                  </li>
                  <li className="flex items-start gap-1 md:gap-2">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Full booking history and data exports for accounting</span>
                  </li>
                  <li className="flex items-start gap-1 md:gap-2">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Automated notifications save time</span>
                  </li>
                  <li className="flex items-start gap-1 md:gap-2">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>WhatsApp support (highly valued in Nigeria)</span>
                  </li>
                  <li className="flex items-start gap-1 md:gap-2">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Connect with wholesale suppliers for better prices</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Free Plan Info */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-200">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                <Package className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xs md:text-lg font-bold text-black mb-1 md:mb-2">
                  Free Plan is Perfect for Starting
                </h3>
                <ul className="space-y-0.5 md:space-y-1 text-[10px] md:text-sm text-gray-700">
                  <li className="flex items-start gap-1 md:gap-2">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>15 items is enough for micro-businesses to test</span>
                  </li>
                  <li className="flex items-start gap-1 md:gap-2">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>50 customers allows meaningful testing</span>
                  </li>
                  <li className="flex items-start gap-1 md:gap-2">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>25 bookings/month shows the system works</span>
                  </li>
                  <li className="flex items-start gap-1 md:gap-2">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>No credit card required</span>
                  </li>
                  <li className="flex items-start gap-1 md:gap-2">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Upgrade anytime as your business grows</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg md:rounded-2xl shadow-xl p-4 md:p-6 text-center text-white">
          <h3 className="text-sm md:text-2xl font-bold mb-1 md:mb-2">
            Premium Features Coming Soon
          </h3>
          <p className="text-xs md:text-base mb-2 md:mb-4">
            We're working hard to bring you Premium features. Keep using the free plan and we'll notify you when Premium is ready!
          </p>
          <div className="inline-flex items-center gap-1 md:gap-2 bg-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold">
            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
            Estimated Launch: Q2 2025
          </div>
        </div>
      </main>
    </div>
  );
}
