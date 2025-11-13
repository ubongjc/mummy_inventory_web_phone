"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Search, ChevronDown, ChevronUp, Trash2, Edit2, User, Package, Maximize2, Minimize2, ChevronLeft, ChevronRight, Plus, X, CheckSquare, Square, Filter, Menu, Settings } from "lucide-react";
import EditBookingModal from "../components/EditBookingModal";
import DatePicker from "../components/DatePicker";
import { useSettings } from "@/app/hooks/useSettings";
import { toZonedTime } from "date-fns-tz";

interface BookingItem {
  id: string;
  itemId: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    unit: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  notes?: string;
}

interface Booking {
  id: string;
  customerId: string;
  startDate: string;
  endDate: string;
  status: string;
  color?: string;
  notes?: string;
  totalPrice?: number;
  advancePayment?: number;
  paymentDueDate?: string;
  customer: {
    id: string;
    name: string; // For backward compatibility
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
  items: BookingItem[];
  payments?: Payment[];
  createdAt: string;
}

type SortOption = "start-newest" | "start-oldest" | "end-newest" | "end-oldest" | "customer-asc" | "customer-desc" | "status";
type StatusFilter = "all" | "CONFIRMED" | "OUT" | "RETURNED" | "CANCELLED" | "OVERDUE";
type DateRangeFilter = "today" | "current-week" | "next-week" | "current-month" | "next-month" | "all" | "custom";

interface Item {
  id: string;
  name: string;
  unit: string;
  totalQuantity: number;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("start-newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("CONFIRMED");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>("current-month");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const bookingsPerPage = 15;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [addingPaymentFor, setAddingPaymentFor] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const { formatCurrency, settings } = useSettings();
  const [isItemFilterOpen, setIsItemFilterOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [itemSortBy, setItemSortBy] = useState<"name-asc" | "name-desc" | "quantity-desc" | "quantity-asc" | "unit">("name-asc");
  const [isDefaultFiltersOpen, setIsDefaultFiltersOpen] = useState(false);

  // Temporary state for editing defaults in the dropdown
  const [tempDateRangeFilter, setTempDateRangeFilter] = useState<DateRangeFilter>(dateRangeFilter);
  const [tempSortBy, setTempSortBy] = useState<SortOption>(sortBy);
  const [tempStatusFilter, setTempStatusFilter] = useState<StatusFilter>(statusFilter);

  // Load default filters from localStorage on mount
  useEffect(() => {
    const savedDefaults = localStorage.getItem("bookingsDefaultFilters");
    if (savedDefaults) {
      try {
        const defaults = JSON.parse(savedDefaults);
        if (defaults.dateRangeFilter) setDateRangeFilter(defaults.dateRangeFilter);
        if (defaults.sortBy) setSortBy(defaults.sortBy);
        if (defaults.statusFilter) setStatusFilter(defaults.statusFilter);
      } catch (error) {
        console.error("Error loading default filters:", error);
      }
    }
  }, []);

  // Sync temp values when dropdown opens
  useEffect(() => {
    if (isDefaultFiltersOpen) {
      setTempDateRangeFilter(dateRangeFilter);
      setTempSortBy(sortBy);
      setTempStatusFilter(statusFilter);
    }
  }, [isDefaultFiltersOpen, dateRangeFilter, sortBy, statusFilter]);

  useEffect(() => {
    fetchBookings();
    fetchItems();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, searchQuery, sortBy, statusFilter, dateRangeFilter, startDateFilter, endDateFilter, settings, selectedItemIds]);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      setItems(data);
      // Select all items by default
      setSelectedItemIds(data.map((item: Item) => item.id));
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    setSelectedItemIds(items.map(item => item.id));
  };

  const deselectAllItems = () => {
    setSelectedItemIds([]);
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (filter: DateRangeFilter): { start: Date; end: Date } | null => {
    const now = new Date();
    const timezone = settings?.timezone || "UTC";

    // Convert current time to the configured timezone to get the correct "today"
    const nowInTimezone = toZonedTime(now, timezone);

    // Create UTC midnight date using the date components from the configured timezone
    const today = new Date(Date.UTC(
      nowInTimezone.getFullYear(),
      nowInTimezone.getMonth(),
      nowInTimezone.getDate()
    ));

    console.log('[DATE FILTER] Now:', now.toISOString());
    console.log('[DATE FILTER] Timezone:', timezone);
    console.log('[DATE FILTER] Now in timezone:', nowInTimezone);
    console.log('[DATE FILTER] Today (UTC midnight):', today.toISOString());

    switch (filter) {
      case "today": {
        console.log('[DATE FILTER] Filter=today, start:', today.toISOString(), 'end:', today.toISOString());
        return { start: today, end: today };
      }
      case "current-week": {
        const dayOfWeek = today.getUTCDay();
        const start = new Date(today);
        start.setUTCDate(today.getUTCDate() - dayOfWeek);
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 6);
        return { start, end };
      }
      case "next-week": {
        const dayOfWeek = today.getUTCDay();
        const start = new Date(today);
        start.setUTCDate(today.getUTCDate() - dayOfWeek + 7);
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 6);
        return { start, end };
      }
      case "current-month": {
        const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
        const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
        return { start, end };
      }
      case "next-month": {
        const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
        const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 2, 0));
        return { start, end };
      }
      default:
        return null;
    }
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    // Search filter (customer name, item names, notes)
    if (searchQuery) {
      filtered = filtered.filter((booking) => {
        const fullName = `${booking.customer.firstName || booking.customer.name} ${booking.customer.lastName || ""}`.trim();
        const customerMatch = fullName.toLowerCase().includes(searchQuery.toLowerCase());
        const itemsMatch = booking.items.some((item) =>
          item.item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const notesMatch = booking.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return customerMatch || itemsMatch || notesMatch;
      });
    }

    // Item filter - only show bookings that include at least one selected item
    if (selectedItemIds.length === 0) {
      // If no items selected, show no bookings
      filtered = [];
    } else if (selectedItemIds.length < items.length) {
      // If some items selected, filter to show only matching bookings
      filtered = filtered.filter((booking) => {
        return booking.items.some((item) => selectedItemIds.includes(item.itemId));
      });
    }
    // If all items selected, show all bookings (no filter needed)

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "OVERDUE") {
        // Overdue payments filter
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight for comparison

        filtered = filtered.filter((booking) => {
          // Must have a total price
          if (!booking.totalPrice) return false;

          // Calculate balance remaining
          const totalPaid = (booking.advancePayment ? Number(booking.advancePayment) : 0) +
                           (booking.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0);
          const balance = Number(booking.totalPrice) - totalPaid;

          // Must have outstanding balance
          if (balance <= 0) return false;

          // Check if payment is overdue based on either paymentDueDate or endDate
          let isOverdue = false;

          // Check if payment due date has passed (if it exists)
          if (booking.paymentDueDate) {
            const dueDate = new Date(booking.paymentDueDate);
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate < today) {
              isOverdue = true;
            }
          }

          // Also check if booking has ended (endDate in the past) with unpaid balance
          if (booking.endDate) {
            const endDate = new Date(booking.endDate);
            endDate.setHours(0, 0, 0, 0);
            if (endDate < today) {
              isOverdue = true;
            }
          }

          return isOverdue;
        });
      } else {
        filtered = filtered.filter((booking) => booking.status === statusFilter);
      }
    }

    // Date range preset filter
    if (dateRangeFilter !== "all" && dateRangeFilter !== "custom") {
      const range = getDateRange(dateRangeFilter);
      if (range) {
        const beforeFilter = filtered.length;
        filtered = filtered.filter((booking) => {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          // Include booking if it overlaps with the range
          const included = bookingStart <= range.end && bookingEnd >= range.start;
          if (!included) {
            console.log(`[DATE FILTER] Excluding booking: ${booking.customer.name}, start: ${booking.startDate}, end: ${booking.endDate}`);
            console.log(`[DATE FILTER]   bookingStart (${bookingStart.toISOString()}) <= range.end (${range.end.toISOString()})? ${bookingStart <= range.end}`);
            console.log(`[DATE FILTER]   bookingEnd (${bookingEnd.toISOString()}) >= range.start (${range.start.toISOString()})? ${bookingEnd >= range.start}`);
          }
          return included;
        });
        console.log(`[DATE FILTER] Filtered from ${beforeFilter} to ${filtered.length} bookings`);
      }
    }

    // Custom date range filter
    if (dateRangeFilter === "custom") {
      if (startDateFilter) {
        filtered = filtered.filter((booking) => new Date(booking.endDate) >= new Date(startDateFilter));
      }
      if (endDateFilter) {
        filtered = filtered.filter((booking) => new Date(booking.startDate) <= new Date(endDateFilter));
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "start-newest":
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case "start-oldest":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case "end-newest":
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
        case "end-oldest":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case "customer-asc":
          const aName = `${a.customer.firstName || a.customer.name} ${a.customer.lastName || ""}`.trim();
          const bName = `${b.customer.firstName || b.customer.name} ${b.customer.lastName || ""}`.trim();
          return aName.localeCompare(bName);
        case "customer-desc":
          const aNameDesc = `${a.customer.firstName || a.customer.name} ${a.customer.lastName || ""}`.trim();
          const bNameDesc = `${b.customer.firstName || b.customer.name} ${b.customer.lastName || ""}`.trim();
          return bNameDesc.localeCompare(aNameDesc);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
    setCurrentPage(0); // Reset to first page when filters change
  };

  const toggleBooking = (id: string) => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedBookings(newExpanded);
  };

  const expandAll = () => {
    setExpandedBookings(new Set(filteredBookings.map(booking => booking.id)));
  };

  const collapseAll = () => {
    setExpandedBookings(new Set());
  };

  const deleteBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete booking" }));
        throw new Error(errorData.error || "Failed to delete booking");
      }

      fetchBookings();
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      alert(`Failed to delete booking: ${error.message}`);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchBookings(); // Refresh the bookings list
  };

  const handleUpdateBookingColor = async (bookingId: string, color: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ color }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking color");
      }

      // Refresh the bookings list
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking color:", error);
      alert("Failed to update booking color");
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      // Refresh the bookings list
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status");
    }
  };

  const handleAddPayment = async (bookingId: string) => {
    if (!paymentAmount || parseFloat(paymentAmount) < 0.01) {
      setPaymentError("Please enter a valid payment amount (minimum 0.01)");
      return;
    }

    // Find the booking to validate against total price
    const booking = bookings.find(r => r.id === bookingId);
    if (booking && booking.totalPrice) {
      const newPaymentAmount = parseFloat(paymentAmount);
      const totalPaid = (booking.advancePayment ? Number(booking.advancePayment) : 0) +
                        (booking.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0);
      const remainingBalance = Number(booking.totalPrice) - totalPaid;

      if (newPaymentAmount > remainingBalance) {
        setPaymentError(`Payment amount (${formatCurrency(newPaymentAmount)}) exceeds remaining balance (${formatCurrency(remainingBalance)})`);
        return;
      }
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          paymentDate: paymentDate || new Date().toISOString(),
          notes: paymentNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add payment");
      }

      // Reset form and refresh data
      setPaymentAmount("");
      setPaymentDate("");
      setPaymentNotes("");
      setPaymentError("");
      setAddingPaymentFor(null);
      fetchBookings();
    } catch (err: any) {
      setPaymentError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "OUT":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "RETURNED":
        return "bg-green-50 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    // Extract YYYY-MM-DD portion to avoid timezone issues
    const datePart = dateString.split('T')[0]; // "2025-11-06"
    const [year, month, day] = datePart.split('-').map(Number);

    // Create date using UTC to avoid timezone shifts
    const date = new Date(Date.UTC(year, month - 1, day));

    // Format using UTC methods
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`;
  };

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const startIndex = currentPage * bookingsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, startIndex + bookingsPerPage);

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

  const saveDefaultFilters = () => {
    const defaults = {
      dateRangeFilter: tempDateRangeFilter,
      sortBy: tempSortBy,
      statusFilter: tempStatusFilter,
    };
    localStorage.setItem("bookingsDefaultFilters", JSON.stringify(defaults));

    // Apply the temp values to the current filters
    setDateRangeFilter(tempDateRangeFilter);
    setSortBy(tempSortBy);
    setStatusFilter(tempStatusFilter);

    setIsDefaultFiltersOpen(false);
  };

  const clearDefaultFilters = () => {
    localStorage.removeItem("bookingsDefaultFilters");
    setIsDefaultFiltersOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Menu Overlay */}
      {isItemFilterOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsItemFilterOpen(false)}
        />
      )}

      {/* Item Filter Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isItemFilterOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
            <h2 className="text-lg font-bold text-white">Filter by Items</h2>
            <button
              onClick={() => setIsItemFilterOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="px-3 py-2 border-b border-gray-200 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={selectAllItems}
                className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors text-xs"
              >
                Select All
              </button>
              <button
                onClick={deselectAllItems}
                className="flex-1 px-2 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors text-xs"
              >
                Deselect All
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-gray-600 font-medium">
                {selectedItemIds.length} of {items.length} items selected
              </div>
              <select
                value={itemSortBy}
                onChange={(e) => setItemSortBy(e.target.value as "name-asc" | "name-desc" | "quantity-desc" | "quantity-asc" | "unit")}
                className="px-2 py-1 border border-gray-300 rounded-lg text-[10px] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
                <option value="quantity-desc">Qty: High-Low</option>
                <option value="quantity-asc">Qty: Low-High</option>
                <option value="unit">Unit: A-Z</option>
              </select>
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                No items yet
              </div>
            ) : (() => {
                // Filter and sort items
                const filteredItems = items
                  .filter(item =>
                    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
                  )
                  .sort((a, b) => {
                    switch (itemSortBy) {
                      case "name-asc":
                        return a.name.localeCompare(b.name);
                      case "name-desc":
                        return b.name.localeCompare(a.name);
                      case "quantity-desc":
                        return b.totalQuantity - a.totalQuantity;
                      case "quantity-asc":
                        return a.totalQuantity - b.totalQuantity;
                      case "unit":
                        return a.unit.localeCompare(b.unit);
                      default:
                        return a.name.localeCompare(b.name);
                    }
                  });

                if (filteredItems.length === 0) {
                  return (
                    <div className="text-center text-gray-500 py-8 text-sm">
                      No items match your search
                    </div>
                  );
                }

                return (
                  <div className="space-y-1">
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`w-full flex items-center gap-1.5 p-1.5 rounded-lg border transition-all ${
                          selectedItemIds.includes(item.id)
                            ? "bg-blue-50 border-blue-500"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {selectedItemIds.includes(item.id) ? (
                          <CheckSquare className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-bold text-black text-[10px] leading-tight">{item.name}</div>
                          <div className="text-[9px] text-gray-600">
                            {item.totalQuantity} {item.unit}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })()
            }
          </div>
        </div>
      </div>

      {/* Compact Header */}
      <header className="bg-white shadow-lg border-b-2">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <Link
                  href="/"
                  className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg font-semibold transition-all duration-200 shadow-md text-xs"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span className="hidden sm:inline">Back to Home Page</span>
                  <span className="sm:hidden">Back</span>
                </Link>
                <button
                  onClick={() => setIsItemFilterOpen(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Filter by Items"
                >
                  <Package className="w-5 h-5 text-blue-600" />
                </button>
              </div>
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  All Bookings
                </h1>
                <p className="text-[10px] text-gray-600 font-medium">
                  {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Default Filters Button */}
            <div className="relative">
              <button
                onClick={() => setIsDefaultFiltersOpen(!isDefaultFiltersOpen)}
                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-md text-[10px]"
              >
                <Settings className="w-3 h-3" />
                <span className="flex flex-col items-center leading-tight">
                  <span>DEFAULT</span>
                  <span>FILTERS</span>
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDefaultFiltersOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDefaultFiltersOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-20 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2">
                      <h3 className="text-sm font-bold text-white">Set Default Filters</h3>
                      <p className="text-[10px] text-white/80">These will be applied when you open this page</p>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Editable Settings */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                        <div className="text-[10px] font-bold text-gray-700 uppercase">Configure Default Filters</div>

                        <div>
                          <label className="text-[9px] text-gray-600 font-medium block mb-1">Date Range:</label>
                          <select
                            value={tempDateRangeFilter}
                            onChange={(e) => setTempDateRangeFilter(e.target.value as DateRangeFilter)}
                            className="w-full text-xs px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold"
                          >
                            <option value="today">Today</option>
                            <option value="current-week">This Week</option>
                            <option value="next-week">Next Week</option>
                            <option value="current-month">This Month</option>
                            <option value="next-month">Next Month</option>
                            <option value="all">All Time</option>
                            <option value="custom">Custom Range</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] text-gray-600 font-medium block mb-1">Sort By:</label>
                          <select
                            value={tempSortBy}
                            onChange={(e) => setTempSortBy(e.target.value as SortOption)}
                            className="w-full text-xs px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold"
                          >
                            <option value="start-newest">Start Date ↓ (Newest)</option>
                            <option value="start-oldest">Start Date ↑ (Oldest)</option>
                            <option value="end-newest">End Date ↓ (Newest)</option>
                            <option value="end-oldest">End Date ↑ (Oldest)</option>
                            <option value="customer-asc">Customer A → Z</option>
                            <option value="customer-desc">Customer Z → A</option>
                            <option value="status">Status</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] text-gray-600 font-medium block mb-1">Status Filter:</label>
                          <select
                            value={tempStatusFilter}
                            onChange={(e) => setTempStatusFilter(e.target.value as StatusFilter)}
                            className="w-full text-xs px-2 py-1.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold"
                          >
                            <option value="all">All Status</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="OUT">Out</option>
                            <option value="RETURNED">Returned</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="OVERDUE">Overdue</option>
                          </select>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={saveDefaultFilters}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-md"
                        >
                          💾 Save as Default
                        </button>
                        <button
                          onClick={clearDefaultFilters}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-md"
                        >
                          🗑️ Clear Default
                        </button>
                      </div>

                      <div className="text-[9px] text-gray-500 text-center italic">
                        These settings will be applied automatically when you open this page
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Compact Filters */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-3 border border-gray-200">
          <div className="space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer, items, notes..."
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-3 gap-2">
              {/* Date Range Preset */}
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value as DateRangeFilter)}
                className="text-[10px] px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold"
              >
                <option value="today">Today</option>
                <option value="current-week">This Week</option>
                <option value="next-week">Next Week</option>
                <option value="current-month">This Month</option>
                <option value="next-month">Next Month</option>
                <option value="all">All Time</option>
                <option value="custom">Custom Range</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-[10px] px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold"
              >
                <option value="start-newest">Start ↓</option>
                <option value="start-oldest">Start ↑</option>
                <option value="end-newest">End ↓</option>
                <option value="end-oldest">End ↑</option>
                <option value="customer-asc">A → Z</option>
                <option value="customer-desc">Z → A</option>
                <option value="status">Status</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="text-[10px] px-1.5 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold"
              >
                <option value="all">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="OUT">Out</option>
                <option value="RETURNED">Returned</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="OVERDUE">Overdue Payments</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {dateRangeFilter === "custom" && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                <div className="max-w-2xl mx-auto px-4">
                  <div className="text-[10px] font-bold text-blue-900 mb-3 text-center">Select Date Range</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <DatePicker
                        value={startDateFilter}
                        onChange={(date) => setStartDateFilter(date)}
                        label="FROM (Start Date):"
                        required
                        className="text-[9px]"
                      />
                    </div>
                    <div className="min-w-0">
                      <DatePicker
                        value={endDateFilter}
                        onChange={(date) => setEndDateFilter(date)}
                        label="TO (End Date):"
                        minDate={startDateFilter}
                        required
                        className="text-[9px]"
                      />
                    </div>
                  </div>

                  {/* Date Error Warning */}
                  {startDateFilter && endDateFilter && endDateFilter < startDateFilter && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mt-3">
                      <p className="text-red-600 text-xs font-semibold text-center">⚠️ End date cannot be before start date</p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No bookings found</h3>
            <p className="text-xs text-gray-500">
              {searchQuery || statusFilter !== "all" || dateRangeFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first booking to get started"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              {currentBookings.map((booking) => {
                const isExpanded = expandedBookings.has(booking.id);
                return (
                  <div
                    key={booking.id}
                    className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200 relative"
                  >
                    {/* Color stripe */}
                    {booking.color && (
                      <div
                        className="absolute top-0 left-0 w-1 h-full"
                        style={{ backgroundColor: booking.color }}
                      />
                    )}

                    {/* Collapsed Header - Always Visible */}
                    <div className="p-2 pl-3">
                      <div
                        onClick={() => toggleBooking(booking.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                          ) : (
                            <ChevronUp className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-black text-xs leading-tight truncate">
                                {booking.customer.firstName || booking.customer.name} {booking.customer.lastName || ""}
                              </h3>
                            </div>
                            <div className="text-[10px] text-gray-600 font-medium">
                              {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <input
                            type="color"
                            value={booking.color || "#3b82f6"}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleUpdateBookingColor(booking.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                            title="Choose booking color"
                          />
                          <select
                            value={booking.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleUpdateBookingStatus(booking.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border-0 cursor-pointer ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="OUT">Out</option>
                            <option value="RETURNED">Returned</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      {/* Item summary - always visible */}
                      <div className="mt-1 ml-5 text-[10px] text-gray-700 font-medium">
                        {booking.items.map((item, idx) => (
                          <span key={item.id}>
                            {item.item.name} ×{item.quantity}
                            {idx < booking.items.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-2 pb-2 space-y-2 border-t border-gray-200">
                        {/* Customer Details */}
                        {(booking.customer.phone || booking.customer.email) && (
                          <div className="bg-blue-50 rounded p-2 border border-blue-200">
                            <div className="text-[9px] text-gray-600 font-bold mb-1">CUSTOMER</div>
                            {booking.customer.phone && (
                              <div className="text-[10px] text-black font-medium">
                                📞 {booking.customer.phone}
                              </div>
                            )}
                            {booking.customer.email && (
                              <div className="text-[10px] text-black font-medium">
                                ✉️ {booking.customer.email}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Items */}
                        <div>
                          <div className="text-[9px] text-gray-600 font-bold mb-1">ITEMS</div>
                          <div className="space-y-1">
                            {booking.items.map((item) => (
                              <div
                                key={item.id}
                                className="bg-gray-50 rounded p-1.5 border border-gray-200 flex items-center justify-between"
                              >
                                <span className="font-bold text-black text-[10px]">
                                  {item.item.name}
                                </span>
                                <span className="text-[10px] font-bold text-purple-600">
                                  {item.quantity} {item.item.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pricing Information */}
                        {(booking.totalPrice || booking.advancePayment || booking.paymentDueDate) && (
                          <div className="bg-purple-50 border border-purple-200 rounded p-2">
                            <div className="text-[9px] font-bold text-gray-700 mb-1">PRICING</div>
                            {booking.totalPrice && (
                              <div className="text-[10px] text-black font-medium">
                                Total Price: {formatCurrency(booking.totalPrice)}
                              </div>
                            )}

                            {/* Payment History */}
                            {((booking.advancePayment && booking.advancePayment > 0) || (booking.payments && booking.payments.length > 0)) && (
                              <div className="pt-1 border-t border-purple-200 mt-1">
                                <div className="text-[8px] font-bold text-purple-700 mb-0.5">PAYMENT HISTORY</div>
                                <div className="space-y-0.5">
                                  {booking.advancePayment && booking.advancePayment > 0 && (
                                    <div className="flex justify-between text-[9px] bg-green-50 px-1 py-0.5 rounded">
                                      <span className="text-gray-700">Advance Payment</span>
                                      <span className="font-bold text-green-700">{formatCurrency(booking.advancePayment)}</span>
                                    </div>
                                  )}
                                  {booking.payments && booking.payments.map((payment) => (
                                    <div key={payment.id} className="flex justify-between text-[9px] bg-green-50 px-1 py-0.5 rounded">
                                      <div className="flex flex-col">
                                        <span className="text-gray-700">
                                          {new Date(payment.paymentDate).toLocaleDateString()}
                                        </span>
                                        {payment.notes && (
                                          <span className="text-gray-500 text-[8px]">{payment.notes}</span>
                                        )}
                                      </div>
                                      <span className="font-bold text-green-700">{formatCurrency(payment.amount)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Summary */}
                            {booking.totalPrice && (
                              <div className="pt-1 border-t border-purple-200 mt-1 space-y-0.5">
                                <div className="flex justify-between text-[10px] font-bold text-black">
                                  <span>Total Paid:</span>
                                  <span className="text-green-700">
                                    {formatCurrency(
                                      (booking.advancePayment || 0) +
                                      (booking.payments?.reduce((sum, p) => sum + p.amount, 0) || 0)
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span className="text-purple-900">Balance Remaining:</span>
                                  <span className="text-red-700">
                                    {formatCurrency(
                                      booking.totalPrice -
                                      (booking.advancePayment || 0) -
                                      (booking.payments?.reduce((sum, p) => sum + p.amount, 0) || 0)
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}

                            {booking.paymentDueDate && (
                              <div className="text-[10px] text-gray-600 font-medium mt-1">
                                Due: {new Date(booking.paymentDueDate).toLocaleDateString()}
                              </div>
                            )}

                            {/* Add Payment Button/Form */}
                            {addingPaymentFor === booking.id ? (
                              <div className="mt-2 pt-2 border-t-2 border-green-300 bg-green-50 rounded-lg p-2">
                                <div className="text-[11px] font-bold text-green-900 mb-2 text-center">💰 Record New Payment</div>
                                {paymentError && (
                                  <div className="bg-red-50 text-red-600 p-1.5 rounded text-[10px] mb-2 font-semibold">
                                    {paymentError}
                                  </div>
                                )}
                                <div className="space-y-2">
                                  {/* Amount and Date on same line */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="min-w-0">
                                      <label className="block text-[9px] font-bold text-green-800 mb-1">AMOUNT ({settings?.currencySymbol || "₦"})</label>
                                      <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="h-10 w-full min-w-0 px-3 py-2 border-2 border-green-400 rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <DatePicker
                                        value={paymentDate}
                                        onChange={(date) => setPaymentDate(date)}
                                        label="Select Payment Date:"
                                        className="text-[9px]"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-green-800 mb-1">NOTES (Optional)</label>
                                    <input
                                      type="text"
                                      value={paymentNotes}
                                      onChange={(e) => setPaymentNotes(e.target.value)}
                                      placeholder="Add any notes here..."
                                      className="w-full px-2 py-1 border-2 border-green-400 rounded-lg text-[10px] font-medium focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                    />
                                  </div>
                                  <div className="flex gap-1.5 pt-1">
                                    <button
                                      onClick={() => handleAddPayment(booking.id)}
                                      className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-[11px] font-bold"
                                    >
                                      SAVE
                                    </button>
                                    <button
                                      onClick={() => {
                                        setAddingPaymentFor(null);
                                        setPaymentAmount("");
                                        setPaymentDate("");
                                        setPaymentNotes("");
                                        setPaymentError("");
                                      }}
                                      className="flex-1 px-2 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-[11px] font-bold"
                                    >
                                      CANCEL
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAddingPaymentFor(booking.id)}
                                className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-[11px] font-bold shadow-sm"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                ADD PAYMENT
                              </button>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {booking.notes && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                            <div className="text-[9px] font-bold text-gray-700 mb-1">NOTES</div>
                            <p className="text-[10px] text-black font-medium">{booking.notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBooking(booking);
                            }}
                            disabled={addingPaymentFor === booking.id}
                            className={`flex-1 flex items-center justify-center px-2 py-1.5 border rounded-lg text-xs font-bold transition-colors ${
                              addingPaymentFor === booking.id
                                ? 'text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                                : 'text-blue-600 hover:text-white hover:bg-blue-600 border-blue-600'
                            }`}
                          >
                            EDIT
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBooking(booking.id);
                            }}
                            disabled={addingPaymentFor === booking.id}
                            className={`flex-1 flex items-center justify-center px-2 py-1.5 border rounded-lg text-xs font-bold transition-colors ${
                              addingPaymentFor === booking.id
                                ? 'text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                                : 'text-red-600 hover:text-white hover:bg-red-600 border-red-600'
                            }`}
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-3 bg-white rounded-lg shadow border border-gray-200 p-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 0}
                    className="p-1.5 rounded-lg bg-white border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-700" />
                  </button>

                  <div className="text-xs font-semibold text-gray-700">
                    Page {currentPage + 1} of {totalPages}
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
          </>
        )}
      </main>

      {/* Edit Booking Modal */}
      <EditBookingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        booking={selectedBooking}
      />
    </div>
  );
}
