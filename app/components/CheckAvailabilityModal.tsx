"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import DatePicker from "./DatePicker";

interface CheckAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Item {
  id: string;
  name: string;
  totalQuantity: number;
  unit: string;
  available?: number;
}

interface BookingItem {
  itemId: string;
  quantity: number | "";
}

export default function CheckAvailabilityModal({
  isOpen,
  onClose,
}: CheckAvailabilityModalProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([
    { itemId: "", quantity: "" },
  ]);
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
  const [dateError, setDateError] = useState("");

  // Calculate max date (1 year from today)
  const today = new Date();
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const todayStr = today.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  // Refetch items when dates change to recalculate availability
  useEffect(() => {
    if (isOpen && (startDate || endDate)) {
      fetchItems();
    }
  }, [startDate, endDate, isOpen]);

  // Validate dates whenever they change
  useEffect(() => {
    if (startDate && endDate) {
      if (endDate < startDate) {
        setDateError("Return date cannot be before start date");
      } else if (startDate > maxDateStr || endDate > maxDateStr) {
        setDateError("Dates cannot be more than 1 year ahead");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  }, [startDate, endDate, maxDateStr]);

  // Reset all fields to initial state
  const resetFields = () => {
    setStartDate("");
    setEndDate("");
    setBookingItems([{ itemId: "", quantity: "" }]);
    setAvailabilityStatus({
      isChecking: false,
      allAvailable: false,
      message: "",
      itemStatuses: [],
    });
    setDateError("");
  };

  // Handle close and reset
  const handleClose = () => {
    resetFields();
    onClose();
  };

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Re-fetch items when dates change to update availability
  useEffect(() => {
    if (isOpen && (startDate || endDate)) {
      fetchItems();
    }
  }, [startDate, endDate]);

  const fetchItems = async () => {
    try {
      // Fetch all items
      const itemsResponse = await fetch("/api/items");
      const itemsData = await itemsResponse.json();

      // Fetch all active bookings
      const bookingsResponse = await fetch("/api/bookings");
      const bookingsData = await bookingsResponse.json();

      // Calculate available quantities for each item based on selected dates
      const itemsWithAvailability = itemsData.map((item: any) => {
        // If no dates selected yet, show availability for today
        const checkStartDate = startDate ? new Date(startDate + "T00:00:00.000Z") : new Date();
        const checkEndDate = endDate ? new Date(endDate + "T00:00:00.000Z") : new Date();

        const rented = bookingsData
          .filter((booking: any) => {
            const bookingStartDate = new Date(booking.startDate);
            const bookingEndDate = new Date(booking.endDate);

            // Check if booking overlaps with selected period
            const overlaps = bookingStartDate <= checkEndDate && bookingEndDate >= checkStartDate;

            return (
              (booking.status === "CONFIRMED" || booking.status === "OUT") &&
              overlaps
            );
          })
          .reduce((sum: number, booking: any) => {
            const bookingItem = booking.items?.find(
              (ri: any) => ri.itemId === item.id || ri.item?.id === item.id
            );
            return sum + (bookingItem?.quantity || 0);
          }, 0);

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
    setBookingItems([...bookingItems, { itemId: "", quantity: "" }]);
  };

  const removeBookingItem = (index: number) => {
    setBookingItems(bookingItems.filter((_, i) => i !== index));
  };

  const updateBookingItem = (
    index: number,
    field: keyof BookingItem,
    value: any
  ) => {
    const updated = [...bookingItems];
    if (field === "quantity") {
      // Allow empty string while typing, will validate on submit
      updated[index] = { ...updated[index], [field]: value === "" ? "" : parseInt(value) || "" };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setBookingItems(updated);
  };

  // Check availability for all selected items
  const checkItemsAvailability = async () => {
    if (!startDate || !endDate) {
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

        const requestedQty =
          typeof bookingItem.quantity === "number"
            ? bookingItem.quantity
            : parseInt(String(bookingItem.quantity)) || 0;

        // Calculate rented quantity for this item during the period
        const rented = bookingsData
          .filter((booking: any) => {
            const bookingStartDate = new Date(booking.startDate);
            const bookingEndDate = new Date(booking.endDate);

            // Check if booking overlaps with selected period
            const overlaps =
              bookingStartDate <= checkEndDate &&
              bookingEndDate >= checkStartDate;

            return (
              (booking.status === "CONFIRMED" || booking.status === "OUT") &&
              overlaps
            );
          })
          .reduce((sum: number, booking: any) => {
            const bookingItem = booking.items?.find(
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

  // Check availability whenever dates or items change
  useEffect(() => {
    checkItemsAvailability();
  }, [startDate, endDate, bookingItems, items]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-3 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 border border-gray-200 transform transition-all max-h-[95vh] flex flex-col">
          <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
            <h3 className="text-sm font-bold text-black">Check Availability</h3>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <DatePicker
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  label="Select Start Date:"
                  minDate={todayStr}
                  maxDate={maxDateStr}
                  required
                />
              </div>
              <div className="min-w-0">
                <DatePicker
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  label="Select Return Date:"
                  minDate={startDate || todayStr}
                  maxDate={maxDateStr}
                  required
                />
              </div>
            </div>

            {/* Date Error Warning */}
            {dateError && (
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <p className="text-red-600 text-xs font-semibold">⚠️ {dateError}</p>
              </div>
            )}

            {/* Items */}
            <div>
              <label className="block text-xs font-bold mb-1 text-black">
                Items to Check *
              </label>
              <div className="space-y-2">
                {bookingItems.map((bookingItem, index) => (
                  <div key={index} className="grid grid-cols-[1fr_auto] gap-4 items-center">
                    <div className="flex gap-1 items-center min-w-0">
                      <select
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

            <div className="flex gap-2 pt-2 sticky bottom-0 bg-white border-t mt-2 -mx-3 -mb-3 px-3 py-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-3 py-1.5 border rounded hover:bg-gray-50 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
