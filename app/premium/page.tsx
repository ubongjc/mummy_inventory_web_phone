'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Globe,
  TrendingUp,
  Bell,
  CreditCard,
  Users,
  Calendar,
  BarChart3,
  Lock,
  Calculator,
  BellRing,
  Truck,
  FileDown,
  MapPin,
} from 'lucide-react';

export default function PremiumPage() {
  const features = [
    {
      icon: <Calculator className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Tax Calculator',
      description:
        'Automatically calculate taxes on rentals based on your location and apply them to invoices and receipts',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: <MapPin className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Events Near You',
      description:
        'Get notified about local events like weddings, festivals, and conferences that could need your rentals',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: <BarChart3 className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Custom Analytics',
      description:
        'Track utilization rates, revenue trends, conversion rates, and identify your most profitable items',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: <CreditCard className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Online Payments',
      description:
        'Let customers pay securely through the app with Stripe. Automatic payment tracking and receipts',
      color: 'from-orange-500 to-red-600',
    },
    {
      icon: <BellRing className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Customer Reminders',
      description:
        'Send automated reminders to customers for upcoming rentals, returns, and outstanding payments',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: <Bell className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Automated Notifications',
      description: 'Email and SMS alerts for new inquiries, overdue payments, low stock, and upcoming bookings',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: <Globe className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Public Booking Page',
      description:
        'Share a custom link so customers can check availability and inquire about rentals directly on your branded page',
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: <Users className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Team Collaboration',
      description: 'Add team members with custom roles and permissions to manage your rental business together',
      color: 'from-indigo-500 to-blue-600',
    },
    {
      icon: <Truck className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Wholesale Supplier Connection',
      description: 'Connect with wholesale suppliers to easily restock inventory and manage purchase orders',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: <FileDown className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Data Export & Reports',
      description: 'Export your data in multiple formats (CSV, Excel, PDF) and generate detailed business reports',
      color: 'from-emerald-500 to-green-600',
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '15 items maximum',
        '50 customers maximum',
        '15 active bookings (CONFIRMED + OUT)',
        '25 bookings per month',
        'Last 3 months of booking history',
        'Calendar booking management',
        'Inventory tracking',
        'Basic reporting',
        'Email support',
      ],
      cta: 'Current Plan',
      ctaDisabled: true,
      color: 'from-gray-500 to-gray-700',
    },
    {
      name: 'Premium',
      price: 'TBD',
      period: 'Coming Soon',
      popular: true,
      features: [
        'Unlimited items & customers',
        'Unlimited active bookings',
        'Unlimited bookings per month',
        'Unlimited booking history',
        'Tax calculator',
        'Events near you',
        'Custom analytics dashboard',
        'Online payments',
        'Customer reminders & notifications',
        'Public booking page',
        'Team collaboration (up to 5 members)',
        'Wholesale supplier connection',
        'Data export to Excel/CSV/PDF',
        '5 photos per item',
        'Priority email + WhatsApp support',
      ],
      cta: 'Coming Soon',
      ctaDisabled: true,
      color: 'from-yellow-500 to-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/"
              className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg font-semibold transition-all duration-200 shadow-md text-xs md:text-sm"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Back to Home</span>
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
            Premium Features Coming Soon
          </h2>
          <p className="text-xs md:text-lg text-gray-700">
            These powerful features are currently in development and will be available soon to help you grow your rental business
          </p>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-12 border-4 border-yellow-200">
          <div className="grid grid-cols-2 gap-2 md:gap-6">
            {/* Premium Feature 1 - Tax Calculator */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-2xl border border-blue-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-blue-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Calculator className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Tax Calculator</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Automatically calculate taxes on rentals based on your location and apply them to invoices and receipts
                </p>
              </div>
            </div>

            {/* Premium Feature 2 - Events Near You */}
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

            {/* Premium Feature 3 - Custom Analytics */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg md:rounded-2xl border border-green-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-green-600 rounded-lg md:rounded-xl flex-shrink-0">
                <BarChart3 className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Custom Analytics</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Track utilization rates, revenue trends, conversion rates, and identify your most profitable items
                </p>
              </div>
            </div>

            {/* Premium Feature 4 - Online Payments */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg md:rounded-2xl border border-orange-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-orange-600 rounded-lg md:rounded-xl flex-shrink-0">
                <CreditCard className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Online Payments</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Let customers pay securely through the app with Stripe. Automatic payment tracking and receipts
                </p>
              </div>
            </div>

            {/* Premium Feature 5 - Customer Reminders */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg md:rounded-2xl border border-pink-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-pink-600 rounded-lg md:rounded-xl flex-shrink-0">
                <BellRing className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Customer Reminders</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Send automated reminders to customers for upcoming rentals, returns, and outstanding payments
                </p>
              </div>
            </div>

            {/* Premium Feature 6 - Automated Notifications */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg md:rounded-2xl border border-indigo-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-indigo-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Bell className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Automated Notifications</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Email and SMS alerts for new inquiries, overdue payments, low stock, and upcoming bookings
                </p>
              </div>
            </div>

            {/* Premium Feature 7 - Public Booking Page */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg md:rounded-2xl border border-cyan-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-cyan-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Globe className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Public Booking Page</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Share a custom link so customers can check availability and inquire about rentals directly on your branded page
                </p>
              </div>
            </div>

            {/* Premium Feature 8 - Team Collaboration */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg md:rounded-2xl border border-rose-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-rose-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Users className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Team Collaboration</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Add team members with custom roles and permissions to manage your rental business together
                </p>
              </div>
            </div>

            {/* Premium Feature 9 - Wholesale Supplier Connection */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg md:rounded-2xl border border-amber-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-amber-600 rounded-lg md:rounded-xl flex-shrink-0">
                <Truck className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Wholesale Supplier Connection</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Connect with wholesale suppliers to easily restock inventory and manage purchase orders
                </p>
              </div>
            </div>

            {/* Premium Feature 10 - Data Export & Reports */}
            <div className="flex items-start gap-2 md:gap-4 p-2 md:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg md:rounded-2xl border border-emerald-200 md:border-2">
              <div className="p-1.5 md:p-3 bg-emerald-600 rounded-lg md:rounded-xl flex-shrink-0">
                <FileDown className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">Data Export & Reports</h4>
                <p className="text-[10px] md:text-base text-gray-600">
                  Export your data in multiple formats (CSV, Excel, PDF) and generate detailed business reports
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
                Your data is encrypted and backed up daily. We use industry-standard security
                practices to keep your business information safe.
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
