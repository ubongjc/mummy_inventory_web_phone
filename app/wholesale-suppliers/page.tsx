"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle,
  TrendingUp,
  Truck,
  Package,
  Clock,
} from "lucide-react";

interface Supplier {
  id: string;
  supplier_id: string;
  company_name: string;
  aka_names: string[];
  categories: string[];
  product_examples: string[];
  wholesale_terms: {
    bulk_available: boolean;
    moq_units?: number;
    price_range_hint?: string;
    lead_time_days?: number;
    delivery_options: string[];
    returns_warranty?: string;
  };
  state: string | null;
  lga_or_city: string | null;
  phones: string[];
  whatsapp: string[];
  emails: string[];
  websites: string[];
  ratings: {
    google?: { stars: number; count: number };
    facebook?: { stars: number; count: number };
  };
  verifications: {
    explicit_wholesale_language: boolean;
    evidence_snippets: string[];
    cac_number?: string;
  };
  confidence: number;
  last_seen_at: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total_results: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

const CATEGORY_LABELS: { [key: string]: string } = {
  seating: "Seating",
  tables: "Tables",
  tents: "Tents & Canopies",
  flooring_grass: "Flooring & Grass",
  linens: "Linens",
  decor: "Decor",
  lighting: "Lighting",
  sound: "Sound Equipment",
  staging_truss: "Staging & Truss",
  catering: "Catering Ware",
  power_generators: "Generators",
  mobile_toilet: "Mobile Toilets",
  bridal_wear: "Bridal Wear",
};

export default function WholesaleSuppliersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [selectedStates, setSelectedStates] = useState<string[]>(
    searchParams.get("states")?.split(",").filter(Boolean) || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || []
  );
  const [minConfidence, setMinConfidence] = useState(
    searchParams.get("min_confidence") || "0.6"
  );
  const [deliveryOption, setDeliveryOption] = useState(
    searchParams.get("delivery_options") || ""
  );
  const [explicitWholesaleOnly, setExplicitWholesaleOnly] = useState(
    searchParams.get("explicit_wholesale_only") === "true"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  // Load suppliers
  useEffect(() => {
    loadSuppliers();
  }, [
    page,
    searchQuery,
    selectedStates,
    selectedCategories,
    minConfidence,
    deliveryOption,
    explicitWholesaleOnly,
  ]);

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (selectedStates.length > 0) params.set("states", selectedStates.join(","));
      if (selectedCategories.length > 0)
        params.set("categories", selectedCategories.join(","));
      if (minConfidence) params.set("min_confidence", minConfidence);
      if (deliveryOption) params.set("delivery_options", deliveryOption);
      if (explicitWholesaleOnly) params.set("explicit_wholesale_only", "true");
      params.set("page", page.toString());
      params.set("limit", "20");
      params.set("sort", "confidence");
      params.set("order", "desc");

      const response = await fetch(`/api/wholesale/suppliers?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to load suppliers");
      }

      const data = await response.json();
      setSuppliers(data.suppliers);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error loading suppliers:", err);
      setError("Failed to load suppliers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadSuppliers();
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setPage(1);
  };

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStates([]);
    setSelectedCategories([]);
    setMinConfidence("0.6");
    setDeliveryOption("");
    setExplicitWholesaleOnly(false);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Wholesale Suppliers Directory
          </h1>
          <p className="text-blue-100">
            Find verified wholesale suppliers for event rentals across Nigeria
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by company name, products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(key)}
                          onChange={() => toggleCategory(key)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Delivery Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Options
                  </label>
                  <select
                    value={deliveryOption}
                    onChange={(e) => {
                      setDeliveryOption(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All</option>
                    <option value="nationwide">Nationwide</option>
                    <option value="regional">Regional</option>
                    <option value="pickup_only">Pickup Only</option>
                  </select>
                </div>

                {/* Confidence Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Confidence: {(parseFloat(minConfidence) * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={minConfidence}
                    onChange={(e) => {
                      setMinConfidence(e.target.value);
                      setPage(1);
                    }}
                    className="w-full"
                  />
                </div>

                {/* Verified Only */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={explicitWholesaleOnly}
                      onChange={(e) => {
                        setExplicitWholesaleOnly(e.target.checked);
                        setPage(1);
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Verified Wholesale Only
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading suppliers...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadSuppliers}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              No suppliers found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Found <strong>{pagination?.total_results || 0}</strong> suppliers
              </p>
            </div>

            {/* Supplier Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.has_prev}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.has_next}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const router = useRouter();

  const googleRating = supplier.ratings?.google?.stars || null;
  const hasVerifiedWholesale = supplier.verifications?.explicit_wholesale_language;
  const hasNationwide = supplier.wholesale_terms?.delivery_options?.includes("nationwide");

  return (
    <div
      onClick={() => router.push(`/wholesale-suppliers/${supplier.id}`)}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {supplier.company_name}
          </h3>
          {supplier.aka_names.length > 0 && (
            <p className="text-sm text-gray-500">
              AKA: {supplier.aka_names.join(", ")}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              {(supplier.confidence * 100).toFixed(0)}%
            </span>
          </div>
          {hasVerifiedWholesale && (
            <div className="flex items-center gap-1 text-blue-600 mt-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-3">
        {supplier.categories.map((cat) => (
          <span
            key={cat}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
          >
            {CATEGORY_LABELS[cat] || cat}
          </span>
        ))}
      </div>

      {/* Products */}
      {supplier.product_examples.length > 0 && (
        <p className="text-sm text-gray-600 mb-3">
          <Package className="inline w-4 h-4 mr-1" />
          {supplier.product_examples.slice(0, 3).join(", ")}
          {supplier.product_examples.length > 3 && "..."}
        </p>
      )}

      {/* Location */}
      {supplier.state && (
        <p className="text-sm text-gray-600 mb-3">
          <MapPin className="inline w-4 h-4 mr-1" />
          {supplier.lga_or_city ? `${supplier.lga_or_city}, ` : ""}
          {supplier.state}
        </p>
      )}

      {/* Wholesale Terms */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        {supplier.wholesale_terms?.moq_units && (
          <div>
            <span className="text-gray-500">MOQ:</span>{" "}
            <span className="font-medium">{supplier.wholesale_terms.moq_units} units</span>
          </div>
        )}
        {supplier.wholesale_terms?.lead_time_days && (
          <div>
            <Clock className="inline w-4 h-4 mr-1" />
            <span className="font-medium">{supplier.wholesale_terms.lead_time_days} days</span>
          </div>
        )}
        {hasNationwide && (
          <div className="col-span-2">
            <Truck className="inline w-4 h-4 mr-1 text-green-600" />
            <span className="text-green-600 font-medium">Nationwide Delivery</span>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-200">
        {supplier.phones.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{supplier.phones[0]}</span>
          </div>
        )}
        {supplier.emails.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{supplier.emails[0]}</span>
          </div>
        )}
        {googleRating && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{googleRating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
