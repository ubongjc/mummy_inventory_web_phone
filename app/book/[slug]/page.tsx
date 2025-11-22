"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
  Loader2
} from "lucide-react";

interface PublicPageData {
  publicPage: {
    title: string;
    phonePublic: string | null;
    emailPublic: string | null;
    businessName: string;
    currency: string;
  };
  items: Array<{
    id: string;
    name: string;
    unit: string;
    totalQuantity: number;
    price: number;
    notes: string | null;
  }>;
}

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [pageData, setPageData] = useState<PublicPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
    contact: "",
    startDate: "",
    endDate: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({
      name: "",
      email: "",
      phone: "",
      contact: "",
      startDate: "",
      endDate: "",
    });

    // Validation
    const newFieldErrors = {
      name: "",
      email: "",
      phone: "",
      contact: "",
      startDate: "",
      endDate: "",
    };
    let hasErrors = false;

    if (!name || name.trim().length < 2) {
      newFieldErrors.name = "Name must be at least 2 characters";
      hasErrors = true;
    }

    if (!email && !phone) {
      newFieldErrors.contact = "Please provide either email or phone number";
      hasErrors = true;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newFieldErrors.email = "Please enter a valid email";
      hasErrors = true;
    }

    if (!startDate) {
      newFieldErrors.startDate = "Start date is required";
      hasErrors = true;
    }

    if (!endDate) {
      newFieldErrors.endDate = "End date is required";
      hasErrors = true;
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newFieldErrors.endDate = "End date must be after start date";
      hasErrors = true;
    }

    if (startDate && new Date(startDate) < new Date()) {
      newFieldErrors.startDate = "Start date cannot be in the past";
      hasErrors = true;
    }

    setFieldErrors(newFieldErrors);

    if (hasErrors) {
      return;
    }

    // Submit inquiry
    setSubmitting(true);
    try {
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setSubmitted(true);
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setStartDate("");
      setEndDate("");
    } catch (err: any) {
      setError(err.message || "Failed to submit inquiry");
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Items */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Available Items</h2>
              </div>

              {pageData?.items && pageData.items.length > 0 ? (
                <div className="space-y-4">
                  {pageData.items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                        <span className="text-lg font-bold text-blue-600">
                          {pageData.publicPage.currency}{item.price.toFixed(2)}
                          <span className="text-sm text-gray-500 font-normal">/{item.unit}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {item.totalQuantity} available
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No items available at the moment</p>
              )}
            </div>
          </div>

          {/* Inquiry Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request a Quote</h2>

              {submitted && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">Inquiry Submitted!</h3>
                      <p className="text-sm text-green-800">
                        Thank you for your inquiry. We'll contact you soon!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="John Doe"
                  />
                  {fieldErrors.name && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldErrors.email ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldErrors.phone ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="+1234567890"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.phone}</p>
                  )}
                  {fieldErrors.contact && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.contact}</p>
                  )}
                </div>

                {/* Rental Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldErrors.startDate ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {fieldErrors.startDate && (
                      <p className="text-red-600 text-sm mt-1">{fieldErrors.startDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          fieldErrors.endDate ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {fieldErrors.endDate && (
                      <p className="text-red-600 text-sm mt-1">{fieldErrors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details (Optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      maxLength={1000}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Tell us about your rental needs..."
                    />
                  </div>
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
                      Submit Inquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
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
