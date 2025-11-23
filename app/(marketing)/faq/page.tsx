'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Package,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// FAQ Page - Contains all frequently asked questions about Very Simple Inventory
export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Very Simple Inventory?",
      answer: "Very Simple Inventory is a rental management platform that helps you track your inventory, bookings, and customers all in one place. It's designed to be simple and easy to use, with no complicated setup required.",
    },
    {
      question: "Is Very Simple Inventory really free?",
      answer: "Yes! We offer a free forever plan with essential features including up to 15 items, 50 customers, and 25 bookings per month. No credit card required to get started.",
    },
    {
      question: "Do I need a credit card to sign up?",
      answer: "No! You can sign up and start using Very Simple Inventory without providing any payment information. Our free plan is truly free forever.",
    },
    {
      question: "What kind of businesses can use Very Simple Inventory?",
      answer: "Any business that rents out items! Party equipment rentals, event venues, tool rentals, costume rentals, camera equipment rentals, and more. If you rent things to customers, Very Simple Inventory can help you manage it.",
    },
    {
      question: "Can I track multiple items in a single booking?",
      answer: "Yes! You can add multiple items to a single booking. This makes it easy to track complex rentals where a customer is renting several items at once.",
    },
    {
      question: "How does the availability checker work?",
      answer: "The availability checker shows you which items are available for a specific date range. It automatically accounts for existing bookings and item quantities, so you always know what's available to rent.",
    },
    {
      question: "What are the limits on the free plan?",
      answer: "The free plan includes up to 15 items, 50 customers, 15 active bookings, and 25 bookings per month. Your booking history is kept for the last 3 months. These limits are perfect for small businesses getting started.",
    },
    {
      question: "Can I export my data?",
      answer: "Data export will be available in the premium plan (coming soon). You'll be able to export your data in CSV, Excel, and PDF formats.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes! We take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and are hosted on secure infrastructure. Your business data is safe with us.",
    },
    {
      question: "Can I use this on my mobile phone?",
      answer: "Absolutely! Very Simple Inventory is fully responsive and works perfectly on all devices - phones, tablets, and desktops. Manage your business from anywhere.",
    },
    {
      question: "What premium features are coming?",
      answer: "Premium features include unlimited items and bookings, tax calculator, events near you, custom analytics, online payments, customer reminders, automated notifications, public booking page, team collaboration, wholesale supplier connections, and data export.",
    },
    {
      question: "How do I get support?",
      answer: "You can reach us via email at support@verysimpleinventory.com. We aim to respond to all inquiries as soon as possible.",
    }
  ];

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

        <div className="space-y-3 mb-6">
          {faqs.map((faq, index) => {
            // Alternate colors: even index = blue, odd index = purple
            const isBlue = index % 2 === 0;
            return (
              <div
                key={index}
                className={`bg-white rounded-lg md:rounded-xl shadow-lg border-2 ${
                  isBlue ? 'border-blue-100' : 'border-purple-100'
                } overflow-hidden transition-all`}
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-2 flex-1 text-left">
                    {/* Question mark icon - alternates blue/purple */}
                    <HelpCircle className={`w-4 h-4 ${
                      isBlue ? 'text-blue-600' : 'text-purple-600'
                    } flex-shrink-0 mt-0.5`} />
                    <h4 className="text-sm md:text-base font-bold text-gray-900">
                      {faq.question}
                    </h4>
                  </div>
                  {/* Chevron icons - alternates blue/purple */}
                  {openIndex === index ? (
                    <ChevronUp className={`w-5 h-5 ${
                      isBlue ? 'text-blue-600' : 'text-purple-600'
                    } flex-shrink-0`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${
                      isBlue ? 'text-blue-600' : 'text-purple-600'
                    } flex-shrink-0`} />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-3 md:px-4 pb-3 md:pb-4 pt-0">
                    <p className="text-xs md:text-sm text-gray-700 pl-6">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg md:rounded-xl p-4 md:p-6 text-center border-2 border-blue-200">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-xs md:text-sm text-gray-600 mb-3">
            We&apos;re here to help! Contact us and we&apos;ll get back to you as soon as possible.
          </p>
          <Link
            href="/contact"
            className="inline-block px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md text-xs md:text-sm"
          >
            Contact Us
          </Link>
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
