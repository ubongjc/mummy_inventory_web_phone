"use client";

import { useEffect, useState } from "react";
import { X, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import EditBookingModal from "./EditBookingModal";
import DatePicker from "./DatePicker";
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
  const [addingPaymentFor, setAddingPaymentFor] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const { formatCurrency, settings } = useSettings();

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

  // Lock body scroll when drawer is open (especially important for mobile)
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

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
    fetchDayData(); // Refresh the day drawer data
    // Notify parent component (Dashboard) to refresh calendar
    if (onDataChange) {
      onDataChange();
    }
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
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentNotes("");
      setPaymentError("");
      setAddingPaymentFor(null);
      fetchDayData();
      // Notify parent component to refresh calendar
      if (onDataChange) {
        onDataChange();
      }
    } catch (err: any) {
      setPaymentError(err.message);
    }
  };

  if (!isOpen) {
    return null;
  }

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

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={handleBackdropClick}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 xl:w-1/3 bg-gradient-to-br from-white to-gray-50 shadow-2xl z-[9999] overflow-y-auto border-l-4 border-blue-500">
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
                  <div className="space-y-2 max-h-[35vh] md:max-h-[45vh] overflow-y-auto pr-2">
                    {bookings.map((booking) => {
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
                              onClick={() => toggleBookingExpanded(booking.id)}
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
                                  {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {/* Item summary - always visible */}
                            <div className="mt-1 ml-5 text-[10px] text-gray-700 font-medium break-words">
                              {booking.items.map((item, idx) => (
                                <span key={item.id} className="inline-block">
                                  <span className="break-all">{item.item.name}</span> ×{item.quantity}
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
                                      className="bg-gray-50 rounded p-1.5 border border-gray-200 flex items-center justify-between gap-2"
                                    >
                                      <span className="font-bold text-black text-[10px] break-words flex-1 min-w-0">
                                        {item.item.name}
                                      </span>
                                      <span className="text-[10px] font-bold text-purple-600 whitespace-nowrap flex-shrink-0">
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
                                            (booking.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0)
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-purple-900">Balance Remaining:</span>
                                        <span className="text-red-700">
                                          {formatCurrency(
                                            booking.totalPrice -
                                            (booking.advancePayment || 0) -
                                            (booking.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0)
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
                                              minDate={new Date().toISOString().split('T')[0]}
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
                                              setPaymentDate(new Date().toISOString().split('T')[0]);
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
                                      onClick={() => {
                                        setAddingPaymentFor(booking.id);
                                        setPaymentDate(new Date().toISOString().split('T')[0]);
                                        setPaymentAmount("");
                                        setPaymentNotes("");
                                        setPaymentError("");
                                      }}
                                      className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-[11px] font-bold shadow-sm"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      ADD PAYMENT
                                    </button>
                                  )}
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
                              </div>
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
