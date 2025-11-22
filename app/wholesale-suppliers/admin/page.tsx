"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Users,
  MapPin,
  Package,
  Shield,
  Ban,
  GitMerge,
  Clock,
  Database,
} from "lucide-react";

interface Stats {
  overview: {
    total_suppliers: number;
    approved: number;
    pending_approval: number;
    rejected: number;
    blacklisted: number;
    recently_added_7d: number;
  };
  confidence_distribution: {
    high: { count: number; percentage: number };
    medium: { count: number; percentage: number };
    low: { count: number; percentage: number };
    avg: number;
  };
  geographic_coverage: {
    states_covered: number;
    total_states: number;
    coverage_percentage: number;
    states: Array<{ state: string; supplier_count: number }>;
  };
  data_quality: {
    explicit_wholesale_language: { count: number; percentage: number };
    contact_coverage: {
      phone: { count: number; percentage: number };
      email: { count: number; percentage: number };
      website: { count: number; percentage: number };
    };
  };
  source_performance: Array<{
    platform: string;
    supplier_count: number;
    avg_confidence: number;
  }>;
}

interface PendingSupplier {
  id: string;
  company_name: string;
  confidence: number;
  state: string | null;
  categories: string[];
  phones: string[];
  emails: string[];
  needs_review_reason: string;
  submitted_at: string;
}

interface DuplicatePair {
  supplier1: {
    id: string;
    company_name: string;
    phones: string[];
    state: string;
    confidence: number;
  };
  supplier2: {
    id: string;
    company_name: string;
    phones: string[];
    state: string;
    confidence: number;
  };
  similarity: number;
  reason: string;
}

