'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Package,
  Target,
  BarChart3,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface AnalyticsData {
  itemUtilization: Array<{
    itemName: string;
    totalQuantity: number;
    timesRented: number;
    daysRented: number;
    utilizationRate: string;
  }>;
  avgUtilizationRate: string;
  revenueTrends: Array<{ date: string; revenue: number }>;
  totalRevenue: string;
  avgRevenuePerBooking: string;
  conversionRate: string;
  bookingConversionRate: string;
  totalInquiries: number;
  convertedInquiries: number;
  totalBookings: number;
  confirmedBookings: number;
  mostProfitable: Array<{
    name: string;
    revenue: string;
    bookings: number;
    avgRevenuePerBooking: string;
  }>;
  paymentStats: {
    totalPaid: string;
    totalBookingValue: string;
    outstandingBalance: string;
    collectionRate: string;
    avgPaymentAmount: string;
    paymentCount: number;
  };
  bookingsByStatus: {
    CONFIRMED: number;
    OUT: number;
    RETURNED: number;
    CANCELLED: number;
  };
  period: number;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnalytics();
    }
  }, [status, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics?period=${period}`);

      if (response.status === 403) {
        setError('Premium subscription required to access Custom Analytics');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Access Restricted</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Link
            href="/premium"
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Upgrade to Premium
          </Link>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Custom Analytics
          </h1>
          <p className="text-green-100">
            Track utilization, revenue trends, conversion rates, and profitability
          </p>

          {/* Period Selector */}
          <div className="mt-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold shadow-md"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Avg Utilization</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.avgUtilizationRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Items rented vs available</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Total Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">₦{parseFloat(analytics.totalRevenue).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">₦{parseFloat(analytics.avgRevenuePerBooking).toLocaleString()} per booking</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Conversion Rate</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.bookingConversionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Quotes to confirmed bookings</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600">Collection Rate</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.paymentStats.collectionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Payments collected</p>
          </div>
        </div>

        {/* Item Utilization */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Item Utilization Rates
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Item</th>
                  <th className="text-right py-3 px-4">Times Rented</th>
                  <th className="text-right py-3 px-4">Days Rented</th>
                  <th className="text-right py-3 px-4">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {analytics.itemUtilization.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.itemName}</td>
                    <td className="text-right py-3 px-4">{item.timesRented}</td>
                    <td className="text-right py-3 px-4">{item.daysRented}</td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(parseFloat(item.utilizationRate), 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold">{item.utilizationRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analytics.itemUtilization.length === 0 && (
              <p className="text-center py-8 text-gray-500">No utilization data available</p>
            )}
          </div>
        </div>

        {/* Most Profitable Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Most Profitable Items
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Item</th>
                  <th className="text-right py-3 px-4">Total Revenue</th>
                  <th className="text-right py-3 px-4">Bookings</th>
                  <th className="text-right py-3 px-4">Avg/Booking</th>
                </tr>
              </thead>
              <tbody>
                {analytics.mostProfitable.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="text-right py-3 px-4 font-bold text-green-600">
                      ₦{parseFloat(item.revenue).toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">{item.bookings}</td>
                    <td className="text-right py-3 px-4">
                      ₦{parseFloat(item.avgRevenuePerBooking).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analytics.mostProfitable.length === 0 && (
              <p className="text-center py-8 text-gray-500">No profitability data available</p>
            )}
          </div>
        </div>

        {/* Payment Collection Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-purple-600" />
            Payment Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Booking Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{parseFloat(analytics.paymentStats.totalBookingValue).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Collected</p>
              <p className="text-2xl font-bold text-green-600">
                ₦{parseFloat(analytics.paymentStats.totalPaid).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Outstanding Balance</p>
              <p className="text-2xl font-bold text-orange-600">
                ₦{parseFloat(analytics.paymentStats.outstandingBalance).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Collection Progress</span>
              <span className="text-sm font-bold text-purple-600">
                {analytics.paymentStats.collectionRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(parseFloat(analytics.paymentStats.collectionRate), 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Booking Status Distribution
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{analytics.bookingsByStatus.CONFIRMED}</p>
              <p className="text-sm text-gray-600 mt-1">Confirmed</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{analytics.bookingsByStatus.OUT}</p>
              <p className="text-sm text-gray-600 mt-1">Out</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{analytics.bookingsByStatus.RETURNED}</p>
              <p className="text-sm text-gray-600 mt-1">Returned</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{analytics.bookingsByStatus.CANCELLED}</p>
              <p className="text-sm text-gray-600 mt-1">Cancelled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
