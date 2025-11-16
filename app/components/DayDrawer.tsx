"use client";

import { useEffect, useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import EditBookingModal from "./EditBookingModal";
import { useSettings } from "@/app/hooks/useSettings";

interface DayDrawerProps {
  date: Date | null;
  isOpen: boolean;
  onClose: () => void;
  selectedItemIds: string[];
  onDataChange?: () => void;
}

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

interface Booking {
  id: string;
  customerId: string;
  customer: {
    id: string;
    name: string; // For backward compatibility
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  color?: string;
  notes?: string;
  totalPrice?: number;
  advancePayment?: number;
  paymentDueDate?: string;
  items: BookingItem[];
  payments?: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    notes?: string;
  }>;
}

const STATUS_OPTIONS = [
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "OUT", label: "Out" },
  { value: "RETURNED", label: "Returned" },
  { value: "CANCELLED", label: "Cancelled" },
];

interface ItemAvailability {
  id: string;
  name: string;
  total: number;
  reserved: number;
  remaining: number;
  unit: string;
}

export default function DayDrawer({ date, isOpen, onClose, selectedItemIds, onDataChange }: DayDrawerProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [itemAvailability, setItemAvailability] = useState<ItemAvailability[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());
  const { formatCurrency } = useSettings();

  // Format date without timezone conversion
  const formatDate = (dateString: string, includeYear = false) => {
    const datePart = dateString.split('T')[0]; // "2025-11-06"
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formatted = `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`;
    return includeYear ? `${formatted}, ${date.getUTCFullYear()}` : formatted;
  };

  useEffect(() => {
    if (isOpen && date) {
      fetchDayData();
    }
  }, [isOpen, date, selectedItemIds]);

  // Add escape key handler to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const fetchDayData = async () => {
    if (!date) {
      return;
    }

    setLoading(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const response = await fetch(`/api/day?date=${dateStr}`);

      if (!response.ok) {
        throw new Error("Failed to fetch day data");
      }

      const data = await response.json();

      // Filter bookings by selected items
      // If no items selected, show no bookings
      let filteredBookings = data.bookings || [];
      if (selectedItemIds.length === 0) {
        filteredBookings = [];
      } else {
        filteredBookings = filteredBookings.filter((booking: Booking) =>
          booking.items.some((item) => selectedItemIds.includes(item.itemId))
        );
      }

      setBookings(filteredBookings);
      setItemAvailability(data.itemAvailability || []);
    } catch (error) {
      console.error("Error fetching day data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchDayData(); // Refresh the data
  };

  const toggleBookingExpanded = (bookingId: string) => {
    setExpandedBookings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
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

      // Refresh the data
      fetchDayData();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status");
    }
  };

  const handleUpdateBookingColor = async (bookingId: string, newColor: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ color: newColor }),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking color");
      }

      // Refresh the data
      fetchDayData();
      // Notify parent component to refresh calendar
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Error updating booking color:", error);
      alert("Failed to update booking color");
    }
  };

  if (!isOpen) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "OUT":
        return "bg-red-100 text-red-800";
      case "RETURNED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleBackdropClick}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 xl:w-1/3 bg-gradient-to-br from-white to-gray-50 shadow-2xl z-50 overflow-y-auto border-l-4 border-blue-500">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">
              {date ? format(date, "MMMM dd, yyyy") : ""}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-black font-bold text-lg">Loading...</div>
            </div>
          ) : (
            <>
              {/* Bookings Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-black mb-4">
                  Active Bookings ({bookings.length})
                </h3>

                {bookings.length === 0 ? (
                  <p className="text-black text-sm font-semibold">
                    No bookings for this date
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {bookings.map((booking) => {
                      const isExpanded = expandedBookings.has(booking.id);

                      return (
                        <div
                          key={booking.id}
                          className="border border-gray-300 rounded-lg p-2.5 hover:shadow-md hover:border-blue-400 transition-all bg-white relative overflow-hidden"
                        >
                          {/* Color indicator stripe */}
                          {booking.color && (
                            <div
                              className="absolute top-0 left-0 w-1 h-full"
                              style={{ backgroundColor: booking.color }}
                            />
                          )}

                          {/* First Line - Always Visible */}
                          <div className="flex items-center justify-between pl-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {/* Expand/Collapse Button */}
                              <button
                                onClick={() => toggleBookingExpanded(booking.id)}
                                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                                title={isExpanded ? "Collapse" : "Expand"}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                )}
                              </button>

                              {/* Customer Name */}
                              <h4 className="font-bold text-black text-sm truncate">
                                {booking.customer.firstName || booking.customer.name} {booking.customer.lastName || ""}
                              </h4>

                              {/* Date Range */}
                              <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              {/* Color Picker */}
                              <input
                                type="color"
                                value={booking.color || "#3b82f6"}
                                onChange={(e) => handleUpdateBookingColor(booking.id, e.target.value)}
                                className="w-7 h-7 border border-gray-300 rounded cursor-pointer hover:border-blue-500 transition-colors"
                                title="Change booking color"
                                onClick={(e) => e.stopPropagation()}
                              />

                              {/* Edit Button */}
                              <button
                                onClick={() => handleEditBooking(booking)}
                                className="px-2 py-1 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded transition-colors"
                              >
                                EDIT
                              </button>

                              {/* Status Dropdown */}
                              <select
                                value={booking.status}
                                onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                                className={`px-2 py-1 rounded text-xs font-bold border cursor-pointer min-w-[100px] ${getStatusColor(
                                  booking.status
                                )}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {STATUS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-2 pl-2 space-y-2">
                              {/* Phone Number */}
                              {booking.customer.phone && (
                                <div className="text-xs text-gray-700 font-medium">
                                  <span className="text-gray-500">Phone:</span> {booking.customer.phone}
                                </div>
                              )}

                              {/* Items List */}
                              <div className="bg-gray-50 rounded p-1.5 pl-3.5 text-xs">
                                {booking.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="text-black font-semibold flex justify-between py-0.5"
                                  >
                                    <span>{item.item.name}</span>
                                    <span className="font-medium text-gray-700">
                                      ×{item.quantity} {item.item.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Payment Information */}
                              {booking.totalPrice && (
                                <div className="bg-purple-50 border border-purple-200 rounded p-1.5 pl-3.5 text-xs">
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-black font-bold">
                                      <span>Total Amount:</span>
                                      <span className="text-purple-900">{formatCurrency(booking.totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-black font-bold">
                                      <span>Amount Due:</span>
                                      <span className="text-red-700">
                                        {formatCurrency(
                                          Number(booking.totalPrice) -
                                          (booking.advancePayment ? Number(booking.advancePayment) : 0) -
                                          (booking.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0)
                                        )}
                                      </span>
                                    </div>
                                    {booking.paymentDueDate && (
                                      <div className="text-gray-600 text-[10px] pt-0.5">
                                        Due: {formatDate(booking.paymentDueDate, true)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Item Availability Section */}
              <div>
                <h3 className="text-lg font-bold text-black mb-4">
                  Item Availability for {date ? format(date, "MMMM d, yyyy") : ""}
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y-2 divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r-2 border-gray-300">
                          Item
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-black uppercase tracking-wider border-r-2 border-gray-300">
                          Total
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-black uppercase tracking-wider border-r-2 border-gray-300">
                          Booked
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-black uppercase tracking-wider min-w-[100px]">
                          Remaining
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {itemAvailability.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-3 text-sm font-bold text-black border-r border-gray-200">
                            {item.name}
                          </td>
                          <td className="px-3 py-3 text-sm text-center text-black font-semibold border-r border-gray-200">
                            {item.total}
                          </td>
                          <td className="px-3 py-3 text-sm text-center text-black font-semibold border-r border-gray-200">
                            {item.reserved}
                          </td>
                          <td
                            className={`px-3 py-3 text-sm text-center font-semibold min-w-[100px] ${
                              item.remaining === 0
                                ? "text-red-600"
                                : item.remaining < 5
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {item.remaining}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Booking Modal */}
      <EditBookingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        booking={selectedBooking}
      />
    </>
  );
}
