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
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Very Simple Inventory
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/auth/sign-in"
                className="px-2 py-1.5 md:px-4 md:py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors text-xs md:text-base"
              >
                Log In
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-3 py-1.5 md:px-6 md:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md text-xs md:text-base"
              >
                Sign Up Free
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
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
            <Link
              href="/auth/sign-up"
              className="w-full md:w-auto px-4 py-2.5 md:px-8 md:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg md:rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-sm md:text-lg flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="w-full md:w-auto px-4 py-2.5 md:px-8 md:py-4 bg-white text-gray-700 font-bold rounded-lg md:rounded-xl hover:bg-gray-50 transition-all shadow-md border-2 border-gray-200 text-sm md:text-lg"
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
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16 bg-white rounded-2xl md:rounded-3xl shadow-xl mb-8 md:mb-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your Rental Business
          </h3>
          <p className="text-lg text-gray-600">
            Powerful features designed for rental businesses of all sizes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200">
            <div className="p-3 bg-blue-600 rounded-xl w-fit mb-4">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Visual Calendar</h4>
            <p className="text-gray-600">
              See all your bookings at a glance with an intuitive calendar view. Quickly spot
              conflicts and available dates.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200">
            <div className="p-3 bg-purple-600 rounded-xl w-fit mb-4">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Inventory Tracking</h4>
            <p className="text-gray-600">
              Manage your rental items with ease. Track quantities, availability, and get low stock
              alerts automatically.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200">
            <div className="p-3 bg-green-600 rounded-xl w-fit mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Customer Management</h4>
            <p className="text-gray-600">
              Keep track of your customers and their booking history. Build better relationships and
              improve service.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200">
            <div className="p-3 bg-orange-600 rounded-xl w-fit mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Real-time Analytics</h4>
            <p className="text-gray-600">
              Track your business performance with detailed analytics. Monitor revenue, bookings,
              and popular items.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border-2 border-pink-200">
            <div className="p-3 bg-pink-600 rounded-xl w-fit mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Availability Checker</h4>
            <p className="text-gray-600">
              Instantly check item availability for any date range. Speed up customer inquiries and
              bookings.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border-2 border-indigo-200">
            <div className="p-3 bg-indigo-600 rounded-xl w-fit mb-4">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Mobile Friendly</h4>
            <p className="text-gray-600">
              Access your inventory from anywhere. Fully responsive design works perfectly on phones
              and tablets.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 mb-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get Started in Minutes
          </h3>
          <p className="text-lg text-gray-600">
            Three simple steps to start managing your rental inventory
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Sign Up Free</h4>
            <p className="text-gray-600">
              Create your account in seconds. No credit card required to get started.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Add Your Items</h4>
            <p className="text-gray-600">
              Quickly add your rental inventory items with quantities and details.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Start Booking</h4>
            <p className="text-gray-600">
              Create bookings, track availability, and grow your rental business.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Features - Coming Soon */}
      <section className="max-w-7xl mx-auto px-4 py-16 mb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold text-sm mb-4">
            <Clock className="w-4 h-4" />
            Coming Soon
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Premium Features on the Way
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're working hard to bring you advanced features to take your rental business to the next level.
            These features are currently in development and will be available soon.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Premium Feature 1 */}
            <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200">
              <div className="p-3 bg-blue-600 rounded-xl flex-shrink-0">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Advanced Analytics Dashboard</h4>
                <p className="text-gray-600">
                  Get deep insights into your business with comprehensive analytics, revenue tracking,
                  and performance metrics.
                </p>
                <span className="inline-block mt-2 text-sm text-blue-600 font-semibold">Not yet available</span>
              </div>
            </div>

            {/* Premium Feature 2 */}
            <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200">
              <div className="p-3 bg-purple-600 rounded-xl flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Multi-User Access</h4>
                <p className="text-gray-600">
                  Collaborate with your team by adding multiple users with different permission levels
                  to your account.
                </p>
                <span className="inline-block mt-2 text-sm text-purple-600 font-semibold">Not yet available</span>
              </div>
            </div>

            {/* Premium Feature 3 */}
            <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200">
              <div className="p-3 bg-green-600 rounded-xl flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Custom Branding</h4>
                <p className="text-gray-600">
                  Personalize your booking pages and customer communications with your own logo,
                  colors, and branding.
                </p>
                <span className="inline-block mt-2 text-sm text-green-600 font-semibold">Not yet available</span>
              </div>
            </div>

            {/* Premium Feature 4 */}
            <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200">
              <div className="p-3 bg-orange-600 rounded-xl flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Data Export & Reports</h4>
                <p className="text-gray-600">
                  Export your data to CSV or PDF formats and generate detailed reports for
                  accounting and analysis.
                </p>
                <span className="inline-block mt-2 text-sm text-orange-600 font-semibold">Not yet available</span>
              </div>
            </div>

            {/* Premium Feature 5 */}
            <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border-2 border-pink-200">
              <div className="p-3 bg-pink-600 rounded-xl flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">API Access</h4>
                <p className="text-gray-600">
                  Integrate with your existing systems and build custom workflows using our
                  comprehensive API.
                </p>
                <span className="inline-block mt-2 text-sm text-pink-600 font-semibold">Not yet available</span>
              </div>
            </div>

            {/* Premium Feature 6 */}
            <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border-2 border-indigo-200">
              <div className="p-3 bg-indigo-600 rounded-xl flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Priority Support</h4>
                <p className="text-gray-600">
                  Get faster response times and dedicated support from our team to keep your
                  business running smoothly.
                </p>
                <span className="inline-block mt-2 text-sm text-indigo-600 font-semibold">Not yet available</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 text-center">
            <p className="text-gray-700 font-semibold mb-2">
              Want to be notified when premium features launch?
            </p>
            <p className="text-gray-600">
              Sign up for a free account now and we'll let you know as soon as these features become available.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 mb-16">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About Very Simple Inventory
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                We built Very Simple Inventory because rental businesses deserve better tools.
                Managing inventory, bookings, and customers shouldn't be complicated or expensive.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Our mission is to help rental businesses of all sizes streamline their operations,
                reduce manual work, and focus on what matters most: growing their business and
                serving their customers.
              </p>
              <p className="text-lg text-gray-600">
                Whether you're renting equipment, party supplies, or anything in between, Very
                Simple Inventory gives you the tools you need to succeed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
                <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                <div className="text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200">
                <Package className="w-8 h-8 text-purple-600 mb-2" />
                <div className="text-3xl font-bold text-gray-900">50k+</div>
                <div className="text-gray-600">Items Managed</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200">
                <CalendarDays className="w-8 h-8 text-green-600 mb-2" />
                <div className="text-3xl font-bold text-gray-900">100k+</div>
                <div className="text-gray-600">Bookings Created</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-200">
                <Star className="w-8 h-8 text-orange-600 mb-2" />
                <div className="text-3xl font-bold text-gray-900">4.9</div>
                <div className="text-gray-600">Average Rating</div>
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
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
            <Link
              href="/auth/sign-up"
              className="w-full md:w-auto px-4 py-2.5 md:px-8 md:py-4 bg-white text-blue-600 font-bold rounded-lg md:rounded-xl hover:bg-gray-100 transition-all shadow-lg text-sm md:text-lg flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="w-full md:w-auto px-4 py-2.5 md:px-8 md:py-4 bg-blue-700 text-white font-bold rounded-lg md:rounded-xl hover:bg-blue-800 transition-all text-sm md:text-lg border-2 border-white/20"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-gray-900">Very Simple Inventory</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Simple rental inventory management for businesses of all sizes.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-4">Product</h5>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/auth/sign-up"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/sign-in"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Log In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-4">Company</h5>
              <ul className="space-y-2">
                <li>
                  <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-4">Legal</h5>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-600 text-sm">
              © 2025 Very Simple Inventory. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
