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
  User,
  X,
  Trash2,
  Crown,
  UserCog,
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
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    if (confirmText !== "confirm") {
      alert("Please type 'confirm' to proceed");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      await fetchUsers();
      setSelectedUser(null);
      setConfirmText("");
      alert("User promoted to admin successfully!");
    } catch (error) {
      alert("Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirmText !== "confirm") {
      alert("Please type 'confirm' to proceed");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      await fetchUsers();
      setSelectedUser(null);
      setConfirmText("");
      alert("User deleted successfully!");
    } catch (error) {
      alert("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgradeToPremium = async (userId: string) => {
    if (confirmText !== "confirm") {
      alert("Please type 'confirm' to proceed");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "premium" }),
      });

      if (!response.ok) {
        throw new Error("Failed to upgrade user");
      }

      await fetchUsers();
      setSelectedUser(null);
      setConfirmText("");
      alert("User upgraded to premium successfully!");
    } catch (error) {
      alert("Failed to upgrade user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDowngradeToFree = async (userId: string) => {
    if (confirmText !== "confirm") {
      alert("Please type 'confirm' to proceed");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "free" }),
      });

      if (!response.ok) {
        throw new Error("Failed to downgrade user");
      }

      await fetchUsers();
      setSelectedUser(null);
      setConfirmText("");
      alert("User downgraded to free successfully!");
    } catch (error) {
      alert("Failed to downgrade user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (confirmText !== "confirm") {
      alert("Please type 'confirm' to proceed");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user" }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove admin role");
      }

      await fetchUsers();
      setSelectedUser(null);
      setConfirmText("");
      alert("Admin role removed successfully!");
    } catch (error) {
      alert("Failed to remove admin role");
    } finally {
      setActionLoading(false);
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

  const getUserName = (user: UserData) => {
    return user.businessName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg font-semibold transition-all duration-200 shadow-md text-xs"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </Link>
              <Users className="w-5 h-5 text-blue-600" />
              <h1 className="text-sm font-bold text-black">
                User Management
              </h1>
            </div>
            <div className="text-[10px] text-gray-600 font-medium">
              {filteredUsers.length}/{users.length}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 py-2">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex gap-2">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-2 py-1 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black font-medium text-xs"
              />
            </div>

            {/* Filter by Plan */}
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-2 py-1 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-[10px]"
            >
              <option value="all">Plans</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>

            {/* Filter by Role */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-2 py-1 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-[10px]"
            >
              <option value="all">Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Simple Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-200">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-900 mb-1">No Users Found</h3>
            <p className="text-xs text-gray-600">
              {searchQuery || filterPlan !== "all" || filterRole !== "all"
                ? "Try adjusting your search or filters"
                : "No users in the system yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-1 text-left text-[9px] font-bold text-black uppercase align-top">
                      User
                    </th>
                    <th className="px-2 py-1 text-[9px] font-bold text-black uppercase align-top">
                      <div className="flex flex-col items-start">
                        <span>Plan</span>
                      </div>
                    </th>
                    <th className="px-2 py-1 text-[9px] font-bold text-black uppercase align-top">
                      <div className="flex flex-col items-start">
                        <span>Role</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-2 py-1 align-top">
                        <div className="text-[10px] font-bold text-black truncate max-w-[150px]" title={getUserName(user)}>
                          {getUserName(user)}
                        </div>
                      </td>
                      <td className="px-2 py-1 align-top">
                        <div className="flex items-start">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap ${
                              user.plan === "premium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.plan.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-1 align-top">
                        <div className="flex items-start">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap ${
                              user.role === "admin"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role.toUpperCase()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
              <h2 className="text-sm font-bold text-white">User Details</h2>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setConfirmText("");
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 space-y-3">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-2 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-gray-700">Name:</span>
                  <span className="text-[10px] text-gray-900 truncate">{getUserName(selectedUser)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-gray-700">Email:</span>
                  <span className="text-[10px] text-gray-900 truncate">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-gray-700">Joined:</span>
                  <span className="text-[10px] text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-gray-700">Plan:</span>
                  <span className="text-[10px] text-gray-900">{selectedUser.plan.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-gray-700">Role:</span>
                  <span className="text-[10px] text-gray-900">{selectedUser.role.toUpperCase()}</span>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <p className="text-[10px] font-bold text-yellow-800 mb-1.5">
                  Type &quot;confirm&quot; to enable actions below
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type confirm"
                  className="w-full px-2 py-1 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-black text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {selectedUser.role !== "admin" && (
                  <button
                    onClick={() => handleMakeAdmin(selectedUser.id)}
                    disabled={confirmText !== "confirm" || actionLoading}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-600 hover:to-pink-700 transition-all text-[10px]"
                  >
                    <UserCog className="w-3 h-3" />
                    Make Admin
                  </button>
                )}

                {selectedUser.role === "admin" && selectedUser.id !== session?.user?.id && (
                  <button
                    onClick={() => handleRemoveAdmin(selectedUser.id)}
                    disabled={confirmText !== "confirm" || actionLoading}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-red-700 transition-all text-[10px]"
                  >
                    <UserCog className="w-3 h-3" />
                    Remove Admin Role
                  </button>
                )}

                {selectedUser.plan === "free" && (
                  <button
                    onClick={() => handleUpgradeToPremium(selectedUser.id)}
                    disabled={confirmText !== "confirm" || actionLoading}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-600 hover:to-orange-700 transition-all text-[10px]"
                  >
                    <Crown className="w-3 h-3" />
                    Upgrade to Premium
                  </button>
                )}

                {selectedUser.plan === "premium" && (
                  <button
                    onClick={() => handleDowngradeToFree(selectedUser.id)}
                    disabled={confirmText !== "confirm" || actionLoading}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-700 hover:to-gray-900 transition-all text-[10px]"
                  >
                    <X className="w-3 h-3" />
                    Downgrade to Free
                  </button>
                )}

                {selectedUser.id !== session?.user?.id && (
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    disabled={confirmText !== "confirm" || actionLoading}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:to-red-900 transition-all text-[10px]"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
