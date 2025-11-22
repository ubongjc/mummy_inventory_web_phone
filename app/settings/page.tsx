"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings as SettingsIcon, Save, Building2, DollarSign, Globe, Calendar, AlertTriangle, ArrowLeft, Home, Package, CalendarDays, Image as ImageIcon, User, Trash2, Receipt, Sparkles } from "lucide-react";
import { sanitizeInput, phoneRegex, emailRegex } from "@/app/lib/clientValidation";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { signOut, useSession } from "next-auth/react";

interface Settings {
  id: string;
  businessName: string | null;
  currency: string;
  currencySymbol: string;
  businessPhone: string | null;
  businessEmail: string | null;
  businessAddress: string | null;
  taxRate: number;
  taxEnabled: boolean;
  taxInclusive: boolean;
  lowStockThreshold: number;
  defaultBookingDays: number;
  dateFormat: string;
  timezone: string;
  updatedAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  logoUrl: string | null;
  role: string;
}

const CURRENCY_OPTIONS = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2025)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2025)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2025-12-31)" },
  { value: "MMM DD, YYYY", label: "MMM DD, YYYY (Dec 31, 2025)" },
];

const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Toronto", label: "Toronto (Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Vancouver", label: "Vancouver (Canada)" },
  { value: "America/Phoenix", label: "Phoenix (US)" },
  { value: "America/Anchorage", label: "Alaska" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "America/Sao_Paulo", label: "São Paulo" },
  { value: "America/Buenos_Aires", label: "Buenos Aires" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Europe/Rome", label: "Rome" },
  { value: "Europe/Madrid", label: "Madrid" },
  { value: "Europe/Moscow", label: "Moscow" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Kolkata", label: "Mumbai/Kolkata" },
  { value: "Africa/Lagos", label: "Lagos" },
  { value: "Africa/Cairo", label: "Cairo" },
  { value: "Africa/Johannesburg", label: "Johannesburg" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Pacific/Auckland", label: "Auckland" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const isPremium = session?.user?.isPremium || false;

  const [settings, setSettings] = useState<Settings | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState({
    businessName: "",
    businessPhone: "",
    businessEmail: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchUserProfile();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleSave = async () => {
    if (!settings) {
      return;
    }

    // Validate all fields before saving
    let hasErrors = false;
    const newErrors = {
      businessName: "",
      businessPhone: "",
      businessEmail: "",
    };

    // Validate business name (optional)
    if (settings.businessName && settings.businessName.trim().length > 0) {
      if (settings.businessName.trim().length < 2) {
        newErrors.businessName = "Business name must be at least 2 characters if provided";
        hasErrors = true;
      } else if (settings.businessName.length > 25) {
        newErrors.businessName = "Business name must be less than 25 characters";
        hasErrors = true;
      }
    }

    // Validate business phone if provided
    if (settings.businessPhone) {
      if (!validateBusinessPhone(settings.businessPhone)) {
        hasErrors = true;
      }
    }

    // Validate business email if provided
    if (settings.businessEmail) {
      if (!validateBusinessEmail(settings.businessEmail)) {
        hasErrors = true;
      }
    }

    setErrors(newErrors);

    if (hasErrors || errors.businessPhone || errors.businessEmail) {
      const errorMessages = [];
      if (newErrors.businessName) {
        errorMessages.push(newErrors.businessName);
      }
      if (errors.businessPhone) {
        errorMessages.push(errors.businessPhone);
      }
      if (errors.businessEmail) {
        errorMessages.push(errors.businessEmail);
      }

      setMessage({
        type: "error",
        text: errorMessages.join(". "),
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);

      // Update localStorage cache when settings are saved
      if (updatedSettings.businessName) {
        localStorage.setItem('settingsBusinessName', updatedSettings.businessName);
      }

      setMessage({ type: "success", text: "Settings saved successfully!" });

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (!settings) {
      return;
    }
    setSettings({ ...settings, [key]: value });
  };

  const validateBusinessPhone = (value: string) => {
    if (!value) {
      setErrors((prev) => ({ ...prev, businessPhone: "" }));
      return true;
    }
    const sanitized = sanitizeInput(value);
    if (sanitized.length < 8) {
      setErrors((prev) => ({ ...prev, businessPhone: "Phone number must be at least 8 digits" }));
      return false;
    }
    if (sanitized.length > 15) {
      setErrors((prev) => ({ ...prev, businessPhone: "Phone number must be less than 15 digits" }));
      return false;
    }
    if (!phoneRegex.test(sanitized)) {
      setErrors((prev) => ({ ...prev, businessPhone: "Please enter a valid phone number (e.g., +2341234567890 or +11234567890)" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, businessPhone: "" }));
    return true;
  };

  const validateBusinessEmail = (value: string) => {
    if (!value) {
      setErrors((prev) => ({ ...prev, businessEmail: "" }));
      return true;
    }
    const sanitized = sanitizeInput(value);
    if (sanitized.length < 3) {
      setErrors((prev) => ({ ...prev, businessEmail: "Email must be at least 3 characters" }));
      return false;
    }
    if (sanitized.length > 254) {
      setErrors((prev) => ({ ...prev, businessEmail: "Email must be less than 254 characters" }));
      return false;
    }
    if (!emailRegex.test(sanitized)) {
      setErrors((prev) => ({ ...prev, businessEmail: "Please enter a valid email address (e.g., business@example.com)" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, businessEmail: "" }));
    return true;
  };

  const updateCurrency = (code: string) => {
    const currency = CURRENCY_OPTIONS.find((c) => c.code === code);
    if (currency && settings) {
      setSettings({
        ...settings,
        currency: currency.code,
        currencySymbol: currency.symbol,
      });
    }
  };

  const updateProfile = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    if (!userProfile) {
      return;
    }
    setUserProfile({ ...userProfile, [key]: value });
  };

  // Request location permission and get timezone
  const requestLocationForTimezone = async () => {
    if ("geolocation" in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });

        if (permission.state === "denied") {
          alert("Location access denied. Please enable location services in your browser settings to auto-detect timezone.");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Use timezone API to get timezone from coordinates
              const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
              updateSetting("timezone", timezone);
              alert(`Timezone set to: ${timezone}`);
            } catch (error) {
              console.error("Error getting timezone:", error);
              alert("Could not determine timezone from your location.");
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert("Could not access your location. Please set timezone manually.");
          }
        );
      } catch (error) {
        console.error("Error requesting location:", error);
        // Fallback to browser timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        updateSetting("timezone", timezone);
      }
    } else {
      alert("Geolocation is not supported by your browser. Please set timezone manually.");
    }
  };

  // Set initial business email from user email
  useEffect(() => {
    if (userProfile?.email && settings && !settings.businessEmail) {
      updateSetting("businessEmail", userProfile.email);
    }
  }, [userProfile, settings]);

  const handleSaveProfile = async () => {
    if (!userProfile) {
      return;
    }

    setSavingProfile(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: userProfile.businessName,
          logoUrl: userProfile.logoUrl,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);

      // Update localStorage cache when profile is saved
      if (updatedProfile.businessName) {
        localStorage.setItem('businessName', updatedProfile.businessName);
      }

      setMessage({ type: "success", text: "Business branding saved successfully!" });

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: "Failed to save business branding" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      // Successfully deleted - sign out and redirect
      await signOut({ callbackUrl: "/" });
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setMessage({ type: "error", text: `Failed to delete account: ${error.message}` });
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <div className="text-red-600 font-bold text-lg">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-2 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Header */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg sm:shadow-2xl p-2 sm:p-4 mb-3 sm:mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2 sm:mb-4 gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-md sm:shadow-lg text-xs sm:text-sm"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Back to Dashboard
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-md sm:shadow-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl flex-shrink-0">
              <SettingsIcon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-3xl font-bold text-black">Settings</h1>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Configure your booking business preferences</p>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl font-bold ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Business Information */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-bold text-black">Business Information</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Business Name <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={settings.businessName || ''}
                onChange={(e) => {
                  updateSetting("businessName", e.target.value);
                  // Clear error when user starts typing
                  if (errors.businessName) {
                    setErrors((prev) => ({ ...prev, businessName: "" }));
                  }
                }}
                className={`w-full px-3 sm:px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium text-sm sm:text-base ${
                  errors.businessName ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={25}
                placeholder="My Rental Business"
              />
              {errors.businessName ? (
                <div className="mt-1 bg-red-50 border border-red-200 rounded p-1">
                  <p className="text-xs text-red-700 font-medium">{errors.businessName}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-600 mt-1">
                  {(settings.businessName || '').length}/25 characters
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Business Phone</label>
              <input
                type="tel"
                value={settings.businessPhone || ""}
                onChange={(e) => {
                  const val = e.target.value || null;
                  updateSetting("businessPhone", val);
                  if (val) {
                    validateBusinessPhone(val);
                  } else {
                    setErrors((prev) => ({ ...prev, businessPhone: "" }));
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    validateBusinessPhone(e.target.value);
                  }
                }}
                className={`w-full px-3 sm:px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium text-sm sm:text-base ${
                  errors.businessPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                minLength={8}
                maxLength={15}
              />
              {errors.businessPhone && (
                <div className="mt-1 bg-red-50 border border-red-200 rounded p-1">
                  <p className="text-xs text-red-700 font-medium">{errors.businessPhone}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Business Email</label>
              <input
                type="email"
                value={settings.businessEmail || ""}
                onChange={(e) => {
                  const val = e.target.value || null;
                  updateSetting("businessEmail", val);
                  if (val) {
                    validateBusinessEmail(val);
                  } else {
                    setErrors((prev) => ({ ...prev, businessEmail: "" }));
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value) {
                    validateBusinessEmail(e.target.value);
                  }
                }}
                className={`w-full px-3 sm:px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium text-sm sm:text-base ${
                  errors.businessEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                minLength={3}
                maxLength={254}
              />
              {errors.businessEmail && (
                <div className="mt-1 bg-red-50 border border-red-200 rounded p-1">
                  <p className="text-xs text-red-700 font-medium">{errors.businessEmail}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Business Address</label>
              <textarea
                value={settings.businessAddress || ""}
                onChange={(e) => updateSetting("businessAddress", e.target.value || null)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium resize-none text-sm sm:text-base"
                rows={2}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{(settings.businessAddress || "").length}/100 characters</p>
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <h2 className="text-lg sm:text-xl font-bold text-black">Currency</h2>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Currency <span className="text-red-500">*</span>
            </label>
            <select
              value={settings.currency}
              onChange={(e) => updateCurrency(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-bold text-sm sm:text-base"
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tax Calculator (Premium Feature) */}
        <div className={`bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 ${isPremium ? 'border-yellow-400' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-bold text-black">Tax Calculator</h2>
            {isPremium && (
              <span className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                <Sparkles className="w-3 h-3" />
                PREMIUM
              </span>
            )}
          </div>

          {!isPremium ? (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">
                <span className="font-bold text-black">Tax Calculator</span> is a premium feature. Automatically calculate taxes on rentals based on your location and apply them to invoices and receipts.
              </p>
              <Link
                href="/premium"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 shadow-md text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade to Premium
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Enable Tax Calculation */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Enable Tax Calculation
                  </label>
                  <p className="text-xs text-gray-600">
                    Automatically calculate and add tax to all bookings
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.taxEnabled}
                    onChange={(e) => updateSetting("taxEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Tax Rate */}
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) => updateSetting("taxRate", parseFloat(e.target.value) || 0)}
                  disabled={!settings.taxEnabled}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-medium text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="7.5"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Default: 7.5% (Nigeria VAT). Set your local tax rate.
                </p>
              </div>

              {/* Tax Inclusive */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Tax Inclusive Pricing
                  </label>
                  <p className="text-xs text-gray-600">
                    Price includes tax (ON) vs tax added on top (OFF)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.taxInclusive}
                    onChange={(e) => updateSetting("taxInclusive", e.target.checked)}
                    disabled={!settings.taxEnabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-200 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              {/* Tax Calculation Example */}
              {settings.taxEnabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-bold text-black mb-2">Tax Calculation Example:</p>
                  <div className="text-xs text-gray-700 space-y-1">
                    {settings.taxInclusive ? (
                      <>
                        <p>Price: ₦10,000 (includes {settings.taxRate}% tax)</p>
                        <p>Subtotal: ₦{(10000 / (1 + settings.taxRate / 100)).toFixed(2)}</p>
                        <p>Tax: ₦{(10000 - 10000 / (1 + settings.taxRate / 100)).toFixed(2)}</p>
                        <p className="font-bold">Total: ₦10,000</p>
                      </>
                    ) : (
                      <>
                        <p>Subtotal: ₦10,000</p>
                        <p>Tax ({settings.taxRate}%): ₦{(10000 * settings.taxRate / 100).toFixed(2)}</p>
                        <p className="font-bold">Total: ₦{(10000 * (1 + settings.taxRate / 100)).toFixed(2)}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Tax Resources & Help */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Tax Resources & Help
                </h3>

                <div className="space-y-3 text-xs text-gray-700">
                  {/* What is this tax? */}
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <p className="font-bold text-black mb-1">What is VAT/Sales Tax?</p>
                    <p>This calculator helps you apply VAT (Value Added Tax) or sales tax to your rental bookings. The default rate is 7.5% for Nigeria VAT, but you can adjust it to match your local tax requirements.</p>
                  </div>

                  {/* Business Income Tax Calculator */}
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <p className="font-bold text-black mb-1">Calculate Your Business Income Tax</p>
                    <p className="mb-2">Need to calculate income tax on your rental business earnings? Use this free calculator:</p>
                    <a
                      href="https://ng.talent.com/tax-calculator?salary=150000&from=month&region=Nigeria"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold underline"
                    >
                      Nigeria Income Tax Calculator
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  {/* Need help filing taxes? */}
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <p className="font-bold text-black mb-1">Need Help Filing Taxes?</p>
                    <p className="mb-2">Get professional assistance with tax filing and compliance:</p>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>
                        <a
                          href="https://www.firs.gov.ng/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-semibold underline"
                        >
                          Federal Inland Revenue Service (FIRS)
                        </a>
                        {' '}- Official tax authority
                      </li>
                      <li>
                        <a
                          href="https://taxaide.com.ng/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-semibold underline"
                        >
                          TaxAide Consulting
                        </a>
                        {' '}- Tax consultancy services
                      </li>
                      <li>
                        Contact a local certified tax accountant for personalized guidance
                      </li>
                    </ul>
                  </div>

                  {/* Important Note */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="font-bold text-yellow-900 mb-1">⚠️ Important Note</p>
                    <p className="text-yellow-800">This tool calculates sales tax (VAT) on transactions. For business income tax, personal income tax, and tax filing requirements, please consult with a qualified tax professional or use the resources above.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timezone */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            <h2 className="text-lg sm:text-xl font-bold text-black">Timezone</h2>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Timezone <span className="text-red-500">*</span>
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting("timezone", e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-bold text-sm sm:text-base mb-2"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <button
              onClick={requestLocationForTimezone}
              className="w-full px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md text-sm sm:text-base"
            >
              📍 Use My Location to Set Timezone
            </button>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              Click the button above to automatically detect your timezone using your device location
            </p>
          </div>
        </div>

        {/* Danger Zone - Delete Account */}
        <div className="bg-red-50 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-red-300">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            <h2 className="text-lg sm:text-xl font-bold text-red-900">Danger Zone</h2>
          </div>

          <div className="bg-white rounded-lg p-4 border border-red-200">
            <h3 className="text-sm sm:text-base font-bold text-black mb-2">Delete Account</h3>
            <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
              Once you delete your account, there is no going back. This will permanently delete your account and all associated data including items, customers, bookings, and settings.
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeleting}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              {isDeleting ? "Deleting Account..." : "Delete My Account"}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="This will permanently delete your account and ALL associated data including items, customers, bookings, payments, and settings. This action cannot be undone!"
        itemCount={1}
        itemCountMessage="Your entire account and all data will be permanently deleted!"
      />
    </div>
  );
}
