"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";
import { toTitleCase } from "@/app/lib/validation";
import { useSettings } from "@/app/hooks/useSettings";
import DatePicker from "./DatePicker";
import NotesModal from "./NotesModal";
import NotesDisplay from "./NotesDisplay";
import { sanitizeInput, nameRegex, phoneRegex, emailRegex } from "@/app/lib/clientValidation";

interface AddBookingModalProps {
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

interface BookingItem {
  itemId: string;
  quantity: number | "";
}

export default function AddBookingModal({
  isOpen,
  onClose,
  onSuccess,
}: AddBookingModalProps) {
  const { settings, formatCurrency } = useSettings();
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
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([
    { itemId: "", quantity: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [initialPayments, setInitialPayments] = useState<Array<{ amount: string; date: string; notes: string }>>([]);
  const [newPaymentAmount, setNewPaymentAmount] = useState("");
  const [newPaymentDate, setNewPaymentDate] = useState("");
  const [newPaymentNotes, setNewPaymentNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerError, setCustomerError] = useState("");
  const [itemsError, setItemsError] = useState("");
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
  const previousItemsLength = useRef(bookingItems.length);

  // Validation error states for new customer form
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    totalPrice: "",
    advancePayment: "",
  });

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
      // Reset all form fields when modal opens
      setSelectedCustomerId("");
      setNewCustomerFirstName("");
      setNewCustomerLastName("");
      setNewCustomerPhone("");
      setNewCustomerEmail("");
      setNewCustomerAddress("");
      setStartDate("");
      setEndDate("");
      setBookingItems([{ itemId: "", quantity: "" }]);
      setNotes("");
      setTotalPrice("");
      setAdvancePayment("");
      setPaymentDueDate("");
      setInitialPayments([]);
      setNewPaymentAmount("");
      setNewPaymentDate("");
      setNewPaymentNotes("");
      setError("");
      setShowNewCustomer(false);
      setManualTotalPrice(false);
      setAvailabilityStatus({
        isChecking: false,
        allAvailable: false,
        message: "",
        itemStatuses: [],
      });
      setDateError("");
      setErrors({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        totalPrice: "",
        advancePayment: "",
      });

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
    if (bookingItems.length > previousItemsLength.current) {
      const newIndex = bookingItems.length - 1;
      setTimeout(() => {
        itemSelectRefs.current[newIndex]?.focus();
      }, 50);
    }
    previousItemsLength.current = bookingItems.length;
  }, [bookingItems.length]);

  // Auto-calculate total price when items or quantities change
  useEffect(() => {
    if (items.length > 0 && bookingItems.length > 0) {
      let calculatedTotal = 0;
      let hasValidItems = false;

      bookingItems.forEach((bookingItem) => {
        if (bookingItem.itemId && bookingItem.quantity) {
          const item = items.find((i) => i.id === bookingItem.itemId);
          if (item?.price) {
            const quantity = typeof bookingItem.quantity === "number"
              ? bookingItem.quantity
              : parseInt(String(bookingItem.quantity)) || 0;
            calculatedTotal += Number(item.price) * quantity;
            hasValidItems = true;
          }
        }
      });

      // Only auto-populate if we have valid items with prices and totalPrice is empty or hasn't been manually changed
      if (hasValidItems && !totalPrice) {
        setTotalPrice(calculatedTotal.toFixed(2));
      }
    }
  }, [bookingItems, items]);

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

