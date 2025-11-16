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
  MessageSquare,
} from 'lucide-react';

export default function PremiumPage() {
  const features = [
    {
      icon: <Globe className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Public Booking Page',
      description:
        'Share a custom link so customers can check availability and inquire about rentals directly on your branded page',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: <Calendar className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Events Near You',
      description:
        'Get notified about local events like weddings, festivals, and conferences that could need your rentals',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: <Bell className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Smart Notifications',
      description:
        'Email and SMS alerts for new inquiries, overdue payments, low stock, and upcoming events',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: <BarChart3 className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Custom Analytics',
      description:
        'Track utilization rates, revenue trends, conversion rates, and identify your most profitable items',
      color: 'from-orange-500 to-red-600',
    },
    {
      icon: <CreditCard className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Online Payments',
      description:
        'Let customers pay securely through the app with Stripe. Automatic payment tracking and receipts',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      icon: <Users className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Priority Support',
      description: 'Get faster response times and dedicated support for your rental business',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: <Calculator className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Tax Calculator',
      description: 'Calculate taxes automatically with helpful links to pay taxes or get professional tax assistance',
      color: 'from-teal-500 to-cyan-600',
    },
    {
      icon: <MessageSquare className="w-5 h-5 md:w-8 md:h-8" />,
      title: 'Customer Reminders',
      description: 'Automatic reminders sent one day before rental due, on the rental day, and one day after if late',
      color: 'from-rose-500 to-pink-600',
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Unlimited items & customers',
        'Calendar booking management',
        'Inventory tracking',
        'Basic reporting',
      ],
      cta: 'Current Plan',
      ctaDisabled: true,
      color: 'from-gray-500 to-gray-700',
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      popular: true,
      features: [
        'Everything in Free',
        'Public booking page',
        'Events near you',
        'Email & SMS notifications',
        'Custom analytics dashboard',
        'Online payments (Stripe)',
        'Priority support',
      ],
      cta: 'Start 14-Day Free Trial',
      ctaDisabled: false,
      color: 'from-yellow-500 to-amber-600',
    },
    {
      name: 'Business',
      price: '$79',
      period: 'per month',
      features: [
        'Everything in Pro',
        'Multiple public pages',
        'Team member accounts',
        'Advanced analytics & exports',
        'API access & webhooks',
        'Custom branding',
        'Dedicated account manager',
      ],
      cta: 'Contact Sales',
      ctaDisabled: false,
      color: 'from-purple-500 to-pink-600',
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg md:rounded-2xl shadow-lg p-2 md:p-6 border border-gray-200 hover:shadow-xl transition-all"
            >
              <div
                className={`inline-block p-1.5 md:p-3 bg-gradient-to-r ${feature.color} rounded-lg md:rounded-xl mb-1 md:mb-4`}
              >
                <div className="text-white">{feature.icon}</div>
              </div>
              <h3 className="text-xs md:text-xl font-bold text-black mb-1 md:mb-2">
                {feature.title}
              </h3>
              <p className="text-[10px] md:text-base text-gray-600">{feature.description}</p>
            </div>
          ))}
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
