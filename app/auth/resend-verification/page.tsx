'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle, Home, Send } from 'lucide-react';

export default function ResendVerificationPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setAlreadyVerified(false);
    setFieldError('');

    // Validate email
    if (!email || email.trim().length === 0) {
      setFieldError('Email is required');
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Please enter a valid email address');
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/resend-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(data.error || 'Failed to send verification email');
        }
      } else {
        if (data.alreadyVerified) {
          setAlreadyVerified(true);
          setSuccess(true);
        } else {
          setSuccess(true);
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-3 md:p-4">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="fixed top-2 left-2 md:top-4 md:left-4 flex items-center gap-2 px-6 py-4 md:px-8 md:py-5 bg-white text-gray-700 hover:text-blue-600 rounded-lg shadow-md hover:shadow-lg transition-all font-semibold text-base md:text-lg"
      >
        <Home className="w-8 h-8 md:w-10 md:h-10" />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-4 md:mb-8">
          <div className="inline-block p-3 md:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl md:rounded-2xl shadow-lg mb-2 md:mb-4">
            <Send className="w-8 h-8 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-1 md:mb-2">
            Resend Verification Email
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Enter your email to receive a new verification link
          </p>
        </div>

        {/* Resend Form */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 border border-gray-200">
          {success ? (
            <div className="space-y-6">
              {alreadyVerified ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center gap-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-800 mb-2">
                      Email Already Verified
                    </p>
                    <p className="text-sm text-green-700">
                      This email is already verified. You can sign in to your account.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col items-center gap-4">
                  <Mail className="w-12 h-12 text-blue-600" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-800 mb-2">
                      Verification Email Sent!
                    </p>
                    <p className="text-sm text-blue-700 mb-3">
                      Please check your inbox and click the verification link.
                    </p>
                    <p className="text-xs text-blue-600">
                      The link never expires, so you can verify your email at any time.
                    </p>
                  </div>
                </div>
              )}

              <Link
                href="/auth/sign-in"
                className="block w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-center text-sm md:text-base"
              >
                {alreadyVerified ? 'Go to Sign In' : 'Back to Sign In'}
              </Link>

              <button
                onClick={() => {
                  setSuccess(false);
                  setAlreadyVerified(false);
                  setEmail('');
                }}
                className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all text-center text-sm md:text-base"
              >
                Send Another Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If your email is not verified, we&apos;ll send you a new
                  verification link. Check your inbox and spam folder.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldError) {
                        setFieldError('');
                      }
                    }}
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium transition-all ${
                      fieldError
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {fieldError && (
                  <div className="mt-1 bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-xs text-red-700 font-medium">{fieldError}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {loading ? 'Sending...' : 'Send Verification Email'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600 text-sm">
              Remember your password?{' '}
              <Link
                href="/auth/sign-in"
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                Sign in
              </Link>
            </p>
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/sign-up"
                className="text-blue-600 hover:text-blue-700 font-bold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
