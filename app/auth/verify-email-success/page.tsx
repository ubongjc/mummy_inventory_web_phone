'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

function VerifyEmailSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alreadyVerified = searchParams.get('already_verified') === 'true';
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/auth/sign-in?message=Email verified! Please sign in to continue.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Mail className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            {alreadyVerified ? 'Already Verified!' : 'Email Verified!'}
          </h1>
          <p className="text-gray-600">
            {alreadyVerified
              ? 'Your email was already verified'
              : 'Your email has been successfully verified'}
          </p>
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center gap-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
              <div>
                <p className="text-lg font-bold text-green-800 mb-2">
                  Welcome to VerySimple Inventory!
                </p>
                <p className="text-sm text-green-700">
                  You can now sign in and start managing your inventory.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Redirecting to sign in page in <span className="font-bold">{countdown}</span>{' '}
                second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>

            <Link
              href="/auth/sign-in"
              className="block w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-center"
            >
              Sign In Now
            </Link>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">What you can do next:</p>
              <ul className="text-sm text-gray-700 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Add inventory items and track stock</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Manage customers and bookings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Generate invoices and reports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function VerifyEmailSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailSuccessContent />
    </Suspense>
  );
}
