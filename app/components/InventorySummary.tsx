"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Package, Search, SlidersHorizontal, Maximize2, Minimize2 } from "lucide-react";

interface ItemSummary {
  id: string;
  name: string;
  unit: string;
  total: number;
  rented: number;
  remaining: number;
  createdAt?: string;
}

type SortOption = "name-asc" | "name-desc" | "newest" | "oldest" | "most-available" | "least-available" | "most-rented";

export default function InventorySummary() {
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "low" | "out">("all");
  const [currentDate, setCurrentDate] = useState<string>("");
  const itemsPerPage = 12;

  // Set current date on client side only
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }));
  }, []);

  useEffect(() => {
    fetchInventorySummary();
  }, []);

  const fetchInventorySummary = async () => {
    try {
      // Fetch all items
      const itemsResponse = await fetch("/api/items");
      const itemsData = await itemsResponse.json();

      // Fetch all active bookings
      const bookingsResponse = await fetch("/api/bookings");
      const bookingsData = await bookingsResponse.json();

      // Calculate rented quantities for each item
      const today = new Date();
      const itemSummaries = itemsData.map((item: any) => {
        const rented = bookingsData
          .filter((booking: any) => {
            const startDate = new Date(booking.startDate);
            const endDate = new Date(booking.endDate);
            return (
              (booking.status === "CONFIRMED" || booking.status === "OUT") &&
              startDate <= today &&
              endDate >= today
            );
          })
          .reduce((sum: number, booking: any) => {
            const bookingItem = booking.items?.find(
              (ri: any) => ri.itemId === item.id || ri.item?.id === item.id
            );
            return sum + (bookingItem?.quantity || 0);
          }, 0);

        return {
          id: item.id,
          name: item.name,
          unit: item.unit,
          total: item.totalQuantity,
          rented,
          remaining: item.totalQuantity - rented,
          createdAt: item.createdAt,
        };
      });

      setItems(itemSummaries);
      // Collapse all items by default
      setExpandedItems(new Set());
    } catch (error) {
      console.error("Error fetching inventory summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    setExpandedItems(new Set(items.map(item => item.id)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const sortItems = (itemsToSort: ItemSummary[]) => {
    const sorted = [...itemsToSort];
    switch (sortBy) {
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
        return sorted.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      case "oldest":
        return sorted.sort((a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );
      case "most-available":
        return sorted.sort((a, b) => b.remaining - a.remaining);
      case "least-available":
        return sorted.sort((a, b) => a.remaining - b.remaining);
      case "most-rented":
        return sorted.sort((a, b) => b.rented - a.rented);
      default:
        return sorted;
    }
  };

  const filterItems = (itemsToFilter: ItemSummary[]) => {
    let filtered = itemsToFilter;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    switch (statusFilter) {
      case "available":
        filtered = filtered.filter(item => item.remaining > 0);
        break;
      case "low":
        filtered = filtered.filter(item => {
          const percentage = (item.remaining / item.total) * 100;
          return percentage > 0 && percentage < 30;
        });
        break;
      case "out":
        filtered = filtered.filter(item => item.remaining === 0);
        break;
    }

    return filtered;
  };

  const processedItems = sortItems(filterItems(items));
  const totalPages = Math.ceil(processedItems.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentItems = processedItems.slice(startIndex, startIndex + itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage === 0) return "text-red-600 bg-red-50";
    if (percentage < 30) return "text-orange-600 bg-orange-50";
    if (percentage < 60) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const totalValue = items.reduce((sum, item) => sum + item.total, 0);
  const totalRented = items.reduce((sum, item) => sum + item.rented, 0);
  const totalAvailable = items.reduce((sum, item) => sum + item.remaining, 0);

  if (loading) {
    return (
      <div className="h-full bg-white rounded-2xl shadow-2xl p-4 border border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-4 h-4 text-white" />
          <h2 className="text-white font-bold text-base">Item Summary</h2>
        </div>
        {currentDate && (
          <div className="text-white/90 text-[9px] mb-2 font-medium">
            Showing availability for today: {currentDate}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-1 text-white">
          <div className="bg-white/20 rounded p-1 text-center">
            <div className="text-xs font-bold">{totalValue}</div>
            <div className="text-[9px]">Total</div>
          </div>
          <div className="bg-white/20 rounded p-1 text-center">
            <div className="text-xs font-bold">{totalRented}</div>
            <div className="text-[9px]">Out</div>
          </div>
          <div className="bg-white/20 rounded p-1 text-center">
            <div className="text-xs font-bold">{totalAvailable}</div>
            <div className="text-[9px]">Free</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-2 border-b border-gray-200 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium"
          />
        </div>

        {/* Sort and Filters */}
        <div className="flex gap-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="flex-1 text-[10px] px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold"
          >
            <option value="name-asc">A → Z</option>
            <option value="name-desc">Z → A</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-available">Most Free</option>
            <option value="least-available">Least Free</option>
            <option value="most-rented">Most Rented</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 text-[10px] px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold"
          >
            <option value="all">All Items</option>
            <option value="available">Available</option>
            <option value="low">Low Stock (&lt;30%)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        {/* Expand/Collapse All */}
        <div className="flex gap-1">
          <button
            onClick={expandAll}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-semibold transition-colors"
          >
            <Maximize2 className="w-3 h-3" />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-[10px] font-semibold transition-colors"
          >
            <Minimize2 className="w-3 h-3" />
            Collapse All
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {processedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">
            {searchQuery || statusFilter !== "all" ? "No items match your filters" : "No items yet"}
          </div>
        ) : (
          currentItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <div
                key={item.id}
                className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                {/* Header - Always Visible */}
                <div
                  onClick={() => toggleItem(item.id)}
                  className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                    )}
                    <h3 className="font-bold text-black text-xs leading-tight truncate flex-1">
                      {item.name}
                    </h3>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ml-1 ${getStatusColor(
                      item.remaining,
                      item.total
                    )}`}
                  >
                    {item.remaining}
                  </span>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-2 pb-2 space-y-1.5">
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="bg-blue-50 rounded p-1 text-center border border-blue-200">
                        <div className="text-blue-600 font-bold text-sm">
                          {item.total}
                        </div>
                        <div className="text-gray-600 font-medium text-[9px]">Total</div>
                      </div>

                      <div className="bg-red-50 rounded p-1 text-center border border-red-200">
                        <div className="text-red-600 font-bold text-sm">
                          {item.rented}
                        </div>
                        <div className="text-gray-600 font-medium text-[9px]">Out</div>
                      </div>

                      <div className="bg-green-50 rounded p-1 text-center border border-green-200">
                        <div className="text-green-600 font-bold text-sm">
                          {item.remaining}
                        </div>
                        <div className="text-gray-600 font-medium text-[9px]">Free</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.remaining === 0
                              ? "bg-red-500"
                              : item.remaining / item.total < 0.3
                              ? "bg-orange-500"
                              : item.remaining / item.total < 0.6
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${(item.remaining / item.total) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5 text-center">
                        {Math.round((item.remaining / item.total) * 100)}% available
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 p-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="p-1.5 rounded-lg bg-white border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-700" />
            </button>

            <div className="text-xs font-semibold text-gray-700">
              {currentPage + 1}/{totalPages}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="p-1.5 rounded-lg bg-white border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
