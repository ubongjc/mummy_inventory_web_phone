'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Package,
  Send,
  CheckCircle,
  AlertCircle,
  Mail,
  ArrowLeft,
} from 'lucide-react';

// Contact Page - Handles both public and authenticated user contact forms
// Uses SMTP (Gmail) for sending emails to support@verysimpleinventory.com
export default function ContactPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '', // Honeypot field for spam protection
  });

  // Pre-populate name and email for logged-in users
  useEffect(() => {
    if (session?.user) {
      const fullName = [session.user.firstName, session.user.lastName]
        .filter(Boolean)
        .join(' ');
      setFormData((prev) => ({
        ...prev,
        name: fullName || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    const newErrors = { ...validationErrors };

    if (name === 'name') {
      if (!value.trim()) {
        newErrors.name = 'Name is required';
      } else if (value.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      } else if (value.length > 100) {
        newErrors.name = 'Name must be 100 characters or less';
      } else {
        newErrors.name = '';
      }
    } else if (name === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email is required';
      } else if (value.length > 254) {
        newErrors.email = 'Email must be 254 characters or less';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length > 0) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        newErrors.email = '';
      }
    } else if (name === 'message') {
      if (!value.trim()) {
        newErrors.message = 'Message is required';
      } else if (value.length > 150) {
        newErrors.message = 'Message must be 150 characters or less';
      } else {
        newErrors.message = '';
      }
    }

    setValidationErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submitting
    const errors = {
      name: '',
      email: '',
      message: '',
    };

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      errors.name = 'Name must be 100 characters or less';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (formData.email.length > 254) {
      errors.email = 'Email must be 254 characters or less';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Message validation
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.length > 150) {
      errors.message = 'Message must be 150 characters or less';
    }

    if (errors.name || errors.email || errors.message) {
      setValidationErrors(errors);
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: '', // Empty phone field (not collected in form)
          subject: 'general', // Default subject for simplified form
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        message: '',
        website: '',
      });
      setValidationErrors({
        name: '',
        email: '',
        message: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      const err = error instanceof Error ? error.message : 'Failed to send message';
      setErrorMessage(
        err.includes('rate limit')
          ? err
          : 'Failed to send message. Please try again or contact us directly via email.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Navigation - Conditional based on auth status */}
      {session ? (
        // Logged in users see Back to Dashboard button
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-md sm:shadow-lg text-xs sm:text-sm inline-flex"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        // Public users see standard navigation
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
      )}

      {/* Contact Section - Centered and Compact */}
      <div className="flex-1 flex items-center justify-center p-4">
        <section className="w-full max-w-lg">
          <div className="bg-white rounded-xl shadow-xl p-4 md:p-6 border border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">Get In Touch</h2>
            <p className="text-xs md:text-sm text-gray-600 mb-3 text-center">
              We&apos;re here to help Nigerian businesses succeed. Reach out with any questions, feedback, or support needs.
            </p>
            <div className="mb-4 text-center">
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1">
                Have a question, feedback, or need help? We&apos;re here to assist you!
              </h3>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm md:text-base">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@verysimpleinventory.com" className="hover:text-blue-800 transition-colors">
                  support@verysimpleinventory.com
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Honeypot field - hidden from users, catches bots */}
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className={`w-full px-3 py-2 border-2 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all text-sm`}
                  placeholder="Your name"
                />
                {validationErrors.name && (
                  <p className="text-red-600 text-xs mt-1 font-semibold">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-1">Please ensure your email is correct so we can respond to you</p>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={254}
                  className={`w-full px-3 py-2 border-2 ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all text-sm`}
                  placeholder="your@email.com"
                />
                {validationErrors.email && (
                  <p className="text-red-600 text-xs mt-1 font-semibold">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-gray-900 mb-1">
                  Your Message <span className="text-red-500">*</span> <span className="text-gray-500 font-normal">({formData.message.length}/150 characters)</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  rows={4}
                  className={`w-full px-3 py-2 border-2 ${
                    validationErrors.message ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all resize-none text-sm`}
                  placeholder="Tell us how we can help you..."
                />
                {validationErrors.message && (
                  <p className="text-red-600 text-xs mt-1 font-semibold">{validationErrors.message}</p>
                )}
              </div>

              {status === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-semibold text-sm">Message sent successfully!</p>
                    <p className="text-green-700 text-xs">
                      We&apos;ll get back to you as soon as possible.
                    </p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-xs">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {status === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Footer - Only show for public users */}
      {!session && (
        <footer className="bg-white border-t-2 border-gray-200">
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
      )}
    </div>
  );
}
