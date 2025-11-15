'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Home, Briefcase } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    businessName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Create account
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          businessName: formData.businessName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Auto sign in after successful signup
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        // If auto sign-in fails, redirect to sign-in page
        router.push('/auth/sign-in?message=Account created successfully. Please sign in.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
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
          <div className="inline-block p-2 md:p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl md:rounded-2xl shadow-lg mb-2 md:mb-4">
            <UserPlus className="w-8 h-8 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-black mb-1 md:mb-2">Create Account</h1>
          <p className="text-sm md:text-base text-gray-600">Start managing your rentals today</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 md:p-4 flex items-start gap-2 md:gap-3">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-bold text-black mb-1 md:mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full pl-8 md:pl-11 pr-2 md:pr-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black font-medium transition-all text-sm md:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-bold text-black mb-1 md:mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-2 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black font-medium transition-all text-sm md:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-bold text-black mb-1 md:mb-2">
                Business Name <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="My Rental Business"
                  maxLength={25}
                  className="w-full pl-8 md:pl-11 pr-2 md:pr-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black font-medium transition-all text-sm md:text-base"
                />
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                {formData.businessName.length}/25 characters
              </p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-bold text-black mb-1 md:mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-8 md:pl-11 pr-2 md:pr-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black font-medium transition-all text-sm md:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-bold text-black mb-1 md:mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-8 md:pl-11 pr-2 md:pr-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black font-medium transition-all text-sm md:text-base"
                />
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                At least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-bold text-black mb-1 md:mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-8 md:pl-11 pr-2 md:pr-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black font-medium transition-all text-sm md:text-base"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 md:py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 md:p-3 flex items-start gap-1.5 md:gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] md:text-xs text-blue-800">
                Free forever • No credit card required • Cancel anytime
              </p>
            </div>
          </form>

          <div className="mt-4 md:mt-6 text-center">
            <p className="text-gray-600 text-xs md:text-sm">
              Already have an account?{' '}
              <Link href="/auth/sign-in" className="text-blue-600 hover:text-blue-700 font-bold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