export default function WholesaleAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "approvals" | "duplicates" | "blacklist" | "refresh"
  >("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingSuppliers, setPendingSuppliers] = useState<PendingSupplier[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
    if (activeTab === "approvals") loadPendingApprovals();
    if (activeTab === "duplicates") loadDuplicates();
  }, [activeTab]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wholesale/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingApprovals = async () => {
    try {
      const response = await fetch("/api/wholesale/admin/approvals?status=pending&limit=50");
      if (response.ok) {
        const data = await response.json();
        setPendingSuppliers(data.pending_approvals);
      }
    } catch (error) {
      console.error("Error loading approvals:", error);
    }
  };

  const loadDuplicates = async () => {
    try {
      const response = await fetch("/api/wholesale/admin/duplicates?min_similarity=0.75&limit=50");
      if (response.ok) {
        const data = await response.json();
        setDuplicates(data.duplicate_pairs);
      }
    } catch (error) {
      console.error("Error loading duplicates:", error);
    }
  };

  const handleApprove = async (supplierId: string, overrideConfidence?: number) => {
    try {
      const response = await fetch(`/api/wholesale/admin/approvals/${supplierId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approved",
          override_confidence: overrideConfidence,
        }),
      });

      if (response.ok) {
        setPendingSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
        loadStats();
      }
    } catch (error) {
      console.error("Error approving supplier:", error);
    }
  };

  const handleReject = async (supplierId: string) => {
    try {
      const response = await fetch(`/api/wholesale/admin/approvals/${supplierId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rejected" }),
      });

      if (response.ok) {
        setPendingSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
        loadStats();
      }
    } catch (error) {
      console.error("Error rejecting supplier:", error);
    }
  };

  const handleMerge = async (primaryId: string, secondaryId: string) => {
    try {
      const response = await fetch("/api/wholesale/admin/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary_id: primaryId, secondary_id: secondaryId }),
      });

      if (response.ok) {
        setDuplicates((prev) =>
          prev.filter((d) => d.supplier1.id !== secondaryId && d.supplier2.id !== secondaryId)
        );
        loadStats();
      }
    } catch (error) {
      console.error("Error merging suppliers:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/wholesale/admin/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manual_refresh: true }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Refresh job started: ${data.run_id}\nEstimated duration: ${data.estimated_duration_minutes} minutes`);
      }
    } catch (error) {
      console.error("Error triggering refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Wholesale Suppliers Admin
          </h1>
          <p className="text-purple-100">
            Manage suppliers, approvals, duplicates, and data quality
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "approvals", label: "Approvals", icon: CheckCircle },
              { id: "duplicates", label: "Duplicates", icon: GitMerge },
              { id: "blacklist", label: "Blacklist", icon: Ban },
              { id: "refresh", label: "Refresh", icon: RefreshCw },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.id === "approvals" && pendingSuppliers.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingSuppliers.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Suppliers"
                value={stats.overview.total_suppliers}
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Approved"
                value={stats.overview.approved}
                icon={CheckCircle}
                color="green"
              />
              <MetricCard
                title="Pending Approval"
                value={stats.overview.pending_approval}
                icon={Clock}
                color="yellow"
              />
              <MetricCard
                title="States Covered"
                value={`${stats.geographic_coverage.states_covered}/37`}
                icon={MapPin}
                color="purple"
              />
            </div>

            {/* Confidence Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Confidence Distribution
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">High (≥80%)</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.confidence_distribution.high.count}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.confidence_distribution.high.percentage.toFixed(1)}% of total
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Medium (60-79%)</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.confidence_distribution.medium.count}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.confidence_distribution.medium.percentage.toFixed(1)}% of total
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Low (&lt;60%)</p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.confidence_distribution.low.count}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.confidence_distribution.low.percentage.toFixed(1)}% of total
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  Average Confidence:{" "}
                  <span className="font-bold text-gray-900">
                    {(stats.confidence_distribution.avg * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            </div>

            {/* Data Quality */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-600" />
                Data Quality
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Wholesale Verification</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.data_quality.explicit_wholesale_language.percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {stats.data_quality.explicit_wholesale_language.count} suppliers with
                      explicit wholesale language
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Contact Coverage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="font-bold text-gray-900">
                        {stats.data_quality.contact_coverage.phone.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-bold text-gray-900">
                        {stats.data_quality.contact_coverage.email.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Website:</span>
                      <span className="font-bold text-gray-900">
                        {stats.data_quality.contact_coverage.website.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top States */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Top States by Supplier Count
              </h2>
              <div className="space-y-2">
                {stats.geographic_coverage.states.slice(0, 10).map((stateData) => (
                  <div
                    key={stateData.state}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <span className="font-medium text-gray-700">{stateData.state}</span>
                    <span className="text-blue-600 font-bold">
                      {stateData.supplier_count} suppliers
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Source Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.source_performance.map((source) => (
                  <div key={source.platform} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1 capitalize">{source.platform}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {source.supplier_count}
                    </p>
                    <p className="text-sm text-gray-500">
                      Avg confidence: {(source.avg_confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === "approvals" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                Pending Approvals ({pendingSuppliers.length})
              </h2>
              {pendingSuppliers.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No suppliers pending approval
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingSuppliers.map((supplier) => (
                    <ApprovalCard
                      key={supplier.id}
                      supplier={supplier}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Duplicates Tab */}
        {activeTab === "duplicates" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                Potential Duplicates ({duplicates.length})
              </h2>
              {duplicates.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No duplicates found</p>
              ) : (
                <div className="space-y-4">
                  {duplicates.map((dup, i) => (
                    <DuplicateCard key={i} duplicate={dup} onMerge={handleMerge} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Refresh Tab */}
        {activeTab === "refresh" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-blue-600" />
                Manual Refresh
              </h2>
              <p className="text-gray-600 mb-6">
                Trigger a manual crawl to update supplier data. This will scrape all
                configured sources and update existing records.
              </p>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Starting refresh..." : "Start Manual Refresh"}
              </button>
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Background scraping functionality is not yet
                  implemented. This is a placeholder endpoint that queues the refresh job.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium opacity-80">{title}</p>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function ApprovalCard({
  supplier,
  onApprove,
  onReject,
}: {
  supplier: PendingSupplier;
  onApprove: (id: string, confidence?: number) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{supplier.company_name}</h3>
          <p className="text-sm text-gray-600">{supplier.state}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Confidence</p>
          <p className="text-lg font-bold text-yellow-600">
            {(supplier.confidence * 100).toFixed(0)}%
          </p>
        </div>
      </div>
      <div className="mb-3">
        <p className="text-sm text-red-600 font-medium">⚠️ {supplier.needs_review_reason}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onApprove(supplier.id, 0.8)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button
          onClick={() => onReject(supplier.id)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
  );
}

function DuplicateCard({
  duplicate,
  onMerge,
}: {
  duplicate: DuplicatePair;
  onMerge: (primaryId: string, secondaryId: string) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div className="bg-blue-50 rounded p-3">
          <p className="font-bold text-gray-900">{duplicate.supplier1.company_name}</p>
          <p className="text-sm text-gray-600">{duplicate.supplier1.state}</p>
          <p className="text-sm text-gray-600">
            Confidence: {(duplicate.supplier1.confidence * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-blue-50 rounded p-3">
          <p className="font-bold text-gray-900">{duplicate.supplier2.company_name}</p>
          <p className="text-sm text-gray-600">{duplicate.supplier2.state}</p>
          <p className="text-sm text-gray-600">
            Confidence: {(duplicate.supplier2.confidence * 100).toFixed(0)}%
          </p>
        </div>
      </div>
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          Similarity: <strong>{(duplicate.similarity * 100).toFixed(0)}%</strong>
        </p>
        <p className="text-sm text-gray-600">Reason: {duplicate.reason}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onMerge(duplicate.supplier1.id, duplicate.supplier2.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
        >
          <GitMerge className="w-4 h-4" />
          Merge (Keep Left)
        </button>
        <button
          onClick={() => onMerge(duplicate.supplier2.id, duplicate.supplier1.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
        >
          <GitMerge className="w-4 h-4" />
          Merge (Keep Right)
        </button>
      </div>
    </div>
  );
}
