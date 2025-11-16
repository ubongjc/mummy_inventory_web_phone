'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
  Globe,
  MapPin,
  Bell,
  CreditCard,
  Headphones,
  Calculator,
  MessageSquare,
} from 'lucide-react';

export default function HomePage() {
  const { data: _session, status } = useSession();
  const router = useRouter();

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

      {/* Premium Features - Coming Soon */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-16 mb-4 md:mb-16">
        <div className="text-center mb-4 md:mb-12">
          <div className="inline-flex items-center gap-1 md:gap-2 bg-purple-100 text-purple-700 px-2 py-1 md:px-4 md:py-2 rounded-full font-semibold text-xs md:text-sm mb-2 md:mb-4">
            <Clock className="w-3 h-3 md:w-4 md:h-4" />
            Coming Soon
          </div>
          <h3 className="text-lg md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
            Premium Features on the Way
          </h3>
          <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto">
            We're working hard to bring you advanced features to take your rental business to the next level.
            These features are currently in development and will be available soon.
          </p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
            {/* Premium Feature 1 */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-2xl border border-blue-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-blue-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Globe className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Public Booking Page</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Share a custom link so customers can check availability and inquire about rentals directly on your branded page
                </p>
              </div>
            </div>

            {/* Premium Feature 2 */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg md:rounded-2xl border border-purple-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-purple-600 rounded-lg md:rounded-xl flex-shrink-0">
                <MapPin className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Events Near You</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Get notified about local events like weddings, festivals, and conferences that could need your rentals
                </p>
              </div>
            </div>

            {/* Premium Feature 3 */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg md:rounded-2xl border border-green-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-green-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Bell className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Smart Notifications</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Email and SMS alerts for new inquiries, overdue payments, low stock, and upcoming events
                </p>
              </div>
            </div>

            {/* Premium Feature 4 */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg md:rounded-2xl border border-orange-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-orange-600 rounded-lg md:rounded-xl flex-shrink-0">
                <BarChart3 className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Custom Analytics</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Track utilization rates, revenue trends, conversion rates, and identify your most profitable items
                </p>
              </div>
            </div>

            {/* Premium Feature 5 */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg md:rounded-2xl border border-pink-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-pink-600 rounded-lg md:rounded-xl flex-shrink-0">
                <CreditCard className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Online Payments</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Let customers pay securely through the app with Stripe. Automatic payment tracking and receipts
                </p>
              </div>
            </div>

            {/* Premium Feature 6 */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg md:rounded-2xl border border-indigo-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-indigo-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Headphones className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Priority Support</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Get faster response times and dedicated support for your rental business
                </p>
              </div>
            </div>

            {/* Premium Feature 7 - Tax Calculator */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg md:rounded-2xl border border-teal-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-teal-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Calculator className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Tax Calculator</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Calculate taxes automatically with helpful links to pay taxes or get professional tax assistance
                </p>
              </div>
            </div>

            {/* Premium Feature 8 - Customer Reminders */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg md:rounded-2xl border border-rose-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-rose-600 rounded-lg md:rounded-xl flex-shrink-0">
                <MessageSquare className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Customer Reminders</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Automatic reminders sent one day before rental due, on the rental day, and one day after if late
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-2 mt-2 md:mt-8 p-3 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg md:rounded-2xl border md:border-2 border-blue-200 text-center">
            <p className="text-xs md:text-base text-gray-700 font-semibold mb-1 md:mb-2">
              Want to be notified when premium features launch?
            </p>
            <p className="text-[10px] md:text-base text-gray-600">
              Sign up for a free account now and we'll let you know as soon as these features become available.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-16 mb-4 md:mb-16">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-12">
          <div className="grid md:grid-cols-2 gap-4 md:gap-12 items-center">
            <div>
              <h3 className="text-lg md:text-4xl font-bold text-gray-900 mb-2 md:mb-6">
                About Very Simple Inventory
              </h3>
              <p className="text-xs md:text-lg text-gray-600 mb-2 md:mb-4">
                We built Very Simple Inventory because rental businesses deserve better tools.
                Managing inventory, bookings, and customers shouldn't be complicated or expensive.
              </p>
              <p className="text-xs md:text-lg text-gray-600 hidden md:block mb-4">
                Our mission is to help rental businesses of all sizes streamline their operations,
                reduce manual work, and focus on what matters most: growing their business and
                serving their customers.
              </p>
              <p className="text-xs md:text-lg text-gray-600 hidden md:block">
                Whether you're renting equipment, party supplies, or anything in between, Very
                Simple Inventory gives you the tools you need to succeed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 md:p-6 rounded-lg md:rounded-2xl border md:border-2 border-blue-200">
                <TrendingUp className="w-4 h-4 md:w-8 md:h-8 text-blue-600 mb-1 md:mb-2" />
                <div className="text-base md:text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-[10px] md:text-base text-gray-600">Active Users</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 md:p-6 rounded-lg md:rounded-2xl border md:border-2 border-purple-200">
                <Package className="w-4 h-4 md:w-8 md:h-8 text-purple-600 mb-1 md:mb-2" />
                <div className="text-base md:text-3xl font-bold text-gray-900">50k+</div>
                <div className="text-[10px] md:text-base text-gray-600">Items Managed</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 md:p-6 rounded-lg md:rounded-2xl border md:border-2 border-green-200">
                <CalendarDays className="w-4 h-4 md:w-8 md:h-8 text-green-600 mb-1 md:mb-2" />
                <div className="text-base md:text-3xl font-bold text-gray-900">100k+</div>
                <div className="text-[10px] md:text-base text-gray-600">Bookings Created</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 md:p-6 rounded-lg md:rounded-2xl border md:border-2 border-orange-200">
                <Star className="w-4 h-4 md:w-8 md:h-8 text-orange-600 mb-1 md:mb-2" />
                <div className="text-base md:text-3xl font-bold text-gray-900">4.9</div>
                <div className="text-[10px] md:text-base text-gray-600">Average Rating</div>
              </div>
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
