'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Star,
  Calculator,
  MapPin,
  BarChart3,
  CreditCard,
  Bell,
  Users,
  Globe,
  ShoppingBag,
  FileSpreadsheet,
  Headphones,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function PremiumPage() {
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

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
            Premium Features
          </div>
          <h2 className="text-lg md:text-4xl font-bold text-black mb-2 md:mb-4">
            Unlock Powerful Features for Growing Businesses
          </h2>
          <p className="text-xs md:text-lg text-gray-700">
            Start with our generous free plan. Upgrade to Premium when your business outgrows the free limits.
          </p>
        </div>

        {/* Premium Feature Cards - 2 per line */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {/* Tax Calculator */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-purple-200 hover:border-purple-400 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
                <Calculator className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-xl font-bold text-black mb-1 md:mb-2">
                  Tax Calculator
                </h3>
                <p className="text-xs md:text-base text-gray-600">
                  Automatic tax calculations for all your bookings. Save time and ensure accuracy with built-in tax management.
                </p>
              </div>
            </div>
          </div>

          {/* Events Near You */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-blue-200 hover:border-blue-400 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-xl font-bold text-black mb-1 md:mb-2">
                  Events Near You
                </h3>
                <p className="text-xs md:text-base text-gray-600">
                  Discover upcoming events in your area. Find new opportunities to rent out your inventory and grow your business.
                </p>
              </div>
            </div>
          </div>

          {/* Custom Analytics */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-green-200 hover:border-green-400 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 md:p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-xl font-bold text-black mb-1 md:mb-2">
                  Custom Analytics
                </h3>
                <p className="text-xs md:text-base text-gray-600">
                  Advanced reporting and insights tailored to your business. Make data-driven decisions with detailed analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Online Payments */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-yellow-200 hover:border-yellow-400 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 md:p-3 bg-yellow-100 rounded-lg">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-xl font-bold text-black mb-1 md:mb-2">
                  Online Payments
                </h3>
                <p className="text-xs md:text-base text-gray-600">
                  Accept payments directly through the platform. Streamline your payment process and get paid faster.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Reminders */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-pink-200 hover:border-pink-400 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 md:p-3 bg-pink-100 rounded-lg">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-xl font-bold text-black mb-1 md:mb-2">
                  Customer Reminders
                </h3>
                <p className="text-xs md:text-base text-gray-600">
                  Automated reminders for pickups and returns. Reduce no-shows and improve customer experience.
                </p>
              </div>
            </div>
          </div>

          {/* Automated Notifications */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-indigo-200 hover:border-indigo-400 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 md:p-3 bg-indigo-100 rounded-lg">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-xl font-bold text-black mb-1 md:mb-2">
                  Automated Notifications
                </h3>
                <p className="text-xs md:text-base text-gray-600">
                  Automatic alerts for bookings, payments, and updates. Stay on top of your business without manual work.
                </p>
              </div>
            </div>
          </div>

          {/* Public Booking Page */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-teal-200 hover:border-teal-400 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 md:p-3 bg-teal-100 rounded-lg">
                <Globe className="w-5 h-5 md:w-6 md:h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-xl font-bold text-black mb-1 md:mb-2">
                  Public Booking Page
                </h3>
                <p className="text-xs md:text-base text-gray-600">
                  Allow customers to book online directly. Reduce manual work and make it easy for customers to rent from you.
                </p>
              </div>
            </div>
          </div>

          {/* Team Collaboration */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-orange-200 hover:border-orange-400 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 md:p-3 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-xl font-bold text-black mb-1 md:mb-2">
                  Team Collaboration
                </h3>
                <p className="text-xs md:text-base text-gray-600">
                  Add up to 5 team members to manage your inventory together. Perfect for growing businesses with multiple staff.
                </p>
              </div>
            </div>
          </div>

          {/* Wholesale Supplier Connection */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-red-200 hover:border-red-400 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 md:p-3 bg-red-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-xl font-bold text-black mb-1 md:mb-2">
                  Wholesale Supplier Connection
                </h3>
                <p className="text-xs md:text-base text-gray-600">
                  Connect with wholesale suppliers for chairs, tables, carpets, and more. Get better prices on rental materials.
                </p>
              </div>
            </div>
          </div>

          {/* Data Export & Advanced Reporting */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-cyan-200 hover:border-cyan-400 transition-all">
            <div className="flex items-start gap-3">
              <div className="p-2 md:p-3 bg-cyan-100 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-sm md:text-xl font-bold text-black mb-1 md:mb-2">
                  Data Export & Reports
                </h3>
                <p className="text-xs md:text-base text-gray-600">
                  Export your data to Excel/CSV for accounting and analysis. Full access to all your booking history.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Comparison Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1 md:gap-2 bg-purple-100 text-purple-700 px-2 py-1 md:px-4 md:py-2 rounded-full font-semibold text-xs md:text-sm mb-3 md:mb-4">
            <Star className="w-3 h-3 md:w-4 md:h-4" />
            Free vs Premium
          </div>
          <h3 className="text-lg md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
            Choose the Plan That&apos;s Right for You
          </h3>

          {/* Dropdown Toggle Button */}
          <button
            onClick={() => setIsComparisonOpen(!isComparisonOpen)}
            className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md text-sm md:text-base mb-4"
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
        )}

        {/* Notification Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg md:rounded-2xl shadow-xl p-4 md:p-6 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Headphones className="w-5 h-5 md:w-6 md:h-6" />
            <h3 className="text-sm md:text-2xl font-bold">
              Premium Features Coming Soon
            </h3>
          </div>
          <p className="text-xs md:text-base">
            We&apos;re working hard to bring you Premium features. Keep using the free plan and we&apos;ll notify you when Premium is ready!
          </p>
        </div>
      </main>
    </div>
  );
}
