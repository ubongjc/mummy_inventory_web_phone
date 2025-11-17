"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  Mail,
  Shield,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  userGrowth: Array<{ date: string; users: number }>;
  bookings: {
    total: number;
    inPeriod: number;
    byStatus: Array<{ status: string; count: number }>;
  };
  revenue: Array<{ date: string; amount: number }>;
  topItems: Array<{ name: string; bookings: number }>;
  inquiries: Array<{ date: string; count: number }>;
  subscriptions: Array<{ plan: string; date: string; count: number }>;
}

const COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  purple: "#a855f7",
  pink: "#ec4899",
};

const STATUS_COLORS: { [key: string]: string } = {
  pending: COLORS.warning,
  confirmed: COLORS.success,
  cancelled: COLORS.danger,
  completed: COLORS.info,
};

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/sign-in?redirect=/admin/analytics");
      return;
    }

    if (status === "authenticated") {
      fetchAnalytics();
    }
  }, [status, period, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?period=${period}`);

      if (response.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Unable to Load Analytics</h1>
          <p className="text-gray-600 mb-6">The analytics data could not be loaded. Please try again.</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => fetchAnalytics()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Try Again
            </button>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-4">
          <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-0">
            <Link
              href="/admin"
              className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg font-semibold transition-all duration-200 shadow-md text-xs md:text-sm"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Back to Dashboard</span>
              <span className="md:hidden">Back</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-base md:text-2xl font-bold text-black flex items-center gap-1 md:gap-2">
                <TrendingUp className="w-4 h-4 md:w-7 md:h-7 text-purple-600" />
                Analytics Dashboard
              </h1>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2 mt-2">
            <label className="text-xs md:text-sm font-semibold text-gray-700">
              Time Period:
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-2 md:px-3 py-1 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-black font-semibold text-xs md:text-sm"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-2 md:p-4 border border-gray-200">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              <h3 className="text-[10px] md:text-sm font-bold text-gray-700">
                New Users
              </h3>
            </div>
            <p className="text-base md:text-2xl font-bold text-black">
              {analytics?.userGrowth?.reduce((sum: number, d: any) => sum + d.users, 0) || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-2 md:p-4 border border-gray-200">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              <h3 className="text-[10px] md:text-sm font-bold text-gray-700">
                Bookings
              </h3>
            </div>
            <p className="text-base md:text-2xl font-bold text-black">
              {analytics?.bookings?.inPeriod || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-2 md:p-4 border border-gray-200">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
              <h3 className="text-[10px] md:text-sm font-bold text-gray-700">
                Revenue
              </h3>
            </div>
            <p className="text-base md:text-2xl font-bold text-black">
              ₦{(() => {
                const total = analytics?.revenue?.reduce((sum: number, d: any) => {
                  const amount = Number(d.amount) || 0;
                  // Sanity check: individual amount should be < 100 million
                  return sum + (amount > 100000000 ? 0 : amount);
                }, 0) || 0;
                // Cap total at 1 billion for display
                const cappedTotal = total > 1000000000 ? 0 : total;
                return cappedTotal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              })()}
            </p>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-2 md:p-4 border border-gray-200">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Mail className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              <h3 className="text-[10px] md:text-sm font-bold text-gray-700">
                Inquiries
              </h3>
            </div>
            <p className="text-base md:text-2xl font-bold text-black">
              {analytics?.inquiries?.reduce((sum: number, d: any) => sum + d.count, 0) || 0}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-200">
            <h3 className="text-sm md:text-xl font-bold text-black mb-3 md:mb-4">
              User Growth
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "10px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-200">
            <h3 className="text-sm md:text-xl font-bold text-black mb-3 md:mb-4">
              Daily Revenue
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.revenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "10px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="amount" fill={COLORS.success} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Status Pie Chart */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-200">
            <h3 className="text-sm md:text-xl font-bold text-black mb-3 md:mb-4">
              Bookings by Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics?.bookings.byStatus || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analytics?.bookings.byStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || COLORS.info}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Items Chart */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-200">
            <h3 className="text-sm md:text-xl font-bold text-black mb-3 md:mb-4">
              Most Booked Items
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={analytics?.topItems || []}
                layout="vertical"
                margin={{ left: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: "10px" }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="bookings" fill={COLORS.purple} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Inquiries Over Time */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-200">
            <h3 className="text-sm md:text-xl font-bold text-black mb-3 md:mb-4">
              Inquiries Over Time
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics?.inquiries || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "10px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "10px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.pink}
                  strokeWidth={3}
                  dot={{ fill: COLORS.pink, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
