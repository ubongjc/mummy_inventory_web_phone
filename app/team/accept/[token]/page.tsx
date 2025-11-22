'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  Mail,
  Building2,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface InvitationData {
  email: string;
  role: string;
  businessName: string;
  businessEmail: string;
}

export default function AcceptInvitationPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const fetchInvitation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/team/invitations/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid invitation');
      }

      setInvitation(data.invitation);
    } catch (err: any) {
      setError(err.message || 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (status !== 'authenticated') {
      router.push(`/auth/sign-in?callbackUrl=/team/accept/${token}`);
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      const response = await fetch(`/api/team/invitations/${token}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Team!</h1>
          <p className="text-gray-600 mb-6">
            You've successfully joined {invitation?.businessName}. Redirecting to dashboard...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Invitation</h1>
          <p className="text-gray-600">You've been invited to join a team</p>
        </div>

        {/* Invitation Details */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Business</p>
                <p className="font-semibold text-gray-900">{invitation?.businessName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Invited Email</p>
                <p className="font-semibold text-gray-900">{invitation?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-semibold text-gray-900 capitalize">{invitation?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Role Description */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700">
            {invitation?.role === 'admin' && 'As an Admin, you will have full access to all features including team management and settings.'}
            {invitation?.role === 'manager' && 'As a Manager, you can manage bookings, items, customers, and view reports.'}
            {invitation?.role === 'staff' && 'As a Staff member, you can handle daily operations including bookings and customers.'}
            {invitation?.role === 'viewer' && 'As a Viewer, you will have read-only access to the dashboard and reports.'}
          </p>
        </div>

        {/* Action Buttons */}
        {status === 'authenticated' ? (
          <>
            {session?.user?.email?.toLowerCase() === invitation?.email?.toLowerCase() ? (
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    Accept Invitation
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <div className="text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    You're signed in as <strong>{session.user.email}</strong>, but this invitation is for{' '}
                    <strong>{invitation?.email}</strong>.
                  </p>
                </div>
                <Link
                  href="/api/auth/signout"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Sign out and use the correct account
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Sign In to Accept
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href={`/auth/sign-up?callbackUrl=/team/accept/${token}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
