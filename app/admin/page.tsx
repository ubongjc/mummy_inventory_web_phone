"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Globe,
  Mail,
  Shield,
  BarChart3,
  DollarSign,
  Sparkles,
} from "lucide-react";

interface AdminStats {
  users: {
    total: number;
    free: number;
    premium: number;
    newThisMonth: number;
  };
  publicPages: {
    total: number;
    active: number;
  };
  inquiries: {
    total: number;
    newThisMonth: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/sign-in?redirect=/admin");
      return;
    }

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");

      if (response.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load statistics");
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
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalPremiumUsers = stats?.users.premium || 0;
  const premiumPercentage = stats
    ? ((totalPremiumUsers / stats.users.total) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-1 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg font-semibold transition-all duration-200 shadow-md text-xs md:text-sm"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Back to Dashboard</span>
              <span className="md:hidden">Back</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-base md:text-2xl font-bold text-black flex items-center gap-1 md:gap-2">
                <Shield className="w-4 h-4 md:w-7 md:h-7 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-[10px] md:text-sm text-gray-600 truncate">
                Welcome, {session?.user?.name || session?.user?.email}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-2 md:mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-2 md:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-1 md:mb-4">
              <div className="p-1.5 md:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg md:rounded-xl">
                <Users className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-[10px] md:text-sm font-semibold mb-0.5 md:mb-1">Total Users</h3>
            <p className="text-base md:text-3xl font-bold text-black">{stats?.users.total || 0}</p>
            <p className="text-[10px] md:text-sm text-green-600 font-semibold mt-1 md:mt-2">
              +{stats?.users.newThisMonth || 0} this month
            </p>
          </div>

          {/* Premium Users */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-2 md:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-1 md:mb-4">
              <div className="p-1.5 md:p-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg md:rounded-xl">
                <Sparkles className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-[10px] md:text-sm font-semibold mb-0.5 md:mb-1">Premium Users</h3>
            <p className="text-base md:text-3xl font-bold text-black">{totalPremiumUsers}</p>
            <p className="text-[10px] md:text-sm text-gray-600 font-semibold mt-1 md:mt-2">
              {premiumPercentage}% of total
            </p>
          </div>

          {/* Public Pages */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-2 md:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-1 md:mb-4">
              <div className="p-1.5 md:p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg md:rounded-xl">
                <Globe className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-[10px] md:text-sm font-semibold mb-0.5 md:mb-1">Public Pages</h3>
            <p className="text-base md:text-3xl font-bold text-black">{stats?.publicPages.total || 0}</p>
            <p className="text-[10px] md:text-sm text-gray-600 font-semibold mt-1 md:mt-2">
              {stats?.publicPages.active || 0} active
            </p>
          </div>

          {/* Inquiries */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-2 md:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-1 md:mb-4">
              <div className="p-1.5 md:p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg md:rounded-xl">
                <Mail className="w-3 h-3 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-[10px] md:text-sm font-semibold mb-0.5 md:mb-1">Inquiries</h3>
            <p className="text-base md:text-3xl font-bold text-black">{stats?.inquiries.total || 0}</p>
            <p className="text-[10px] md:text-sm text-green-600 font-semibold mt-1 md:mt-2">
              +{stats?.inquiries.newThisMonth || 0} this month
            </p>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-2 md:p-6 border border-gray-200 mb-2 md:mb-8">
          {/* Plan Distribution */}
          <h3 className="text-sm md:text-xl font-bold text-black mb-2 md:mb-6 flex items-center gap-1 md:gap-2">
            <BarChart3 className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
            Plan Distribution
          </h3>
          <div className="space-y-2 md:space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1 md:mb-2">
                <span className="text-[10px] md:text-sm font-semibold text-gray-700">Free Plan</span>
                <span className="text-[10px] md:text-sm font-bold text-black">{stats?.users.free || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div
                  className="bg-gradient-to-r from-gray-400 to-gray-600 h-2 md:h-3 rounded-full"
                  style={{
                    width: `${
                      stats ? (stats.users.free / stats.users.total) * 100 : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 md:mb-2">
                <span className="text-[10px] md:text-sm font-semibold text-gray-700">Premium Plan</span>
                <span className="text-[10px] md:text-sm font-bold text-black">{stats?.users.premium || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 h-2 md:h-3 rounded-full"
                  style={{
                    width: `${
                      stats ? (stats.users.premium / stats.users.total) * 100 : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-2 md:p-6 border border-gray-200">
          <h3 className="text-sm md:text-xl font-bold text-black mb-2 md:mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <Link
              href="/admin/users"
              className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg md:rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              <Users className="w-4 h-4 md:w-8 md:h-8" />
              <span className="font-semibold text-[10px] md:text-sm">Manage Users</span>
            </Link>
            <button
              className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg md:rounded-xl hover:from-yellow-600 hover:to-amber-700 transition-all opacity-50 cursor-not-allowed"
              disabled
            >
              <DollarSign className="w-4 h-4 md:w-8 md:h-8" />
              <span className="font-semibold text-[10px] md:text-sm">Billing</span>
            </button>
            <Link
              href="/admin/analytics"
              className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg md:rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              <BarChart3 className="w-4 h-4 md:w-8 md:h-8" />
              <span className="font-semibold text-[10px] md:text-sm">Analytics</span>
            </Link>
            <button
              className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg md:rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all opacity-50 cursor-not-allowed"
              disabled
            >
              <Mail className="w-4 h-4 md:w-8 md:h-8" />
              <span className="font-semibold text-[10px] md:text-sm">Email Users</span>
            </button>
          </div>
          <p className="text-[8px] md:text-xs text-gray-500 mt-2 md:mt-4 text-center">
            Some features are coming soon
          </p>
        </div>
      </main>
    </div>
  );
}
