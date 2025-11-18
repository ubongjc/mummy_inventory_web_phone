"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";
import { useSettings } from "@/app/hooks/useSettings";
import DatePicker from "./DatePicker";
import { PaymentPanel } from "./payments/PaymentPanel";
import NotesModal from "./NotesModal";
import NotesDisplay from "./NotesDisplay";

interface BookingItem {
  id: string;
  itemId: string;
  quantity: number;
  item?: {
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
  notes?: string;
  totalPrice?: number;
  advancePayment?: number;
  paymentDueDate?: string;
  items: BookingItem[];
  payments?: Payment[];
  customer: {
    id: string;
    name: string; // For backward compatibility
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
}

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  booking: Booking | null;
}

interface Item {
  id: string;
  name: string;
  totalQuantity: number;
  unit: string;
  available?: number;
}

interface Customer {
  id: string;
  name: string; // For backward compatibility
  firstName?: string;
  lastName?: string;
}

export default function EditBookingModal({
  isOpen,
  onClose,
  onSuccess,
  booking,
}: EditBookingModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingItems, setBookingItems] = useState<{ itemId: string; quantity: number }[]>([]);
  const [notes, setNotes] = useState("");
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [status, setStatus] = useState("CONFIRMED");
  const [totalPrice, setTotalPrice] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    isChecking: boolean;
    allAvailable: boolean;
    message: string;
    itemStatuses: Array<{ itemId: string; available: boolean; message: string }>;
  }>({
    isChecking: false,
    allAvailable: false,
    message: "",
    itemStatuses: [],
  });
  const { formatCurrency } = useSettings();
  const itemSelectRefs = useRef<{ [key: number]: HTMLSelectElement | null }>({});
  const previousItemsLength = useRef(bookingItems.length);

  // Track initial values to detect changes
  const [initialValues, setInitialValues] = useState<{
    customerId: string;
    startDate: string;
    endDate: string;
    status: string;
    notes: string;
    totalPrice: string;
    advancePayment: string;
    paymentDueDate: string;
    bookingItems: { itemId: string; quantity: number }[];
  } | null>(null);

  // Format date without timezone conversion
  const formatDate = (dateString: string) => {
    const datePart = dateString.split('T')[0]; // "2025-11-06"
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`;
  };

  useEffect(() => {
    if (isOpen && booking) {
      fetchCustomers();
      fetchItems();
      // Clear error when modal opens
      setError("");
      // Populate form with booking data
      const customerId = booking.customerId;
      const start = booking.startDate.split("T")[0];
      const end = booking.endDate.split("T")[0];
      const bookingNotes = booking.notes || "";
      const bookingStatus = booking.status;
      const price = booking.totalPrice?.toString() || "";
      const advance = booking.advancePayment?.toString() || "";
      const dueDate = booking.paymentDueDate ? booking.paymentDueDate.split("T")[0] : "";
      const items = booking.items.map((item) => ({
        itemId: item.itemId || item.item?.id || "",
        quantity: item.quantity,
      }));

      setSelectedCustomerId(customerId);
      setStartDate(start);
      setEndDate(end);
      setNotes(bookingNotes);
      setStatus(bookingStatus);
      setTotalPrice(price);
      setAdvancePayment(advance);
      setPaymentDueDate(dueDate);
      setPayments(booking.payments || []);
      setBookingItems(items);

      // Save initial values for change detection
      setInitialValues({
        customerId,
        startDate: start,
        endDate: end,
        status: bookingStatus,
        notes: bookingNotes,
        totalPrice: price,
        advancePayment: advance,
        paymentDueDate: dueDate,
        bookingItems: items,
      });
    }
  }, [isOpen, booking]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Re-fetch items when dates change to update availability
  useEffect(() => {
    if (isOpen && booking && (startDate || endDate)) {
      fetchItems();
    }
  }, [startDate, endDate]);

  // Clear error when bookingItems change
  useEffect(() => {
    setError("");
  }, [bookingItems]);

  // Auto-focus newly added item dropdown
  useEffect(() => {
    if (bookingItems.length > previousItemsLength.current) {
      const newIndex = bookingItems.length - 1;
      setTimeout(() => {
        itemSelectRefs.current[newIndex]?.focus();
      }, 50);
    }
    previousItemsLength.current = bookingItems.length;
  }, [bookingItems.length]);

  // Auto-set payment due date to end date if not manually selected
  useEffect(() => {
    if (endDate && !paymentDueDate) {
      setPaymentDueDate(endDate);
    }
    // If payment due date is before end date, update it to end date
    if (endDate && paymentDueDate && paymentDueDate < endDate) {
      setPaymentDueDate(endDate);
    }
  }, [endDate]);

  // Check availability whenever dates or items change
  useEffect(() => {
    checkItemsAvailability();
  }, [startDate, endDate, bookingItems, items]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchItems = async () => {
    try {
      const itemsResponse = await fetch("/api/items");
      const itemsData = await itemsResponse.json();

      const bookingsResponse = await fetch("/api/bookings");
      const bookingsData = await bookingsResponse.json();

      // Calculate available quantities for each item based on selected dates
      const itemsWithAvailability = itemsData.map((item: any) => {
        // If no dates selected yet, show availability for today
        const checkStartDate = startDate ? new Date(startDate + "T00:00:00.000Z") : new Date();
        const checkEndDate = endDate ? new Date(endDate + "T00:00:00.000Z") : new Date();

        const rented = bookingsData
          .filter((r: any) => {
            // Exclude the current booking being edited
            if (booking && r.id === booking.id) {
              return false;
            }

            const bookingStartDate = new Date(r.startDate);
            const bookingEndDate = new Date(r.endDate);

            // Check if booking overlaps with selected period
            const overlaps = bookingStartDate <= checkEndDate && bookingEndDate >= checkStartDate;

            return (
              (r.status === "CONFIRMED" || r.status === "OUT") &&
              overlaps
            );
          })
          .reduce((sum: number, r: any) => {
            const bookingItem = r.items?.find(
              (ri: any) => ri.itemId === item.id || ri.item?.id === item.id
            );
            return sum + (bookingItem?.quantity || 0);
          }, 0);

        console.log(`[Edit] Item "${item.name}": ${item.totalQuantity} total, ${rented} rented during period, ${item.totalQuantity - rented} available`);

        return {
          ...item,
          available: item.totalQuantity - rented,
        };
      });

      setItems(itemsWithAvailability);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const addBookingItem = () => {
    setBookingItems([...bookingItems, { itemId: "", quantity: 1 }]);
    // Focus will be handled by useEffect when bookingItems length changes
  };

  const removeBookingItem = (index: number) => {
    setBookingItems(bookingItems.filter((_, i) => i !== index));
  };

  const updateBookingItem = (index: number, field: "itemId" | "quantity", value: any) => {
    const updated = [...bookingItems];

    // If changing itemId, check for duplicates
    if (field === "itemId" && value) {
      const isDuplicate = bookingItems.some((item, i) => i !== index && item.itemId === value);
      if (isDuplicate) {
        setError("This item is already added. Please select a different item or adjust the quantity of the existing item.");
        return;
      }
    }

    updated[index] = { ...updated[index], [field]: value };
    setBookingItems(updated);
  };

  // Check availability for all selected items
  const checkItemsAvailability = async () => {
    if (!startDate || !endDate || !booking) {
      setAvailabilityStatus({
        isChecking: false,
        allAvailable: false,
        message: "",
        itemStatuses: [],
      });
      return;
    }

    const validItems = bookingItems.filter(
      (item) => item.itemId && item.quantity && item.quantity > 0
    );

    if (validItems.length === 0) {
      setAvailabilityStatus({
        isChecking: false,
        allAvailable: false,
        message: "",
        itemStatuses: [],
      });
      return;
    }

    setAvailabilityStatus((prev) => ({ ...prev, isChecking: true }));

    try {
      const checkStartDate = new Date(startDate + "T00:00:00.000Z");
      const checkEndDate = new Date(endDate + "T00:00:00.000Z");

      // Fetch all active bookings
      const bookingsResponse = await fetch("/api/bookings");
      const bookingsData = await bookingsResponse.json();

      const itemStatuses = validItems.map((bookingItem) => {
        const item = items.find((i) => i.id === bookingItem.itemId);
        if (!item) {
          return {
            itemId: bookingItem.itemId,
            available: false,
            message: "Item not found",
          };
        }

        const requestedQty = bookingItem.quantity;

        // Calculate rented quantity for this item during the period
        const rented = bookingsData
          .filter((b: any) => {
            // Exclude the current booking being edited
            if (booking && b.id === booking.id) {
              return false;
            }

            const bookingStartDate = new Date(b.startDate);
            const bookingEndDate = new Date(b.endDate);

            // Check if booking overlaps with selected period
            const overlaps =
              bookingStartDate <= checkEndDate &&
              bookingEndDate >= checkStartDate;

            return (
              (b.status === "CONFIRMED" || b.status === "OUT") &&
              overlaps
            );
          })
          .reduce((sum: number, b: any) => {
            const bookingItem = b.items?.find(
              (ri: any) => ri.itemId === item.id || ri.item?.id === item.id
            );
            return sum + (bookingItem?.quantity || 0);
          }, 0);

        const available = item.totalQuantity - rented;
        const isAvailable = available >= requestedQty;

        return {
          itemId: bookingItem.itemId,
          available: isAvailable,
          message: isAvailable
            ? `✓ ${item.name}: ${requestedQty} available (${available} remaining for this period)`
            : `✗ ${item.name}: Only ${available} available, you requested ${requestedQty}`,
        };
      });

      const allAvailable = itemStatuses.every((status) => status.available);

      setAvailabilityStatus({
        isChecking: false,
        allAvailable,
        message: allAvailable
          ? "✓ All items are available for the entire booking period!"
          : "⚠ Some items are not available for the selected dates",
        itemStatuses,
      });
    } catch (err) {
      console.error("Error checking availability:", err);
      setAvailabilityStatus({
        isChecking: false,
        allAvailable: false,
        message: "Error checking availability",
        itemStatuses: [],
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!booking) {
        throw new Error("No booking to edit");
      }

      // Validate advance payment doesn't exceed total price
      const parsedTotalPrice = totalPrice ? parseFloat(totalPrice) : 0;
      const parsedAdvancePayment = advancePayment ? parseFloat(advancePayment) : 0;

      if (parsedAdvancePayment > parsedTotalPrice && parsedTotalPrice > 0) {
        throw new Error("Advance payment cannot exceed total price");
      }

      // Validate overpayment - check if total payments exceed total price
      const existingPaymentsTotal = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalPayments = parsedAdvancePayment + existingPaymentsTotal;

      if (parsedTotalPrice > 0 && totalPayments > parsedTotalPrice) {
        throw new Error(`Total payments (${formatCurrency(totalPayments)}) cannot exceed total price (${formatCurrency(parsedTotalPrice)})`);
      }

      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          startDate,
          endDate,
          status,
          items: bookingItems.filter((item) => item.itemId),
          notes,
          totalPrice: totalPrice ? parseFloat(totalPrice) : undefined,
          advancePayment: advancePayment ? parseFloat(advancePayment) : undefined,
          paymentDueDate: paymentDueDate || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Format detailed error message for availability issues
        if (errorData.itemName && errorData.requested !== undefined && errorData.available !== undefined) {
          throw new Error(
            `Insufficient availability for "${errorData.itemName}". You requested ${errorData.requested} but only ${errorData.available} are available (${errorData.total} total, ${errorData.total - errorData.available} already rented).`
          );
        }

        throw new Error(errorData.error || "Failed to update booking");
      }

      // Trigger data refresh
      onSuccess();
      onClose();

      // Force page refresh to update calendar immediately
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen || !booking) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[10000]"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[10000] p-2 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 border border-gray-200 transform transition-all max-h-[95vh] flex flex-col">
          <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
            <h3 className="text-base font-bold text-black">Edit Booking</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-3 space-y-3 overflow-y-auto flex-1">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                {error}
              </div>
            )}

            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-bold mb-2 text-black">
                Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.firstName || customer.name} {customer.lastName || ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0">
                <DatePicker
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  label="Start Date:"
                  required
                  className="text-sm"
                />
              </div>
              <div className="min-w-0">
                <DatePicker
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  label="Return Date:"
                  minDate={startDate}
                  required
                  className="text-sm"
                />
              </div>
            </div>

            {/* Date Error Warning */}
            {startDate && endDate && endDate < startDate && (
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <p className="text-red-600 text-xs font-semibold">⚠️ Return date cannot be before start date</p>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-xs font-bold mb-1 text-black">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                required
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="OUT">Out</option>
                <option value="RETURNED">Returned</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Items */}
            <div>
              <label className="block text-xs font-bold mb-1 text-black">
                Items to Rent *
              </label>
              <div className="space-y-2">
                {bookingItems.map((bookingItem, index) => (
                  <div key={index} className="grid grid-cols-[1fr_auto] gap-4 items-center">
                    <div className="flex gap-1 items-center min-w-0">
                      <select
                        ref={(el) => { itemSelectRefs.current[index] = el; }}
                        value={bookingItem.itemId}
                        onChange={(e) => {
                          // Prevent selecting the "Select" option
                          if (e.target.value !== "") {
                            updateBookingItem(index, "itemId", e.target.value);
                          }
                        }}
                        className="flex-1 min-w-0 px-1 py-1 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-xs truncate"
                        required
                      >
                        <option value="" disabled>Select Item</option>
                        {items
                          .filter((item) =>
                            // Show current item OR items not already selected in other rows
                            item.id === bookingItem.itemId ||
                            !bookingItems.some((ri, i) => i !== index && ri.itemId === item.id)
                          )
                          .map((item) => {
                            const available = item.available ?? item.totalQuantity;
                            const isOverbooked = available < 0;
                            return (
                              <option key={item.id} value={item.id} disabled={isOverbooked || available === 0}>
                                {item.name} ({available} remaining{isOverbooked ? ' ⚠️ OVERBOOKED' : available === 0 ? ' - NONE AVAILABLE' : ''})
                              </option>
                            );
                          })
                        }
                      </select>
                      {bookingItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBookingItem(index)}
                          className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded transition-colors"
                          title="Remove item"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <input
                        type="number"
                        value={bookingItem.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Allow empty string while typing
                          if (val === "") {
                            updateBookingItem(index, "quantity", "");
                          } else {
                            const numVal = parseInt(val);
                            // Prevent negative numbers and 0
                            if (numVal > 0) {
                              updateBookingItem(index, "quantity", numVal);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // Set to 1 if empty on blur
                          if (e.target.value === "" || parseInt(e.target.value) < 1) {
                            updateBookingItem(index, "quantity", 1);
                          }
                        }}
                        placeholder="Qty"
                        className="w-20 px-1 py-1 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-xs"
                        min="1"
                      />
                    </div>
                  </div>
                ))}
                {/* Check if all items are selected and last item is complete */}
                {(() => {
                  const lastItem = bookingItems[bookingItems.length - 1];
                  const hasValidLastItem = lastItem && lastItem.itemId && lastItem.quantity && lastItem.quantity > 0;
                  const hasAvailableItems = items.filter(item => !bookingItems.some(ri => ri.itemId === item.id)).length > 0;

                  if (!hasAvailableItems) {
                    return (
                      <div className="text-[10px] text-gray-600 italic">
                        All items have been selected
                      </div>
                    );
                  }

                  return (
                    <button
                      type="button"
                      onClick={addBookingItem}
                      disabled={!hasValidLastItem}
                      className={`text-[10px] flex items-center gap-1 ${
                        hasValidLastItem
                          ? 'text-blue-600 hover:underline cursor-pointer'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                      title={!hasValidLastItem ? 'Please select an item and enter a quantity first' : ''}
                    >
                      <Plus className="w-3 h-3" /> Add another item
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Availability Status */}
            {startDate && endDate && bookingItems.some(item => item.itemId && item.quantity) && (
              <div className="mt-2">
                {availabilityStatus.isChecking ? (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-xs font-semibold text-blue-800">Checking availability...</span>
                  </div>
                ) : availabilityStatus.message ? (
                  <div className={`border rounded p-2 ${
                    availabilityStatus.allAvailable
                      ? 'bg-green-50 border-green-300'
                      : 'bg-yellow-50 border-yellow-300'
                  }`}>
                    <div className={`text-xs font-bold mb-1.5 ${
                      availabilityStatus.allAvailable ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {availabilityStatus.message}
                    </div>
                    {availabilityStatus.itemStatuses.length > 0 && (
                      <div className="space-y-1">
                        {availabilityStatus.itemStatuses.map((status, idx) => (
                          <div
                            key={idx}
                            className={`text-[10px] font-medium ${
                              status.available ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            {status.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Pricing Information */}
            <div className="border-t pt-2">
              <h4 className="text-xs font-bold mb-2 text-black">Pricing Information</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1 text-black">
                    Total Price
                  </label>
                  <input
                    type="number"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="h-9 w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-black">
                    Advance Payment
                  </label>
                  <input
                    type="number"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    disabled
                    className="h-9 w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="min-w-0">
                  <DatePicker
                    value={paymentDueDate}
                    onChange={(date) => setPaymentDueDate(date)}
                    label="Payment Due Date:"
                    minDate={endDate || undefined}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    Must be on or after the return date of the booking
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Payments */}
            <div className="border-t pt-2">
              <h4 className="text-xs font-bold mb-2 text-black">Additional Payments</h4>

              {/* Add New Payment Form - Using PaymentPanel */}
              <div className="mb-3">
                <PaymentPanel
                  onSubmit={async (amount, paymentDate, notes) => {
                    // Validate overpayment
                    const parsedTotalPrice = totalPrice ? parseFloat(totalPrice) : 0;
                    const parsedAdvancePayment = advancePayment ? parseFloat(advancePayment) : 0;
                    const existingPaymentsTotal = payments.reduce((sum, p) => sum + p.amount, 0);
                    const totalPayments = parsedAdvancePayment + existingPaymentsTotal + amount;

                    if (parsedTotalPrice > 0 && totalPayments > parsedTotalPrice) {
                      const remainingBalance = parsedTotalPrice - parsedAdvancePayment - existingPaymentsTotal;
                      throw new Error(`Total payments (${formatCurrency(totalPayments)}) cannot exceed total price (${formatCurrency(parsedTotalPrice)}). Remaining balance: ${formatCurrency(remainingBalance)}`);
                    }

                    const response = await fetch(`/api/bookings/${booking?.id}/payments`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        amount,
                        paymentDate: paymentDate.toISOString(),
                        notes,
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({ error: "Failed to add payment" }));
                      throw new Error(errorData.error || "Failed to add payment");
                    }

                    const newPayment = await response.json();
                    setPayments([newPayment, ...payments]);
                    setError("");

                    // Trigger parent refresh to update calendar/bookings view
                    onSuccess();
                  }}
                  onSuccess={() => {
                    setError("");
                  }}
                />
              </div>

              {/* Payment History & Summary */}
              <div>
                {/* Show payment history if there are any payments */}
                {((advancePayment && parseFloat(advancePayment) > 0) || payments.length > 0) && (
                  <>
                    <h5 className="text-xs font-bold mb-2 text-gray-700">Payment History</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                      {advancePayment && parseFloat(advancePayment) > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded p-2 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-green-800">
                                {formatCurrency(parseFloat(advancePayment))}
                              </div>
                              <div className="text-green-600">Advance Payment</div>
                            </div>
                          </div>
                        </div>
                      )}
                      {payments.map((payment) => (
                        <div key={payment.id} className="bg-green-50 border border-green-200 rounded p-2 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-green-800">
                                {formatCurrency(payment.amount)}
                              </div>
                              <div className="text-green-600">
                                {formatDate(payment.paymentDate)}
                              </div>
                              {payment.notes && (
                                <div className="text-gray-600 mt-1">{payment.notes}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Payment Summary */}
                {totalPrice && parseFloat(totalPrice) > 0 && (
                  <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-3">
                    <h5 className="text-xs font-bold mb-2 text-purple-900">Payment Summary</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-black">Total Price:</span>
                        <span className="font-bold text-black">{formatCurrency(parseFloat(totalPrice))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-green-700">Total Paid:</span>
                        <span className="font-bold text-green-700">
                          {formatCurrency(
                            (advancePayment ? parseFloat(advancePayment) : 0) +
                            payments.reduce((sum, p) => sum + p.amount, 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-1 border-t border-purple-300">
                        <span className="font-bold text-purple-900">Balance Remaining:</span>
                        <span className="font-bold text-red-700">
                          {formatCurrency(
                            parseFloat(totalPrice) -
                            (advancePayment ? parseFloat(advancePayment) : 0) -
                            payments.reduce((sum, p) => sum + p.amount, 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold mb-1 text-black">
                Notes (optional)
              </label>
              <div className="px-2 py-1.5 border-2 border-gray-400 rounded bg-gray-50">
                <NotesDisplay
                  notes={notes}
                  onClick={() => setIsNotesModalOpen(true)}
                  maxPreviewLength={30}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 sticky bottom-0 bg-white border-t mt-2 -mx-3 -mb-3 px-3 py-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-1.5 border rounded hover:bg-gray-50 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold"
              >
                {loading ? "Updating..." : "Update Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notes Modal */}
      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        onSave={(newNotes) => setNotes(newNotes)}
        initialNotes={notes}
        title="Booking Notes"
        maxLength={50}
      />
    </>
  );
}
