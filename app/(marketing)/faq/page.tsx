'use client';

import Link from 'next/link';
import {
  Package,
  HelpCircle,
} from 'lucide-react';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b-2 border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Package className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                Very Simple Inventory
              </h1>
            </Link>
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

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold text-xs mb-3">
            <HelpCircle className="w-4 h-4" />
            Get Help
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Find answers to common questions about Very Simple Inventory
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          {/* Q&A 1 */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-4 border-2 border-blue-100">
            <h4 className="text-sm md:text-base font-bold text-gray-900 mb-1.5 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              What is Very Simple Inventory?
            </h4>
            <p className="text-xs md:text-sm text-gray-700">
              Very Simple Inventory is a rental management platform that helps you track your
              inventory, bookings, and customers all in one place. It&apos;s designed to be simple and
              easy to use, with no complicated setup required.
            </p>
          </div>

          {/* Q&A 2 */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-4 border-2 border-purple-100">
            <h4 className="text-sm md:text-base font-bold text-gray-900 mb-1.5 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              Is it really free?
            </h4>
            <p className="text-xs md:text-sm text-gray-700">
              Yes! We offer a free forever plan with essential features including up to 15 items,
              50 customers, and 25 bookings per month. No credit card required to get started.
            </p>
          </div>

          {/* Q&A 3 */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-4 border-2 border-green-100">
            <h4 className="text-sm md:text-base font-bold text-gray-900 mb-1.5 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              How do I track my inventory?
            </h4>
            <p className="text-xs md:text-sm text-gray-700">
              Simply add your rental items with quantities and details. The system automatically
              tracks availability, reservations, and sends low stock alerts when needed.
            </p>
          </div>

          {/* Q&A 4 */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-4 border-2 border-orange-100">
            <h4 className="text-sm md:text-base font-bold text-gray-900 mb-1.5 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              Can I use it on my phone?
            </h4>
            <p className="text-xs md:text-sm text-gray-700">
              Absolutely! Very Simple Inventory is fully responsive and works perfectly on all
              devices - phones, tablets, and desktops. Manage your business from anywhere.
            </p>
          </div>

          {/* Q&A 5 */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-4 border-2 border-pink-100">
            <h4 className="text-sm md:text-base font-bold text-gray-900 mb-1.5 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
              What about premium features?
            </h4>
            <p className="text-xs md:text-sm text-gray-700">
              Premium features like tax calculators, online payments, automated notifications, and
              unlimited items are coming soon. Sign up for free now and we&apos;ll notify you when
              they&apos;re available.
            </p>
          </div>

          {/* Q&A 6 */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-3 md:p-4 border-2 border-indigo-100">
            <h4 className="text-sm md:text-base font-bold text-gray-900 mb-1.5 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              How do I get support?
            </h4>
            <p className="text-xs md:text-sm text-gray-700">
              You can reach us via email at support@verysimpleinventory.com. We aim to respond to all inquiries as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-200 mt-8 md:mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-gray-900">Very Simple Inventory</h4>
          </div>
          <p className="text-gray-600 text-sm text-center mb-3">
            Simple rental inventory management for businesses of all sizes.
          </p>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-center gap-6 mb-3">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-semibold"
              >
                Home
              </Link>
              <Link
                href="/faq"
                className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-semibold"
              >
                Frequently Asked Questions
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-semibold"
              >
                Contact Us
              </Link>
            </div>
            <p className="text-gray-600 text-sm text-center">
              © 2025 Very Simple Inventory. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
