'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Package,
} from 'lucide-react';

interface RentalRequest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  startDate: string;
  endDate: string;
  selectedItems: any;
  status: string;
  totalAmount: number | null;
  platformFee: number | null;
  paymentLinkUrl: string | null;
  denialReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function RentalRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Denial modal state
  const [showDenialModal, setShowDenialModal] = useState(false);
  const [denialRequestId, setDenialRequestId] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRequests();
    }
  }, [status, filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = filterStatus === 'all'
        ? '/api/rental-requests'
        : `/api/rental-requests?status=${filterStatus}`;

      const response = await fetch(url);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!confirm('Approve this booking request? The customer will be notified.')) {
      return;
    }

    setProcessingId(requestId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/rental-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'approve',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve request');
      }

      setSuccess('Request approved successfully!');
      fetchRequests();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async () => {
    if (!denialRequestId) return;

    setProcessingId(denialRequestId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/rental-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: denialRequestId,
          action: 'deny',
          denialReason: denialReason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deny request');
      }

      setSuccess('Request denied successfully!');
      setShowDenialModal(false);
      setDenialRequestId(null);
      setDenialReason('');
      fetchRequests();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to deny request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmPayment = async (requestId: string) => {
    if (!confirm('Confirm that the customer has paid? This will finalize the booking.')) {
      return;
    }

    setProcessingId(requestId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/rental-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'confirm_payment',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm payment');
      }

      setSuccess('Payment confirmed successfully!');
      fetchRequests();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm payment');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'confirmed_without_payment':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            <DollarSign className="w-4 h-4" />
            Awaiting Payment
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            Cancelled
          </span>
        );
      default:
        return <span className="text-gray-600">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Rental Requests</h1>
                <p className="text-gray-600 mt-1">Manage customer booking requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('confirmed_without_payment')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'confirmed_without_payment'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Awaiting Payment
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'confirmed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Requests List */}
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{request.name}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {request.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {request.email}
                        </div>
                      )}
                      {request.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {request.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Rental Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(request.startDate).toLocaleDateString()} -{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {request.totalAmount && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Total: ${Number(request.totalAmount).toFixed(2)}
                        {request.platformFee && (
                          <span className="text-gray-500 ml-2">
                            (+ ${Number(request.platformFee).toFixed(2)} platform fee)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Selected Items */}
                {request.selectedItems && Array.isArray(request.selectedItems) && request.selectedItems.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Selected Items
                    </h4>
                    <div className="space-y-1">
                      {request.selectedItems.map((item: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600 pl-6">
                          • {item.name} - Qty: {item.quantity} @ ${Number(item.price || 0).toFixed(2)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                {request.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2 text-sm">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-gray-700">{request.message}</p>
                    </div>
                  </div>
                )}

                {/* Denial Reason */}
                {request.denialReason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900">Denial Reason:</p>
                        <p className="text-red-800">{request.denialReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {processingId === request.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setDenialRequestId(request.id);
                          setShowDenialModal(true);
                        }}
                        disabled={processingId === request.id}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Deny
                      </button>
                    </>
                  )}
                  {request.status === 'confirmed_without_payment' && (
                    <button
                      onClick={() => handleConfirmPayment(request.id)}
                      disabled={processingId === request.id}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingId === request.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <DollarSign className="w-4 h-4" />
                      )}
                      Confirm Manual Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {filterStatus === 'all'
                ? "You haven't received any rental requests yet."
                : `No requests with status: ${filterStatus}`}
            </p>
          </div>
        )}
      </div>

      {/* Denial Modal */}
      {showDenialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Deny Booking Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              Provide a reason for denying this request (optional). A default message will be sent if you don't provide one.
            </p>
            <textarea
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
              placeholder="e.g., Unfortunately, the items you requested are not available for your selected dates..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleDeny}
                disabled={processingId !== null}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Confirm Denial
              </button>
              <button
                onClick={() => {
                  setShowDenialModal(false);
                  setDenialRequestId(null);
                  setDenialReason('');
                }}
                disabled={processingId !== null}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
