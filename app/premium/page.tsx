"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle, Globe, TrendingUp, Bell, CreditCard, Users, Calendar, BarChart3, Lock } from "lucide-react";

export default function PremiumPage() {
  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Public Booking Page",
      description: "Share a custom link so customers can check availability and inquire about rentals directly on your branded page",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Events Near You",
      description: "Get notified about local events like weddings, festivals, and conferences that could need your rentals",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Smart Notifications",
      description: "Email and SMS alerts for new inquiries, overdue payments, low stock, and upcoming events",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Custom Analytics",
      description: "Track utilization rates, revenue trends, conversion rates, and identify your most profitable items",
      color: "from-orange-500 to-red-600",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Online Payments",
      description: "Let customers pay securely through the app with Stripe. Automatic payment tracking and receipts",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Priority Support",
      description: "Get faster response times and dedicated support for your rental business",
      color: "from-violet-500 to-purple-600",
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Unlimited items & customers",
        "Calendar booking management",
        "Inventory tracking",
        "Basic reporting",
      ],
      cta: "Current Plan",
      ctaDisabled: true,
      color: "from-gray-500 to-gray-700",
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      popular: true,
      features: [
        "Everything in Free",
        "Public booking page",
        "Events near you",
        "Email & SMS notifications",
        "Custom analytics dashboard",
        "Online payments (Stripe)",
        "Priority support",
      ],
      cta: "Start 14-Day Free Trial",
      ctaDisabled: false,
      color: "from-yellow-500 to-amber-600",
    },
    {
      name: "Business",
      price: "$79",
      period: "per month",
      features: [
        "Everything in Pro",
        "Multiple public pages",
        "Team member accounts",
        "Advanced analytics & exports",
        "API access & webhooks",
        "Custom branding",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
      ctaDisabled: false,
      color: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg font-semibold transition-all duration-200 shadow-md text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-yellow-500" />
                Premium Features
              </h1>
              <p className="text-sm text-gray-600">Grow your rental business with powerful tools</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-black mb-4">
            Take Your Rental Business to the Next Level
          </h2>
          <p className="text-lg text-gray-700">
            Get more bookings, automate your workflow, and grow your revenue with Premium features
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
            >
              <div className={`inline-block p-3 bg-gradient-to-r ${feature.color} rounded-xl mb-4`}>
                <div className="text-white">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="pt-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">Choose Your Plan</h2>
            <p className="text-gray-600">Start with a 14-day free trial. No credit card required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg p-8 border-2 ${
                  plan.popular ? "border-yellow-500 relative" : "border-gray-200"
                } hover:shadow-xl transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-block px-4 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-sm font-bold rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-4xl font-bold text-black">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={plan.ctaDisabled}
                  className={`w-full py-3 bg-gradient-to-r ${plan.color} text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black mb-2">Secure & Reliable</h3>
              <p className="text-gray-600 mb-4">
                Your data is encrypted and backed up daily. We use industry-standard security practices
                to keep your business information safe.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Cancel anytime, no questions asked
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  14-day money-back guarantee
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  No setup fees or hidden charges
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of rental businesses using Premium to increase bookings and revenue
          </p>
          <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg text-lg">
            Start Your Free Trial
          </button>
          <p className="text-white/80 text-sm mt-4">
            No credit card required • Cancel anytime
          </p>
        </div>
      </main>
    </div>
  );
}
