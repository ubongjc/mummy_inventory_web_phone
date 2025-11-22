"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
  Package,
  ArrowLeft,
  Loader2,
  Check,
  X,
  ShoppingCart,
} from "lucide-react";

interface Item {
  id: string;
  name: string;
  unit: string;
  totalQuantity: number;
  price: number;
  notes: string | null;
  imageUrl: string | null;
}

interface ItemAvailability extends Item {
  bookedQuantity: number;
  availableQuantity: number;
  isAvailable: boolean;
}

interface PublicPageData {
  publicPage: {
    title: string;
    phonePublic: string | null;
    emailPublic: string | null;
    businessName: string;
    currency: string;
    customMessage: string | null;
    contactMethods: string[];
  };
  items: Item[];
}

interface SelectedItem {
  itemId: string;
  quantity: number;
}

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [pageData, setPageData] = useState<PublicPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Availability checking
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState<ItemAvailability[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [showDirectMessage, setShowDirectMessage] = useState(false);

  // Fetch public page data
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/public-page/${slug}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to load page");
        }
        const data = await response.json();
        setPageData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load booking page");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) {
      setError("Please select start and end dates");
      return;
    }

    if (!pageData?.items || pageData.items.length === 0) {
      setError("No items available");
      return;
    }

    setCheckingAvailability(true);
    setError("");

    try {
      const itemIds = pageData.items.map((item) => item.id);
      const response = await fetch(`/api/public-page/${slug}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          itemIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check availability");
      }

      setAvailability(data.availability);
    } catch (err: any) {
      setError(err.message || "Failed to check availability");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleItemQuantityChange = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      setSelectedItems(selectedItems.filter((item) => item.itemId !== itemId));
    } else {
      const existing = selectedItems.find((item) => item.itemId === itemId);
      if (existing) {
        setSelectedItems(
          selectedItems.map((item) =>
            item.itemId === itemId ? { ...item, quantity } : item
          )
        );
      } else {
        setSelectedItems([...selectedItems, { itemId, quantity }]);
      }
    }
  };

  const getSelectedQuantity = (itemId: string): number => {
    return selectedItems.find((item) => item.itemId === itemId)?.quantity || 0;
  };

  const calculateTotal = (): number => {
    return selectedItems.reduce((total, selected) => {
      const item = availability.find((item) => item.id === selected.itemId);
      if (item && item.price) {
        // Calculate days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return total + (Number(item.price) * selected.quantity * days);
      }
      return total;
    }, 0);
  };

  const handleRequestBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name || name.trim().length < 2) {
      setError("Please enter your name");
      return;
    }

    if (!email && !phone) {
      setError("Please provide either email or phone number");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select rental dates");
      return;
    }

    if (selectedItems.length === 0) {
      setError("Please select at least one item");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare selected items with details
      const itemsWithDetails = selectedItems.map((selected) => {
        const item = availability.find((item) => item.id === selected.itemId);
        return {
          itemId: selected.itemId,
          quantity: selected.quantity,
          name: item?.name || "",
          price: item?.price ? Number(item.price) : 0,
        };
      });

      const response = await fetch(`/api/public-page/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email || null,
          phone: phone || null,
          message: message || null,
          startDate,
          endDate,
          selectedItems: itemsWithDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSubmitted(true);
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setSelectedItems([]);
    } catch (err: any) {
      setError(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    );
  }

  if (error && !pageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currency = pageData?.publicPage.currency || "$";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {pageData?.publicPage.businessName}
          </h1>
          <p className="text-lg text-gray-600 mt-1">{pageData?.publicPage.title}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            {pageData?.publicPage.emailPublic && (
              <a
                href={`mailto:${pageData.publicPage.emailPublic}`}
                className="flex items-center gap-2 hover:text-blue-600"
              >
                <Mail className="w-4 h-4" />
                {pageData.publicPage.emailPublic}
              </a>
            )}
            {pageData?.publicPage.phonePublic && (
              <a
                href={`tel:${pageData.publicPage.phonePublic}`}
                className="flex items-center gap-2 hover:text-blue-600"
              >
                <Phone className="w-4 h-4" />
                {pageData.publicPage.phonePublic}
              </a>
            )}
          </div>

          {/* Custom Message */}
          {pageData?.publicPage.customMessage && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">{pageData.publicPage.customMessage}</p>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Request Submitted!</h3>
                <p className="text-sm text-green-800">
                  Your rental request has been submitted successfully. The business owner will review it and get back to you soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Date Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Check Availability</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCheckAvailability}
                disabled={checkingAvailability || !startDate || !endDate}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkingAvailability ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Check Availability
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Available Items */}
        {availability.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Select Items</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availability.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 ${
                    item.isAvailable
                      ? "border-gray-200 hover:border-blue-300 hover:shadow-md"
                      : "border-red-200 bg-red-50"
                  } transition-all`}
                >
                  <div className="flex gap-4">
                    {/* Item Image */}
                    {item.imageUrl ? (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            {currency}{Number(item.price || 0).toFixed(2)}/{item.unit}/day
                          </p>
                        </div>
                        {item.isAvailable ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            <Check className="w-3 h-3" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                            <X className="w-3 h-3" />
                            Unavailable
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {item.availableQuantity} of {item.totalQuantity} available
                      </p>

                      {/* Quantity Selector */}
                      {item.isAvailable && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Quantity:</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleItemQuantityChange(
                                  item.id,
                                  Math.max(0, getSelectedQuantity(item.id) - 1)
                                )
                              }
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-medium">
                              {getSelectedQuantity(item.id)}
                            </span>
                            <button
                              onClick={() =>
                                handleItemQuantityChange(
                                  item.id,
                                  Math.min(item.availableQuantity, getSelectedQuantity(item.id) + 1)
                                )
                              }
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            {selectedItems.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Estimated Total:</span>
                  <span className="text-blue-600">{currency}{calculateTotal().toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  For {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items over{" "}
                  {startDate && endDate
                    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
                    : 0}{" "}
                  days
                </p>
              </div>
            )}
          </div>
        )}

        {/* Request Form */}
        {availability.length > 0 && selectedItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Rental Request</h2>

            <form onSubmit={handleRequestBooking} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about your rental needs..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Request Booking
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
          <p>Powered by {pageData?.publicPage.businessName}</p>
        </div>
      </footer>
    </div>
  );
}
