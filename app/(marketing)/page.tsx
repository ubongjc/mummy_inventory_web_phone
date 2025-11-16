'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Package,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  Clock,
  Smartphone,
  BarChart3,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function HomePage() {
  const { data: _session, status } = useSession();
  const router = useRouter();
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b-2 border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Package className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                Very Simple Inventory
              </h1>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Link
                href="/auth/sign-in"
                className="px-2.5 py-1 md:px-4 md:py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md text-xs md:text-base whitespace-nowrap"
              >
                Log In
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-2.5 py-1 md:px-4 md:py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md text-xs md:text-base whitespace-nowrap"
              >
                <span className="md:hidden">Sign Up</span>
                <span className="hidden md:inline">Sign Up Free</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold text-xs mb-4">
            <Zap className="w-3 h-3" />
            Simple. Powerful. Affordable.
          </div>
          <h2 className="text-2xl md:text-6xl font-bold text-gray-900 mb-4">
            Rental Inventory Management
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h2>
          <p className="text-sm md:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Manage your rental business with ease. Track inventory, bookings, and customers all in
            one place. No complicated setup, no hidden fees.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
            <Link
              href="/auth/sign-up"
              className="w-full md:w-auto px-3 py-2 md:px-8 md:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg md:rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-sm md:text-lg flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="w-full md:w-auto px-3 py-2 md:px-8 md:py-4 bg-white text-gray-700 font-bold rounded-lg md:rounded-xl hover:bg-gray-50 transition-all shadow-md border-2 border-gray-200 text-sm md:text-lg"
            >
              Log In
            </Link>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-3">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-16 bg-white rounded-2xl md:rounded-3xl shadow-xl mb-4 md:mb-16">
        <div className="text-center mb-4 md:mb-12">
          <h3 className="text-lg md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
            Everything You Need to Run Your Rental Business
          </h3>
          <p className="text-sm md:text-lg text-gray-600">
            Powerful features designed for rental businesses of all sizes
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8">
          {/* Feature 1 */}
          <div className="p-3 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-2xl border-2 border-blue-200">
            <div className="p-2 md:p-3 bg-blue-600 rounded-lg md:rounded-xl w-fit mb-2 md:mb-4">
              <CalendarDays className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <h4 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Visual Calendar</h4>
            <p className="text-[10px] md:text-base text-gray-600">
              See all your bookings at a glance with an intuitive calendar view. Quickly spot
              conflicts and available dates.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-3 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg md:rounded-2xl border-2 border-purple-200">
            <div className="p-2 md:p-3 bg-purple-600 rounded-lg md:rounded-xl w-fit mb-2 md:mb-4">
              <Package className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <h4 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Inventory Tracking</h4>
            <p className="text-[10px] md:text-base text-gray-600">
              Manage your rental items with ease. Track quantities, availability, and get low stock
              alerts automatically.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-3 md:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg md:rounded-2xl border-2 border-green-200">
            <div className="p-2 md:p-3 bg-green-600 rounded-lg md:rounded-xl w-fit mb-2 md:mb-4">
              <Users className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <h4 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Customer Management</h4>
            <p className="text-[10px] md:text-base text-gray-600">
              Keep track of your customers and their booking history. Build better relationships and
              improve service.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-3 md:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg md:rounded-2xl border-2 border-orange-200">
            <div className="p-2 md:p-3 bg-orange-600 rounded-lg md:rounded-xl w-fit mb-2 md:mb-4">
              <BarChart3 className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <h4 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Real-time Analytics</h4>
            <p className="text-[10px] md:text-base text-gray-600">
              Track your business performance with detailed analytics. Monitor revenue, bookings,
              and popular items.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-3 md:p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg md:rounded-2xl border-2 border-pink-200">
            <div className="p-2 md:p-3 bg-pink-600 rounded-lg md:rounded-xl w-fit mb-2 md:mb-4">
              <Clock className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <h4 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Availability Checker</h4>
            <p className="text-[10px] md:text-base text-gray-600">
              Instantly check item availability for any date range. Speed up customer inquiries and
              bookings.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-3 md:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg md:rounded-2xl border-2 border-indigo-200">
            <div className="p-2 md:p-3 bg-indigo-600 rounded-lg md:rounded-xl w-fit mb-2 md:mb-4">
              <Smartphone className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <h4 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Mobile Friendly</h4>
            <p className="text-[10px] md:text-base text-gray-600">
              Access your inventory from anywhere. Fully responsive design works perfectly on phones
              and tablets.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-16 mb-4 md:mb-16">
        <div className="text-center mb-4 md:mb-12">
          <h3 className="text-lg md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
            Get Started in Minutes
          </h3>
          <p className="text-sm md:text-lg text-gray-600">
            Three simple steps to start managing your rental inventory
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-8">
          <div className="text-center">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-base md:text-2xl font-bold mx-auto mb-2 md:mb-4">
              1
            </div>
            <h4 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Sign Up Free</h4>
            <p className="text-[10px] md:text-base text-gray-600">
              Create your account in seconds. No credit card required to get started.
            </p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center text-base md:text-2xl font-bold mx-auto mb-2 md:mb-4">
              2
            </div>
            <h4 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Add Your Items</h4>
            <p className="text-[10px] md:text-base text-gray-600">
              Quickly add your rental inventory items with quantities and details.
            </p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-pink-500 to-orange-600 text-white rounded-full flex items-center justify-center text-base md:text-2xl font-bold mx-auto mb-2 md:mb-4">
              3
            </div>
            <h4 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Start Booking</h4>
            <p className="text-[10px] md:text-base text-gray-600">
              Create bookings, track availability, and grow your rental business.
            </p>
          </div>
        </div>
      </section>

      {/* Free vs Premium Comparison */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-16 mb-4 md:mb-16">
        <div className="text-center mb-4 md:mb-12">
          <div className="inline-flex items-center gap-1 md:gap-2 bg-purple-100 text-purple-700 px-2 py-1 md:px-4 md:py-2 rounded-full font-semibold text-xs md:text-sm mb-2 md:mb-4">
            <Star className="w-3 h-3 md:w-4 md:h-4" />
            Free vs Premium
          </div>
          <h3 className="text-lg md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
            Choose the Plan That&apos;s Right for You
          </h3>
          <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto mb-4">
            Start with our generous free plan and upgrade to Premium when your business grows.
            No credit card required to get started.
          </p>

          {/* Dropdown Toggle Button */}
          <button
            onClick={() => setIsComparisonOpen(!isComparisonOpen)}
            className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md text-sm md:text-base"
          >
            {isComparisonOpen ? 'Hide' : 'Show'} Plan Comparison
            {isComparisonOpen ? (
              <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
        </div>

        {/* Comparison Table - Collapsible */}
        {isComparisonOpen && (
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-3 gap-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-gray-200">
              <div className="p-2 md:p-6">
                <h4 className="text-xs md:text-xl font-bold text-gray-900">Feature</h4>
              </div>
              <div className="p-2 md:p-6 text-center border-l border-gray-200">
                <h4 className="text-xs md:text-xl font-bold text-gray-900">Free</h4>
                <p className="text-[10px] md:text-sm text-gray-600 mt-1">Perfect to start</p>
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
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-900">15 active bookings</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                  <p className="text-[10px] md:text-base font-bold text-purple-700">Unlimited</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-2 md:p-4">
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Bookings Per Month</h5>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-900">25 per month</p>
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

            <div className="border-b border-gray-200">
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

            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-2 md:p-4">
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Wholesale Supplier Connection</h5>
                  <p className="text-[8px] md:text-xs text-gray-500">Connect with suppliers for cheaper rental materials</p>
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
                  <p className="text-[10px] md:text-base font-bold text-purple-700">Priority email + WhatsApp</p>
                </div>
              </div>
            </div>

            {/* Premium Features */}
            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-2 md:p-4">
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Tax Calculator</h5>
                  <p className="text-[8px] md:text-xs text-gray-500">Automatic tax calculations for bookings</p>
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
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Events Near You</h5>
                  <p className="text-[8px] md:text-xs text-gray-500">Discover upcoming events in your area</p>
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
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Custom Analytics</h5>
                  <p className="text-[8px] md:text-xs text-gray-500">Advanced reporting and insights</p>
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
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Online Payments</h5>
                  <p className="text-[8px] md:text-xs text-gray-500">Accept payments directly through the platform</p>
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
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Customer Reminders</h5>
                  <p className="text-[8px] md:text-xs text-gray-500">Automated reminders for pickups and returns</p>
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
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Automated Notifications</h5>
                  <p className="text-[8px] md:text-xs text-gray-500">Automatic alerts for bookings and payments</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                  <p className="text-[10px] md:text-base font-bold text-purple-700"><CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline" /></p>
                </div>
              </div>
            </div>

            {/* CTA Row */}
            <div className="grid grid-cols-3 gap-0 bg-gradient-to-r from-gray-50 to-purple-50">
              <div className="p-2 md:p-6"></div>
              <div className="p-2 md:p-6 text-center border-l border-gray-200">
                <Link
                  href="/auth/sign-up"
                  className="w-full inline-block px-2 py-1 md:px-6 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md text-[10px] md:text-base"
                >
                  Start Free
                </Link>
              </div>
              <div className="p-2 md:p-6 text-center border-l border-gray-200">
                <div className="px-2 py-1 md:px-6 md:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg shadow-md text-[10px] md:text-base opacity-60 cursor-not-allowed">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Contact Us Section */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-16 mb-4 md:mb-16">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-12">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-lg md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Get in Touch
            </h3>
            <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-8">
              Have questions or need help? We&apos;re here to assist you with your rental inventory management needs.
            </p>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 md:p-6 border-2 border-blue-200">
              <p className="text-xs md:text-base text-gray-700 mb-2">
                <strong>Email Us:</strong>
              </p>
              <a
                href="mailto:contact@verysimpleinventory.com"
                className="text-sm md:text-xl font-bold text-blue-600 hover:text-purple-600 transition-all"
              >
                contact@verysimpleinventory.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16 mb-8 md:mb-16">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 text-center">
          <h3 className="text-xl md:text-4xl font-bold text-white mb-3 md:mb-6">
            Ready to Simplify Your Rental Business?
          </h3>
          <p className="text-sm md:text-xl text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of rental businesses already using Very Simple Inventory. Start your free
            account today.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
            <Link
              href="/auth/sign-up"
              className="w-full md:w-auto px-3 py-2 md:px-8 md:py-4 bg-white text-blue-600 font-bold rounded-lg md:rounded-xl hover:bg-gray-100 transition-all shadow-lg text-sm md:text-lg flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="w-full md:w-auto px-3 py-2 md:px-8 md:py-4 bg-blue-700 text-white font-bold rounded-lg md:rounded-xl hover:bg-blue-800 transition-all text-sm md:text-lg border-2 border-white/20"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-900">Very Simple Inventory</h4>
          </div>
          <p className="text-gray-600 text-sm text-center mb-4">
            Simple rental inventory management for businesses of all sizes.
          </p>
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 Very Simple Inventory. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
