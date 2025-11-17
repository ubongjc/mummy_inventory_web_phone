'use client';

import Link from 'next/link';
import {
  Package,
  CalendarDays,
  Star,
  TrendingUp,
  ArrowLeft,
  CheckCircle,
  Target,
  Users,
  Zap,
} from 'lucide-react';

export default function AboutPage() {
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
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-2.5 py-1 md:px-4 md:py-1.5 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-bold rounded-lg transition-all shadow-md text-xs md:text-sm flex items-center gap-1 md:gap-2"
              >
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">Back to Home</span>
                <span className="md:hidden">Home</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-1 md:gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold text-xs md:text-sm mb-4">
            <Star className="w-3 h-3 md:w-4 md:h-4" />
            Our Story
          </div>
          <h2 className="text-2xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            About Very Simple Inventory
          </h2>
          <p className="text-sm md:text-xl text-gray-600 max-w-3xl mx-auto">
            Building better tools for rental businesses around the world
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-8 mb-8 md:mb-16">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-12">
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center mb-8 md:mb-12">
            <div>
              <h3 className="text-lg md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                Why We Built This
              </h3>
              <p className="text-sm md:text-lg text-gray-600 mb-4">
                We built Very Simple Inventory because rental businesses deserve better tools.
                Managing inventory, bookings, and customers shouldn&apos;t be complicated or expensive.
              </p>
              <p className="text-sm md:text-lg text-gray-600 mb-4">
                Our mission is to help rental businesses of all sizes streamline their operations,
                reduce manual work, and focus on what matters most: growing their business and
                serving their customers.
              </p>
              <p className="text-sm md:text-lg text-gray-600">
                Whether you&apos;re renting equipment, party supplies, or anything in between, Very
                Simple Inventory gives you the tools you need to succeed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-blue-200">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mb-2" />
                <div className="text-xl md:text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-xs md:text-base text-gray-600">Active Users</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-purple-200">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mb-2" />
                <div className="text-xl md:text-3xl font-bold text-gray-900">50k+</div>
                <div className="text-xs md:text-base text-gray-600">Items Managed</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-green-200">
                <CalendarDays className="w-6 h-6 md:w-8 md:h-8 text-green-600 mb-2" />
                <div className="text-xl md:text-3xl font-bold text-gray-900">100k+</div>
                <div className="text-xs md:text-base text-gray-600">Bookings Created</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-orange-200">
                <Star className="w-6 h-6 md:w-8 md:h-8 text-orange-600 mb-2" />
                <div className="text-xl md:text-3xl font-bold text-gray-900">4.9</div>
                <div className="text-xs md:text-base text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Our Values */}
          <div className="border-t-2 border-gray-200 pt-8 md:pt-12">
            <h3 className="text-lg md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
              Our Core Values
            </h3>
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h4 className="text-base md:text-xl font-bold text-gray-900">
                    Simplicity First
                  </h4>
                </div>
                <p className="text-xs md:text-base text-gray-600">
                  We believe powerful tools should be easy to use. No complicated setup, no overwhelming features, just what you need to run your business.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6 rounded-xl border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h4 className="text-base md:text-xl font-bold text-gray-900">
                    Customer Focus
                  </h4>
                </div>
                <p className="text-xs md:text-base text-gray-600">
                  Your success is our success. We listen to feedback and constantly improve based on what rental businesses actually need.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-6 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h4 className="text-base md:text-xl font-bold text-gray-900">
                    Affordable for All
                  </h4>
                </div>
                <p className="text-xs md:text-base text-gray-600">
                  Quality tools shouldn&apos;t break the bank. We offer a generous free plan and affordable premium options for growing businesses.
                </p>
              </div>
            </div>
          </div>

          {/* What Makes Us Different */}
          <div className="border-t-2 border-gray-200 pt-8 md:pt-12 mt-8 md:mt-12">
            <h3 className="text-lg md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">
              What Makes Us Different
            </h3>
            <div className="space-y-3 md:space-y-4 max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm md:text-lg font-bold text-gray-900 mb-1">
                    Built for Rental Businesses
                  </h4>
                  <p className="text-xs md:text-base text-gray-600">
                    Unlike generic inventory software, we designed every feature specifically for rental operations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm md:text-lg font-bold text-gray-900 mb-1">
                    Mobile-First Design
                  </h4>
                  <p className="text-xs md:text-base text-gray-600">
                    Manage your business from anywhere. Our platform works perfectly on phones, tablets, and computers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm md:text-lg font-bold text-gray-900 mb-1">
                    No Credit Card Required
                  </h4>
                  <p className="text-xs md:text-base text-gray-600">
                    Start using our free plan immediately. No hidden fees, no surprise charges, no commitment required.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm md:text-lg font-bold text-gray-900 mb-1">
                    Continuous Improvement
                  </h4>
                  <p className="text-xs md:text-base text-gray-600">
                    We&apos;re constantly adding new features and improvements based on customer feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16 mb-8 md:mb-16">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 text-center">
          <h3 className="text-xl md:text-4xl font-bold text-white mb-3 md:mb-6">
            Ready to Get Started?
          </h3>
          <p className="text-sm md:text-xl text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of rental businesses already using Very Simple Inventory.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
            <Link
              href="/auth/sign-up"
              className="w-full md:w-auto px-4 py-2 md:px-8 md:py-4 bg-white text-blue-600 font-bold rounded-lg md:rounded-xl hover:bg-gray-100 transition-all shadow-lg text-sm md:text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/"
              className="w-full md:w-auto px-4 py-2 md:px-8 md:py-4 bg-blue-700 text-white font-bold rounded-lg md:rounded-xl hover:bg-blue-800 transition-all text-sm md:text-lg border-2 border-white/20"
            >
              Back to Home
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
