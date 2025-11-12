"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";
import { toTitleCase } from "@/app/lib/validation";
import { useSettings } from "@/app/hooks/useSettings";
import DatePicker from "./DatePicker";

interface AddRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Item {
  id: string;
  name: string;
  totalQuantity: number;
  unit: string;
  price?: number;
  available?: number;
}

interface Customer {
  id: string;
  name: string; // For backward compatibility
  firstName?: string;
  lastName?: string;
}

interface RentalItem {
  itemId: string;
  quantity: number | "";
}

export default function AddRentalModal({
  isOpen,
  onClose,
  onSuccess,
}: AddRentalModalProps) {
  const { settings } = useSettings();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [newCustomerFirstName, setNewCustomerFirstName] = useState("");
  const [newCustomerLastName, setNewCustomerLastName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([
    { itemId: "", quantity: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [initialPayments, setInitialPayments] = useState<Array<{ amount: string; date: string; notes: string }>>([]);
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentDate, setNewPaymentDate] = useState("");
  const [newPaymentNotes, setNewPaymentNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [manualTotalPrice, setManualTotalPrice] = useState(false);
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
  const isSubmitting = useRef(false);
  const firstItemSelectRef = useRef<HTMLSelectElement>(null);
  const itemSelectRefs = useRef<{ [key: number]: HTMLSelectElement | null }>({});
  const previousItemsLength = useRef(rentalItems.length);

  // Calculate max date (1 year from today)
  const today = new Date();
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const todayStr = today.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Format date without timezone conversion
  const formatDate = (dateString: string) => {
    const datePart = dateString.split('T')[0]; // "2025-11-06"
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`;
  };

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchItems();
      // Auto-focus the first item dropdown after a brief delay to ensure it's rendered
      setTimeout(() => {
        firstItemSelectRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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
    if (isOpen && (startDate || endDate)) {
      fetchItems();
    }
  }, [startDate, endDate]);

  // Auto-focus newly added item dropdown
  useEffect(() => {
    if (rentalItems.length > previousItemsLength.current) {
      const newIndex = rentalItems.length - 1;
      setTimeout(() => {
        itemSelectRefs.current[newIndex]?.focus();
      }, 50);
    }
    previousItemsLength.current = rentalItems.length;
  }, [rentalItems.length]);

  // Auto-calculate total price when items or quantities change
  useEffect(() => {
    if (items.length > 0 && rentalItems.length > 0) {
      let calculatedTotal = 0;
      let hasValidItems = false;

      rentalItems.forEach((rentalItem) => {
        if (rentalItem.itemId && rentalItem.quantity) {
          const item = items.find((i) => i.id === rentalItem.itemId);
          if (item?.price) {
            const quantity = typeof rentalItem.quantity === "number"
              ? rentalItem.quantity
              : parseInt(String(rentalItem.quantity)) || 0;
            calculatedTotal += item.price * quantity;
            hasValidItems = true;
          }
        }
      });

      // Only auto-populate if we have valid items with prices and totalPrice is empty or hasn't been manually changed
      if (hasValidItems && !totalPrice) {
        setTotalPrice(calculatedTotal.toFixed(2));
      }
    }
  }, [rentalItems, items]);

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
      // Fetch all items
      const itemsResponse = await fetch("/api/items");
      const itemsData = await itemsResponse.json();

      // Fetch all active rentals
      const rentalsResponse = await fetch("/api/rentals");
      const rentalsData = await rentalsResponse.json();

      // Calculate available quantities for each item based on selected dates
      const itemsWithAvailability = itemsData.map((item: any) => {
        // If no dates selected yet, show availability for today
        const checkStartDate = startDate ? new Date(startDate + "T00:00:00.000Z") : new Date();
        const checkEndDate = endDate ? new Date(endDate + "T00:00:00.000Z") : new Date();

        const rented = rentalsData
          .filter((rental: any) => {
            const rentalStartDate = new Date(rental.startDate);
            const rentalEndDate = new Date(rental.endDate);

            // Check if rental overlaps with selected period
            const overlaps = rentalStartDate <= checkEndDate && rentalEndDate >= checkStartDate;

            return (
              (rental.status === "CONFIRMED" || rental.status === "OUT") &&
              overlaps
            );
          })
          .reduce((sum: number, rental: any) => {
            const rentalItem = rental.items?.find(
              (ri: any) => ri.itemId === item.id || ri.item?.id === item.id
            );
            return sum + (rentalItem?.quantity || 0);
          }, 0);

        const available = item.totalQuantity - rented;
        console.log(`Item "${item.name}": ${item.totalQuantity} total, ${rented} rented during period, ${available} available`);

        if (available < 0) {
          console.error(`⚠️ OVERBOOKED ITEM DETECTED: "${item.name}" has ${available} available (${item.totalQuantity} total - ${rented} rented = ${available}). This item is overbooked!`);
        }

        return {
          ...item,
          available,
        };
      });

      setItems(itemsWithAvailability);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const addRentalItem = () => {
    setRentalItems([...rentalItems, { itemId: "", quantity: "" }]);
    // Focus will be handled by useEffect below when rentalItems length changes
  };

  const removeRentalItem = (index: number) => {
    setRentalItems(rentalItems.filter((_, i) => i !== index));
  };

  const updateRentalItem = (
    index: number,
    field: keyof RentalItem,
    value: any
  ) => {
    const updated = [...rentalItems];
    if (field === "quantity") {
      // Allow empty string while typing, will validate on submit
      updated[index] = { ...updated[index], [field]: value === "" ? "" : parseInt(value) || "" };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setRentalItems(updated);
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

    const validItems = rentalItems.filter(
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

      // Fetch all active rentals
      const rentalsResponse = await fetch("/api/rentals");
      const rentalsData = await rentalsResponse.json();

      const itemStatuses = validItems.map((rentalItem) => {
        const item = items.find((i) => i.id === rentalItem.itemId);
        if (!item) {
          return {
            itemId: rentalItem.itemId,
            available: false,
            message: "Item not found",
          };
        }

        const requestedQty =
          typeof rentalItem.quantity === "number"
            ? rentalItem.quantity
            : parseInt(String(rentalItem.quantity)) || 0;

        // Calculate rented quantity for this item during the period
        const rented = rentalsData
          .filter((rental: any) => {
            const rentalStartDate = new Date(rental.startDate);
            const rentalEndDate = new Date(rental.endDate);

            // Check if rental overlaps with selected period
            const overlaps =
              rentalStartDate <= checkEndDate &&
              rentalEndDate >= checkStartDate;

            return (
              (rental.status === "CONFIRMED" || rental.status === "OUT") &&
              overlaps
            );
          })
          .reduce((sum: number, rental: any) => {
            const rentalItem = rental.items?.find(
              (ri: any) => ri.itemId === item.id || ri.item?.id === item.id
            );
            return sum + (rentalItem?.quantity || 0);
          }, 0);

        const available = item.totalQuantity - rented;
        const isAvailable = available >= requestedQty;

        return {
          itemId: rentalItem.itemId,
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
          ? "✓ All items are available for the entire rental period!"
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
  }, [startDate, endDate, rentalItems, items]);

  // Auto-calculate total price based on item prices and quantities
  useEffect(() => {
    if (!manualTotalPrice && rentalItems.length > 0) {
      let calculatedTotal = 0;
      let hasItemsWithPrice = false;

      rentalItems.forEach((rentalItem) => {
        if (rentalItem.itemId && rentalItem.quantity) {
          const item = items.find((i) => i.id === rentalItem.itemId);
          if (item && item.price) {
            hasItemsWithPrice = true;
            const quantity = typeof rentalItem.quantity === "number" ? rentalItem.quantity : parseInt(String(rentalItem.quantity)) || 0;
            calculatedTotal += item.price * quantity;
          }
        }
      });

      // Only update if there are items with prices
      if (hasItemsWithPrice) {
        setTotalPrice(calculatedTotal.toFixed(2));
      }
    }
  }, [rentalItems, items, manualTotalPrice]);

  const addInitialPayment = () => {
    if (!newPaymentAmount || !newPaymentDate) {
      setError("Please enter payment amount and date");
      return;
    }

    // Validate that total payments don't exceed total price
    const parsedTotalPrice = totalPrice ? parseFloat(totalPrice) : 0;
    const parsedAdvancePayment = advancePayment ? parseFloat(advancePayment) : 0;
    const newPaymentAmountNum = parseFloat(newPaymentAmount);
    const existingPaymentsTotal = initialPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalPayments = parsedAdvancePayment + existingPaymentsTotal + newPaymentAmountNum;

    if (parsedTotalPrice > 0 && totalPayments > parsedTotalPrice) {
      const remainingBalance = parsedTotalPrice - parsedAdvancePayment - existingPaymentsTotal;
      setError(`Total payments ($${totalPayments.toFixed(2)}) cannot exceed total price ($${parsedTotalPrice.toFixed(2)}). Remaining balance: $${remainingBalance.toFixed(2)}`);
      return;
    }

    setInitialPayments([
      ...initialPayments,
      {
        amount: newPaymentAmount,
        date: newPaymentDate,
        notes: newPaymentNotes,
      },
    ]);

    setNewPaymentAmount("");
    setNewPaymentDate("");
    setNewPaymentNotes("");
    setError("");
  };

  const removeInitialPayment = (index: number) => {
    setInitialPayments(initialPayments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[FORM] Submit handler called');

    // Prevent double submission
    if (isSubmitting.current) {
      console.log('[FORM] Already submitting, returning early');
      return;
    }

    isSubmitting.current = true;
    setLoading(true);
    setError("");
    console.log('[FORM] Starting submission...');

    // Validate return date is not before start date
    if (endDate < startDate) {
      setError("Return date cannot be before start date");
      setLoading(false);
      isSubmitting.current = false;
      return;
    }

    try {
      let customerId = selectedCustomerId;

      // Create new customer if needed
      if (showNewCustomer && newCustomerFirstName) {
        const customerResponse = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: toTitleCase(newCustomerFirstName),
            lastName: newCustomerLastName ? toTitleCase(newCustomerLastName) : undefined,
            phone: newCustomerPhone,
            email: newCustomerEmail,
            address: newCustomerAddress ? toTitleCase(newCustomerAddress) : "",
          }),
        });

        if (!customerResponse.ok) {
          throw new Error("Failed to create customer");
        }

        const newCustomer = await customerResponse.json();
        customerId = newCustomer.id;
      }

      if (!customerId) {
        throw new Error("Please select or create a customer");
      }

      // Validate quantities
      const validatedItems = rentalItems
        .filter((item) => item.itemId)
        .map((item) => ({
          itemId: item.itemId,
          quantity: typeof item.quantity === "number" ? item.quantity : parseInt(String(item.quantity)) || 1,
        }));

      if (validatedItems.some((item) => !item.quantity || item.quantity < 1)) {
        throw new Error("Please enter valid quantities for all items");
      }

      // Validate advance payment doesn't exceed total price
      const parsedTotalPrice = totalPrice ? parseFloat(totalPrice) : 0;
      const parsedAdvancePayment = advancePayment ? parseFloat(advancePayment) : 0;

      if (parsedAdvancePayment > parsedTotalPrice && parsedTotalPrice > 0) {
        throw new Error("Advance payment cannot exceed total price");
      }

      // Filter and map initial payments to only include valid ones
      const validInitialPayments = initialPayments
        .filter((p) => p.amount && parseFloat(p.amount) > 0 && p.date)
        .map((p) => ({
          amount: parseFloat(p.amount),
          paymentDate: p.date,
          notes: p.notes || "",
        }));

      console.log('[CREATE RENTAL] Initial payments:', initialPayments);
      console.log('[CREATE RENTAL] Valid initial payments:', validInitialPayments);

      const requestBody = {
        customerId,
        startDate,
        endDate,
        items: validatedItems,
        notes,
        totalPrice: totalPrice ? parseFloat(totalPrice) : undefined,
        advancePayment: advancePayment ? parseFloat(advancePayment) : undefined,
        paymentDueDate: paymentDueDate || undefined,
        initialPayments: validInitialPayments.length > 0 ? validInitialPayments : undefined,
      };

      console.log('[CREATE RENTAL] Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Format detailed error message for availability issues
        if (errorData.itemName && errorData.requested !== undefined && errorData.available !== undefined) {
          throw new Error(
            `Insufficient availability for "${errorData.itemName}". You requested ${errorData.requested} but only ${errorData.available} are available (${errorData.total} total, ${errorData.total - errorData.available} already rented).`
          );
        }

        throw new Error(
          errorData.error || "Failed to create rental"
        );
      }

      // Reset form
      setSelectedCustomerId("");
      setNewCustomerFirstName("");
      setNewCustomerLastName("");
      setNewCustomerPhone("");
      setNewCustomerEmail("");
      setNewCustomerAddress("");
      setStartDate("");
      setEndDate("");
      setRentalItems([{ itemId: "", quantity: "" }]);
      setNotes("");
      setTotalPrice("");
      setAdvancePayment("");
      setPaymentDueDate("");
      setInitialPayments([]);
      setNewPaymentAmount("");
      setNewPaymentDate("");
      setNewPaymentNotes("");
      setShowNewCustomer(false);
      setManualTotalPrice(false);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-3 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 border border-gray-200 transform transition-all max-h-[95vh] flex flex-col">
          <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
            <h3 className="text-sm font-bold text-black">Create New Booking</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-3 space-y-2.5 overflow-y-auto flex-1">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                {error}
              </div>
            )}

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
                Items to Rent *
              </label>
              <div className="space-y-2">
                {rentalItems.map((rentalItem, index) => (
                  <div key={index} className="flex gap-1 items-center">
                    <select
                      ref={(el) => {
                        itemSelectRefs.current[index] = el;
                        if (index === 0) (firstItemSelectRef as React.MutableRefObject<HTMLSelectElement | null>).current = el;
                      }}
                      value={rentalItem.itemId}
                      onChange={(e) => {
                        // Prevent selecting the "Select" option
                        if (e.target.value !== "") {
                          updateRentalItem(index, "itemId", e.target.value);
                        }
                      }}
                      className="flex-1 min-w-0 px-1 py-1 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-xs truncate"
                      required
                    >
                      <option value="" disabled>Select Item</option>
                      {items
                        .filter((item) =>
                          // Show current item OR items not already selected in other rows
                          item.id === rentalItem.itemId ||
                          !rentalItems.some((ri, i) => i !== index && ri.itemId === item.id)
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
                    <input
                      type="number"
                      value={rentalItem.quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allow empty string while typing
                        if (val === "") {
                          updateRentalItem(index, "quantity", "");
                        } else {
                          const numVal = parseInt(val);
                          // Prevent negative numbers and 0
                          if (numVal > 0) {
                            updateRentalItem(index, "quantity", numVal);
                          }
                        }
                      }}
                      placeholder="Qty"
                      className={`w-14 flex-shrink-0 px-1 py-1 border-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-xs ${
                        rentalItem.quantity === "" ? "border-blue-500 animate-pulse" : "border-gray-400"
                      }`}
                      min="1"
                      required
                    />
                    {rentalItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRentalItem(index)}
                        className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded transition-colors"
                        title="Remove item"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {/* Check if all items are selected */}
                {items.filter(item => !rentalItems.some(ri => ri.itemId === item.id) && (item.available ?? item.totalQuantity) > 0).length > 0 ? (
                  (() => {
                    // Check if the last rental item has both itemId and quantity filled
                    const lastItem = rentalItems[rentalItems.length - 1];
                    const isLastItemComplete = !!lastItem.itemId && !!lastItem.quantity;

                    return (
                      <button
                        type="button"
                        onClick={addRentalItem}
                        disabled={!isLastItemComplete}
                        className={`text-[10px] flex items-center gap-1 ${
                          isLastItemComplete
                            ? "text-blue-600 hover:underline cursor-pointer"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <Plus className="w-3 h-3" /> Add item to rent
                      </button>
                    );
                  })()
                ) : (
                  <div className="text-[10px] text-gray-600 italic">
                    All available items have been selected
                  </div>
                )}
              </div>
            </div>

            {/* Availability Status */}
            {startDate && endDate && rentalItems.some(item => item.itemId && item.quantity) && (
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

            {/* Customer Selection */}
            <div>
              <label className="block text-xs font-bold mb-1 text-black">
                Customer *
              </label>
              {!showNewCustomer ? (
                <div className="space-y-1">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                    required={!showNewCustomer}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.firstName || customer.name} {customer.lastName || ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomer(true)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    + Create new customer
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 p-2 border rounded bg-gray-50">
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={newCustomerFirstName}
                      onChange={(e) => setNewCustomerFirstName(e.target.value)}
                      placeholder="First Name *"
                      className="w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                      required
                    />
                    <input
                      type="text"
                      value={newCustomerLastName}
                      onChange={(e) => setNewCustomerLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                    />
                  </div>
                  <input
                    type="tel"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                  />
                  <input
                    type="email"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                  />
                  <input
                    type="text"
                    value={newCustomerAddress}
                    onChange={(e) => setNewCustomerAddress(e.target.value)}
                    placeholder="Address"
                    className="w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewCustomer(false)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ← Back to customer list
                  </button>
                </div>
              )}
            </div>

            {/* Pricing Information */}
            <div className="border-t pt-2">
              <h4 className="text-xs font-bold mb-2 text-black">Pricing Information</h4>
              <div className="space-y-3">
                {/* Total and Advance Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col min-w-0">
                    <label className="block text-xs font-bold mb-1 text-black">
                      Total
                    </label>
                    <div className="flex items-center min-w-0">
                      <div className="flex items-center justify-center h-10 px-2 bg-white border-2 border-gray-400 border-r-0 rounded-l flex-shrink-0">
                        <span className="text-green-600 font-semibold text-sm">
                          {settings?.currencySymbol || "₦"}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={totalPrice}
                        onChange={(e) => {
                          setTotalPrice(e.target.value);
                          setManualTotalPrice(true);
                        }}
                        onFocus={() => setManualTotalPrice(true)}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        className="flex-1 min-w-0 h-10 px-2 py-1.5 border-2 border-gray-400 rounded-r focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <label className="block text-xs font-bold mb-1 text-black">
                      Advance
                    </label>
                    <div className="flex items-center min-w-0">
                      <div className="flex items-center justify-center h-10 px-2 bg-white border-2 border-gray-400 border-r-0 rounded-l flex-shrink-0">
                        <span className="text-green-600 font-semibold text-sm">
                          {settings?.currencySymbol || "₦"}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={advancePayment}
                        onChange={(e) => setAdvancePayment(e.target.value)}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        className="flex-1 min-w-0 h-10 px-2 py-1.5 border-2 border-gray-400 rounded-r focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                      />
                    </div>
                  </div>
                </div>
                {/* Due Date Row */}
                <div className="flex flex-col min-w-0">
                  <DatePicker
                    value={paymentDueDate}
                    onChange={(date) => setPaymentDueDate(date)}
                    label="Due Date"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold mb-1 text-black">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2 py-1.5 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2 sticky bottom-0 bg-white border-t mt-2 -mx-3 -mb-3 px-3 py-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-1.5 border rounded hover:bg-gray-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !!dateError || !availabilityStatus.allAvailable}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold"
              >
                {loading ? "Creating..." : "Create Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
