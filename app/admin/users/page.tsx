"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Shield,
  Search,
  Mail,
  Calendar,
  Star,
  User,
  Filter,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  role: string;
  plan: string;
  createdAt: string;
  logoUrl: string | null;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/sign-in?redirect=/admin/users");
      return;
    }

    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");

      if (response.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
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

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.businessName && user.businessName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlan = filterPlan === "all" || user.plan === filterPlan;
    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesPlan && matchesRole;
  });

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "pro":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "business":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === "admin"
      ? "bg-red-100 text-red-800 border-red-300"
      : "bg-blue-100 text-blue-800 border-blue-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg font-semibold transition-all duration-200 shadow-md text-xs md:text-sm"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Back to Admin</span>
              <span className="md:hidden">Back</span>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-2xl font-bold text-black flex items-center gap-1 md:gap-2">
                <Users className="w-4 h-4 md:w-7 md:h-7 text-blue-600" />
                <span className="truncate">User Management</span>
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                {filteredUsers.length} of {users.length} users
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 md:px-4 py-3 md:py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-3 md:p-6 mb-3 md:mb-6 border border-gray-200">
          <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Email, name, business..."
                  className="w-full pl-8 md:pl-10 pr-2 md:pr-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black text-xs md:text-base"
                />
              </div>
            </div>

            {/* Filter by Plan */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">
                Filter by Plan
              </label>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="w-full px-2 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-xs md:text-base"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="business">Business</option>
              </select>
            </div>

            {/* Filter by Role */}
            <div>
              <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-2 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-xs md:text-base"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg md:rounded-2xl shadow-lg p-6 md:p-12 text-center border border-gray-200">
            <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">No Users Found</h3>
            <p className="text-sm md:text-base text-gray-600">
              {searchQuery || filterPlan !== "all" || filterRole !== "all"
                ? "Try adjusting your search or filters"
                : "No users in the system yet"}
            </p>
          </div>
        ) : (
          <div className="grid gap-2 md:gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-2 md:gap-4">
                  {/* User Avatar/Logo */}
                  <div className="flex-shrink-0">
                    {user.logoUrl ? (
                      <img
                        src={user.logoUrl}
                        alt={user.businessName || "User"}
                        className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-xl object-cover border-2 border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="w-5 h-5 md:w-8 md:h-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 md:mb-2 gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm md:text-lg font-bold text-gray-900 truncate">
                          {user.businessName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed User"}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </p>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-1 md:gap-2 flex-shrink-0">
                        <span
                          className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold border ${getPlanBadgeColor(
                            user.plan
                          )}`}
                        >
                          {user.plan.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold border ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden md:inline">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        <span className="md:hidden">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                      </span>
                      {user.firstName && user.lastName && (
                        <span className="flex items-center gap-1 truncate">
                          <User className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate">{user.firstName} {user.lastName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-3 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-2 md:p-4 border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 font-semibold mb-0.5 md:mb-1">Total Users</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-2 md:p-4 border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 font-semibold mb-0.5 md:mb-1">Free Users</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">
              {users.filter((u) => u.plan === "free").length}
            </p>
          </div>
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-2 md:p-4 border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 font-semibold mb-0.5 md:mb-1">Pro Users</p>
            <p className="text-lg md:text-2xl font-bold text-yellow-700">
              {users.filter((u) => u.plan === "pro").length}
            </p>
          </div>
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-2 md:p-4 border border-gray-200">
            <p className="text-xs md:text-sm text-gray-600 font-semibold mb-0.5 md:mb-1">Business Users</p>
            <p className="text-lg md:text-2xl font-bold text-purple-700">
              {users.filter((u) => u.plan === "business").length}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