  const addBookingItem = () => {
    setBookingItems([...bookingItems, { itemId: "", quantity: "" }]);
    // Focus will be handled by useEffect below when bookingItems length changes
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

    // If changing itemId, check for duplicates
    if (field === "itemId" && value) {
      const isDuplicate = bookingItems.some((item, i) => i !== index && item.itemId === value);
      if (isDuplicate) {
        setError("This item is already added. Please select a different item or adjust the quantity of the existing item.");
        return;
      }
    }

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

  // Auto-calculate total price based on item prices and quantities
  useEffect(() => {
    if (!manualTotalPrice && bookingItems.length > 0) {
      let calculatedTotal = 0;
      let hasItemsWithPrice = false;

      bookingItems.forEach((bookingItem) => {
        if (bookingItem.itemId && bookingItem.quantity) {
          const item = items.find((i) => i.id === bookingItem.itemId);
          if (item && item.price) {
            hasItemsWithPrice = true;
            const quantity = typeof bookingItem.quantity === "number" ? bookingItem.quantity : parseInt(String(bookingItem.quantity)) || 0;
            calculatedTotal += Number(item.price) * quantity;
          }
        }
      });

      // Only update if there are items with prices
      if (hasItemsWithPrice) {
        setTotalPrice(calculatedTotal.toFixed(2));
      }
    }
  }, [bookingItems, items, manualTotalPrice]);

  // Auto-set payment due date to end date if not manually selected
  // This ensures the payment due date is always valid (on or after rental end)
  useEffect(() => {
    if (endDate && !paymentDueDate) {
      setPaymentDueDate(endDate);
    }
    // If payment due date is before end date, update it to end date
    if (endDate && paymentDueDate && paymentDueDate < endDate) {
      setPaymentDueDate(endDate);
    }
  }, [endDate]);

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
      setError(`Total payments (${formatCurrency(totalPayments)}) cannot exceed total price (${formatCurrency(parsedTotalPrice)}). Remaining balance: ${formatCurrency(remainingBalance)}`);
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

  // Validation functions
  const validateFirstName = (value: string): string => {
    const sanitized = sanitizeInput(value);
    if (sanitized.length > 0 && sanitized.length < 2) {
      return "First name must be at least 2 characters";
    }
    if (sanitized.length > 50) {
      return "First name must be less than 50 characters";
    }
    if (sanitized.length > 0 && !nameRegex.test(sanitized)) {
      return "First name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return "";
  };

  const validateLastName = (value: string): string => {
    const sanitized = sanitizeInput(value);
    if (sanitized.length > 50) {
      return "Last name must be less than 50 characters";
    }
    if (sanitized.length > 0 && !nameRegex.test(sanitized)) {
      return "Last name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return "";
  };

  const validatePhone = (value: string): string => {
    const sanitized = sanitizeInput(value);
    if (sanitized.length === 0) {
      return ""; // Phone is optional
    }
    if (sanitized.length < 8) {
      return "Phone number must be at least 8 digits";
    }
    if (sanitized.length > 15) {
      return "Phone number must be less than 15 digits";
    }
    if (!phoneRegex.test(sanitized)) {
      return "Please enter a valid phone number (e.g., +1234567890)";
    }
    return "";
  };

  const validateEmail = (value: string): string => {
    const sanitized = sanitizeInput(value);
    if (sanitized.length === 0) {
      return ""; // Email is optional
    }
    if (sanitized.length < 3) {
      return "Email must be at least 3 characters";
    }
    if (sanitized.length > 254) {
      return "Email must be less than 254 characters";
    }
    if (!emailRegex.test(sanitized)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateAddress = (value: string): string => {
    const sanitized = sanitizeInput(value);
    if (sanitized.length > 200) {
      return "Address must be less than 200 characters";
    }
    return "";
  };

  const validateTotalPrice = (value: string): string => {
    if (value === "") {
      return "";
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    if (numValue < 0) {
      return "Total price cannot be negative";
    }
    if (numValue > 100000000) {
      return "Total price cannot exceed 100,000,000 Naira";
    }
    return "";
  };

  const validateAdvancePayment = (value: string, total: string): string => {
    if (value === "") {
      return "";
    }
    const advanceValue = parseFloat(value);
    const totalValue = parseFloat(total);

    if (isNaN(advanceValue)) {
      return "Please enter a valid number";
    }
    if (advanceValue < 0) {
      return "Advance payment cannot be negative";
    }
    if (totalValue > 0 && advanceValue > totalValue) {
      return "Advance payment cannot exceed total price";
    }
    return "";
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
    setCustomerError("");
    setItemsError("");
    console.log('[FORM] Starting submission...');

    // Check for validation errors in new customer form
    if (showNewCustomer) {
      const hasErrors = Object.values(errors).some((error) => error !== "");
      if (hasErrors) {
        setError("Please fix all validation errors before submitting");
        setLoading(false);
        isSubmitting.current = false;
        return;
      }
    }

    // Validate customer selection
    if (!showNewCustomer && !selectedCustomerId) {
      setCustomerError("*Please select a customer or create a new one");
      setLoading(false);
      isSubmitting.current = false;
      return;
    }

    if (showNewCustomer && !newCustomerFirstName.trim()) {
      setCustomerError("*Enter customer first name");
      setLoading(false);
      isSubmitting.current = false;
      return;
    }

    // Validate at least one item is selected
    const validItems = bookingItems.filter((item) => item.itemId && item.quantity);
    if (validItems.length === 0) {
      setItemsError("*Please select at least one item with quantity");
      setLoading(false);
      isSubmitting.current = false;
      return;
    }

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
            firstName: toTitleCase(sanitizeInput(newCustomerFirstName)),
            lastName: newCustomerLastName ? toTitleCase(sanitizeInput(newCustomerLastName)) : undefined,
            phone: sanitizeInput(newCustomerPhone),
            email: sanitizeInput(newCustomerEmail),
            address: newCustomerAddress ? toTitleCase(sanitizeInput(newCustomerAddress)) : "",
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
      const validatedItems = bookingItems
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

      const response = await fetch("/api/bookings", {
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
          errorData.error || "Failed to create booking"
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
      setBookingItems([{ itemId: "", quantity: "" }]);
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
      setErrors({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        totalPrice: "",
        advancePayment: "",
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  if (!isOpen) {
    return null;
  }

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
                {bookingItems.map((bookingItem, index) => (
                  <div key={index} className="flex gap-1 items-center">
                    <select
                      ref={(el) => {
                        itemSelectRefs.current[index] = el;
                        if (index === 0) {
                          (firstItemSelectRef as React.MutableRefObject<HTMLSelectElement | null>).current = el;
                        }
                      }}
                      value={bookingItem.itemId}
                      onChange={(e) => {
                        // Prevent selecting the "Select" option
                        if (e.target.value !== "") {
                          updateBookingItem(index, "itemId", e.target.value);
                          setItemsError("");
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
                      placeholder="Qty"
                      className={`w-14 flex-shrink-0 px-1 py-1 border-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-xs ${
                        bookingItem.quantity === "" ? "border-blue-500 animate-pulse" : "border-gray-400"
                      }`}
                      min="1"
                      required
                    />
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
                ))}
                {/* Check if all items are selected */}
                {items.filter(item => !bookingItems.some(ri => ri.itemId === item.id) && (item.available ?? item.totalQuantity) > 0).length > 0 ? (
                  (() => {
                    // Check if the last booking item has both itemId and quantity filled
                    const lastItem = bookingItems[bookingItems.length - 1];
                    const isLastItemComplete = !!lastItem.itemId && !!lastItem.quantity;

                    return (
                      <button
                        type="button"
                        onClick={addBookingItem}
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
              {itemsError && (
                <p className="text-red-600 text-xs mt-1 font-semibold">{itemsError}</p>
              )}
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

            {/* Customer Selection */}
            <div>
              <label className="block text-xs font-bold mb-1 text-black">
                Customer *
              </label>
              {!showNewCustomer ? (
                <div className="space-y-1">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      setCustomerError("");
                    }}
                    className={`w-full px-2 py-1.5 border-2 ${
                      customerError ? "border-red-500 ring-2 ring-red-500/40 focus:ring-red-500" : "border-gray-400 focus:ring-2 focus:ring-blue-500"
                    } rounded outline-none text-black font-semibold text-sm transition`}
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
                    <div>
                      <input
                        type="text"
                        value={newCustomerFirstName}
                        onChange={(e) => {
                          const sanitized = sanitizeInput(e.target.value);
                          setNewCustomerFirstName(sanitized);
                          setCustomerError("");
                          const error = validateFirstName(sanitized);
                          setErrors((prev) => ({ ...prev, firstName: error }));
                        }}
                        placeholder="First Name *"
                        className={`w-full px-2 py-1.5 border-2 ${
                          errors.firstName ? "border-red-500" : customerError ? "border-red-500 ring-2 ring-red-500/40 focus:ring-red-500" : "border-gray-400 focus:ring-2 focus:ring-blue-500"
                        } rounded outline-none text-black font-semibold text-sm transition`}
                        required
                      />
                      {errors.firstName && (
                        <div className="mt-1 bg-red-50 border border-red-200 rounded p-1">
                          <p className="text-xs text-red-700 font-medium">{errors.firstName}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newCustomerLastName}
                        onChange={(e) => {
                          const sanitized = sanitizeInput(e.target.value);
                          setNewCustomerLastName(sanitized);
                          const error = validateLastName(sanitized);
                          setErrors((prev) => ({ ...prev, lastName: error }));
                        }}
                        placeholder="Last Name"
                        className={`w-full px-2 py-1.5 border-2 ${
                          errors.lastName ? "border-red-500" : "border-gray-400"
                        } rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm`}
                      />
                      {errors.lastName && (
                        <div className="mt-1 bg-red-50 border border-red-200 rounded p-1">
                          <p className="text-xs text-red-700 font-medium">{errors.lastName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={newCustomerPhone}
                      onChange={(e) => {
                        const sanitized = sanitizeInput(e.target.value);
                        setNewCustomerPhone(sanitized);
                        const error = validatePhone(sanitized);
                        setErrors((prev) => ({ ...prev, phone: error }));
                      }}
                      placeholder="Phone"
                      className={`w-full px-2 py-1.5 border-2 ${
                        errors.phone ? "border-red-500" : "border-gray-400"
                      } rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm`}
                    />
                    {errors.phone && (
                      <div className="mt-1 bg-red-50 border border-red-200 rounded p-1">
                        <p className="text-xs text-red-700 font-medium">{errors.phone}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      value={newCustomerEmail}
                      onChange={(e) => {
                        const sanitized = sanitizeInput(e.target.value);
                        setNewCustomerEmail(sanitized);
                        const error = validateEmail(sanitized);
                        setErrors((prev) => ({ ...prev, email: error }));
                      }}
                      placeholder="Email"
                      className={`w-full px-2 py-1.5 border-2 ${
                        errors.email ? "border-red-500" : "border-gray-400"
                      } rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm`}
                    />
                    {errors.email && (
                      <div className="mt-1 bg-red-50 border border-red-200 rounded p-1">
                        <p className="text-xs text-red-700 font-medium">{errors.email}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newCustomerAddress}
                      onChange={(e) => {
                        const sanitized = sanitizeInput(e.target.value);
                        setNewCustomerAddress(sanitized);
                        const error = validateAddress(sanitized);
                        setErrors((prev) => ({ ...prev, address: error }));
                      }}
                      placeholder="Address"
                      className={`w-full px-2 py-1.5 border-2 ${
                        errors.address ? "border-red-500" : "border-gray-400"
                      } rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm`}
                    />
                    <div className="flex justify-between items-center mt-0.5">
                      {errors.address && (
                        <div className="bg-red-50 border border-red-200 rounded p-1 flex-1 mr-2">
                          <p className="text-xs text-red-700 font-medium">{errors.address}</p>
                        </div>
                      )}
                      <p className={`text-xs ${newCustomerAddress.length > 200 ? "text-red-600 font-bold" : "text-gray-500"} ${errors.address ? "" : "ml-auto"}`}>
                        {newCustomerAddress.length}/200
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomer(false)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ← Back to customer list
                  </button>
                </div>
              )}
              {customerError && (
                <p className="text-red-600 text-xs mt-1 font-semibold">{customerError}</p>
              )}
            </div>

            {/* Pricing Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="text-xs font-bold mb-2 text-green-800">Pricing Information</h4>
              <div className="space-y-3">
                {/* Total and Advance Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col min-w-0">
                    <label className="block text-xs font-bold mb-1 text-green-800">
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
                          const error = validateTotalPrice(e.target.value);
                          setErrors((prev) => ({ ...prev, totalPrice: error }));
                          // Also revalidate advance payment when total changes
                          if (advancePayment) {
                            const advanceError = validateAdvancePayment(advancePayment, e.target.value);
                            setErrors((prev) => ({ ...prev, advancePayment: advanceError }));
                          }
                        }}
                        onFocus={() => setManualTotalPrice(true)}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        className={`flex-1 min-w-0 h-10 px-2 py-1.5 border-2 ${
                          errors.totalPrice ? "border-red-500" : "border-gray-400"
                        } rounded-r focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm`}
                      />
                    </div>
                    {errors.totalPrice && (
                      <div className="mt-1 bg-red-50 border border-red-200 rounded p-1">
                        <p className="text-xs text-red-700 font-medium">{errors.totalPrice}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <label className="block text-xs font-bold mb-1 text-green-800">
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
                        onChange={(e) => {
                          setAdvancePayment(e.target.value);
                          const error = validateAdvancePayment(e.target.value, totalPrice);
                          setErrors((prev) => ({ ...prev, advancePayment: error }));
                        }}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        className={`flex-1 min-w-0 h-10 px-2 py-1.5 border-2 ${
                          errors.advancePayment ? "border-red-500" : "border-gray-400"
                        } rounded-r focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-sm`}
                      />
                    </div>
                    {errors.advancePayment && (
                      <div className="mt-1 bg-red-50 border border-red-200 rounded p-1">
                        <p className="text-xs text-red-700 font-medium">{errors.advancePayment}</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Due Date Row */}
                <div className="flex flex-col min-w-0">
                  <DatePicker
                    value={paymentDueDate}
                    onChange={(date) => setPaymentDueDate(date)}
                    label="Due Date"
                    minDate={endDate || undefined}
                  />
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    Must be on or after the return date of the booking
                  </p>
                </div>
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
