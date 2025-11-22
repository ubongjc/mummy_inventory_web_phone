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
  Globe,
  MapPin,
  Bell,
  CreditCard,
  Headphones,
  Calculator,
  BellRing,
  Truck,
  FileDown,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Mail,
  Send,
  AlertCircle,
} from 'lucide-react';

export default function HomePage() {
  const { data: _session, status } = useSession();
  const router = useRouter();
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '', // Honeypot field
  });
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [contactErrorMessage, setContactErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleContactFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactFormData({
      ...contactFormData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: '',
      });
    }
  };

  const validateContactForm = () => {
    const errors: {[key: string]: string} = {};

    // Name validation
    if (!contactFormData.name.trim()) {
      errors.name = 'Name is required';
    } else if (contactFormData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (contactFormData.name.length > 100) {
      errors.name = 'Name must be less than 100 characters';
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(contactFormData.name)) {
      errors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Email validation
    if (!contactFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (contactFormData.email.length > 254) {
      errors.email = 'Email must be less than 254 characters';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Message validation
    if (!contactFormData.message.trim()) {
      errors.message = 'Message is required';
    } else if (contactFormData.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    } else if (contactFormData.message.length > 2000) {
      errors.message = 'Message must be less than 2000 characters';
    }

    return errors;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateContactForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setContactStatus('loading');
    setContactErrorMessage('');
    setFieldErrors({});

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactFormData.name.trim(),
          email: contactFormData.email.trim(),
          message: contactFormData.message.trim(),
          subject: 'General Inquiry',
          phone: '',
          website: contactFormData.website, // Honeypot
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setContactStatus('success');
      setContactFormData({
        name: '',
        email: '',
        message: '',
        website: '',
      });

      // Reset success message after 8 seconds
      setTimeout(() => setContactStatus('idle'), 8000);
    } catch (error) {
      setContactStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setContactErrorMessage(
        errorMessage.includes('rate limit')
          ? errorMessage
          : 'Failed to send message. Please try again or email us directly at support@verysimpleinventory.com'
      );
    }
  };

  // Show loading spinner while checking authentication or redirecting
  if (status === 'loading' || status === 'authenticated') {
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
        {/* Collapsible Header */}
        <button
          onClick={() => setIsPremiumOpen(!isPremiumOpen)}
          className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-600 rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 mb-4 transition-all duration-300 hover:shadow-yellow-500/50 border-4 border-yellow-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl">
                <Star className="w-6 h-6 md:w-10 md:h-10 text-white fill-white animate-pulse" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg md:text-4xl font-bold text-white drop-shadow-lg">
                    Premium Features
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1 md:gap-2 bg-white/30 backdrop-blur-sm text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full font-semibold text-xs md:text-sm">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  Coming Soon
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden md:block text-white font-bold text-lg">
                {isPremiumOpen ? 'Hide' : 'Show'} Details
              </span>
              {isPremiumOpen ? (
                <ChevronUp className="w-6 h-6 md:w-8 md:h-8 text-white animate-bounce" />
              ) : (
                <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-white animate-bounce" />
              )}
            </div>
          </div>
        </button>

        {/* Collapsible Content */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isPremiumOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="text-center mb-4 md:mb-8">
            <p className="text-sm md:text-lg text-gray-600 max-w-3xl mx-auto">
              We're working hard to bring you advanced features to take your rental business to the next level.
              These features are currently in development and will be available soon.
            </p>
          </div>

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

          <div className="col-span-2 mt-2 md:mt-8 p-3 md:p-6 bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 rounded-lg md:rounded-2xl border md:border-2 border-yellow-300 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-4 h-4 md:w-6 md:h-6 text-yellow-500 fill-yellow-500" />
              <p className="text-xs md:text-base text-gray-700 font-semibold">
                Want to be notified when premium features launch?
              </p>
              <Star className="w-4 h-4 md:w-6 md:h-6 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-[10px] md:text-base text-gray-600">
              Sign up for a free account now and we'll let you know as soon as these features become available.
            </p>
          </div>
          </div>
        </div>
      </section>

      {/* Free vs Premium Comparison */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-16 mb-8 md:mb-16">
        {/* Collapsible Header */}
        <button
          onClick={() => setIsComparisonOpen(!isComparisonOpen)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-8 mb-4 transition-all duration-300 hover:shadow-purple-500/50 border-4 border-blue-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl">
                <TrendingUp className="w-6 h-6 md:w-10 md:h-10 text-white animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="text-lg md:text-4xl font-bold text-white drop-shadow-lg whitespace-nowrap">
                  Free vs Premium
                </h3>
                <p className="text-xs md:text-base text-white/90">
                  Compare plans
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden md:block text-white font-bold text-lg">
                {isComparisonOpen ? 'Hide' : 'Show'} Comparison
              </span>
              {isComparisonOpen ? (
                <ChevronUp className="w-6 h-6 md:w-8 md:h-8 text-white animate-bounce" />
              ) : (
                <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-white animate-bounce" />
              )}
            </div>
          </div>
        </button>

        {/* Collapsible Content */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isComparisonOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Comparison Table */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border-4 border-blue-200">
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

            <div className="border-b-2 border-gray-300">
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

            <div className="border-b-2 border-gray-300">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-2 md:p-4">
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Data Export</h5>
                  <p className="text-[8px] md:text-xs text-gray-500">Excel/CSV</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                  <CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline text-purple-700" />
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
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                  <CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline text-purple-700" />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-2 md:p-4">
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Events Near You</h5>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                  <CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline text-purple-700" />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-2 md:p-4">
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Custom Analytics</h5>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                  <CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline text-purple-700" />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-2 md:p-4">
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Online Payments</h5>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                  <CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline text-purple-700" />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-2 md:p-4">
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Customer Reminders</h5>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                  <CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline text-purple-700" />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-2 md:p-4">
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Automated Notifications</h5>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                  <CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline text-purple-700" />
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
                  <CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline text-purple-700" />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-2 md:p-4">
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Team Collaboration</h5>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                  <CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline text-purple-700" />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 gap-0">
                <div className="p-2 md:p-4">
                  <h5 className="text-[10px] md:text-base font-semibold text-gray-900">Wholesale Supplier Connection</h5>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200">
                  <p className="text-[10px] md:text-base font-bold text-gray-500">Not available</p>
                </div>
                <div className="p-2 md:p-4 text-center border-l border-gray-200 bg-purple-50/50">
                  <CheckCircle className="w-3 h-3 md:w-5 md:h-5 inline text-purple-700" />
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
        </div>
      </section>

      {/* Get Help - Q&A Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16 mb-4 md:mb-16">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold text-xs mb-4">
            <HelpCircle className="w-4 h-4" />
            Get Help
          </div>
          <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
            Frequently Asked Questions
          </h3>
          <p className="text-sm md:text-lg text-gray-600">
            Find answers to common questions about Very Simple Inventory
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Q&A 1 */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-blue-100">
            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              What is Very Simple Inventory?
            </h4>
            <p className="text-sm md:text-base text-gray-700">
              Very Simple Inventory is a rental management platform that helps you track your
              inventory, bookings, and customers all in one place. It's designed to be simple and
              easy to use, with no complicated setup required.
            </p>
          </div>

          {/* Q&A 2 */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-purple-100">
            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              Is it really free?
            </h4>
            <p className="text-sm md:text-base text-gray-700">
              Yes! We offer a free forever plan with essential features including up to 15 items,
              50 customers, and 25 bookings per month. No credit card required to get started.
            </p>
          </div>

          {/* Q&A 3 */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-green-100">
            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              How do I track my inventory?
            </h4>
            <p className="text-sm md:text-base text-gray-700">
              Simply add your rental items with quantities and details. The system automatically
              tracks availability, reservations, and sends low stock alerts when needed.
            </p>
          </div>

          {/* Q&A 4 */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-orange-100">
            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              Can I use it on my phone?
            </h4>
            <p className="text-sm md:text-base text-gray-700">
              Absolutely! Very Simple Inventory is fully responsive and works perfectly on all
              devices - phones, tablets, and desktops. Manage your business from anywhere.
            </p>
          </div>

          {/* Q&A 5 */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-pink-100">
            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
              What about premium features?
            </h4>
            <p className="text-sm md:text-base text-gray-700">
              Premium features like tax calculators, online payments, automated notifications, and
              unlimited items are coming soon. Sign up for free now and we'll notify you when
              they're available.
            </p>
          </div>

          {/* Q&A 6 */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-indigo-100">
            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              How do I get support?
            </h4>
            <p className="text-sm md:text-base text-gray-700">
              We provide email support at support@verysimpleinventory.com. Use the contact form
              below to send us a message, and we'll respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16 mb-8 md:mb-16">
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 border-4 border-blue-200">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold text-sm mb-4">
              <Mail className="w-4 h-4" />
              Contact Us
            </div>
            <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              Get in Touch
            </h3>
            <p className="text-sm md:text-lg text-gray-700 max-w-2xl mx-auto mb-4">
              Have a question, feedback, or need help? We're here to assist you!
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-base md:text-lg">
              <Mail className="w-5 h-5" />
              <a
                href="mailto:support@verysimpleinventory.com"
                className="hover:text-blue-800 transition-colors"
              >
                support@verysimpleinventory.com
              </a>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {contactStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-bold">Message sent successfully!</p>
                  <p className="text-green-700 text-sm">
                    We'll get back to you as soon as possible.
                  </p>
                </div>
              </div>
            )}

            {contactStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{contactErrorMessage}</p>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              {/* Honeypot field - hidden from users, catches bots */}
              <input
                type="text"
                name="website"
                value={contactFormData.website}
                onChange={handleContactFormChange}
                style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={contactFormData.name}
                  onChange={handleContactFormChange}
                  maxLength={100}
                  className={`w-full px-4 py-3 border-2 ${
                    fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all bg-white`}
                  placeholder="John Doe"
                  disabled={contactStatus === 'loading'}
                />
                {fieldErrors.name && (
                  <p className="text-red-600 text-xs mt-1 font-semibold">{fieldErrors.name}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">{contactFormData.name.length}/100</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={contactFormData.email}
                  onChange={handleContactFormChange}
                  maxLength={254}
                  className={`w-full px-4 py-3 border-2 ${
                    fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all bg-white`}
                  placeholder="john@example.com"
                  disabled={contactStatus === 'loading'}
                />
                {fieldErrors.email && (
                  <p className="text-red-600 text-xs mt-1 font-semibold">{fieldErrors.email}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">{contactFormData.email.length}/254</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={contactFormData.message}
                  onChange={handleContactFormChange}
                  maxLength={2000}
                  rows={5}
                  className={`w-full px-4 py-3 border-2 ${
                    fieldErrors.message ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all resize-none bg-white`}
                  placeholder="Tell us how we can help you..."
                  disabled={contactStatus === 'loading'}
                />
                {fieldErrors.message && (
                  <p className="text-red-600 text-xs mt-1 font-semibold">{fieldErrors.message}</p>
                )}
                <p className={`text-xs mt-1 ${
                  contactFormData.message.length >= 2000 ? 'text-red-600 font-bold' : 'text-gray-500'
                }`}>
                  {contactFormData.message.length}/2000 characters
                  {contactFormData.message.length < 10 && contactFormData.message.length > 0 && ' (minimum 10)'}
                </p>
              </div>

              <button
                type="submit"
                disabled={contactStatus === 'loading'}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base md:text-lg"
              >
                {contactStatus === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
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
