'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { Suspense } from 'react';

function VerifyEmailErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error') || 'unknown';

  const getErrorDetails = () => {
    switch (errorType) {
      case 'missing_token':
        return {
          title: 'Missing Verification Token',
          message:
            'The verification link is incomplete. Please check your email and click the full verification link.',
        };
      case 'invalid_token':
        return {
          title: 'Invalid Verification Link',
          message:
            'This verification link is invalid or may have been used already. Please check your email for the correct link.',
        };
      case 'used_token':
        return {
          title: 'Link Already Used',
          message:
            'This verification link has already been used. You can request a new verification email below.',
        };
      case 'rate_limit':
        return {
          title: 'Too Many Attempts',
          message:
            'Too many verification attempts. Please wait a few minutes and try again.',
        };
      case 'server_error':
        return {
          title: 'Server Error',
          message:
            'An unexpected error occurred while verifying your email. Please try again later.',
        };
      default:
        return {
          title: 'Verification Failed',
          message:
            'We could not verify your email address. Please try again or contact support.',
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg mb-4">
            <Mail className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Email Verification</h1>
          <p className="text-gray-600">Something went wrong</p>
        </div>

        {/* Error Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center gap-4">
              <AlertCircle className="w-16 h-16 text-red-600" />
              <div className="text-center">
                <p className="text-lg font-bold text-red-800 mb-2">{errorDetails.title}</p>
                <p className="text-sm text-red-700">{errorDetails.message}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">What can you do?</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Check your email inbox for the verification email</li>
                <li>Make sure you clicked the complete link from your email</li>
                <li>Try signing in - your email might already be verified</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/resend-verification"
                className="block w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-center"
              >
                Resend Verification Email
              </Link>

              <Link
                href="/auth/sign-in"
                className="block w-full py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-200 text-center"
              >
                Try Signing In
              </Link>

              <Link
                href="/auth/sign-up"
                className="block w-full py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-all duration-200 text-center"
              >
                Back to Sign Up
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-2">Need help?</p>
              <p className="text-xs text-gray-500">
                If you continue to have problems, please check your spam folder or contact
                support.
              </p>
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

export default function VerifyEmailErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailErrorContent />
    </Suspense>
  );
}
