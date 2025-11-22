'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BellRing,
  Mail,
  MessageSquare,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface NotificationPreferences {
  // Business alerts
  newInquiryEmail: boolean;
  newInquirySms: boolean;
  overduePaymentEmail: boolean;
  overduePaymentSms: boolean;
  lowStockEmail: boolean;
  lowStockSms: boolean;
  upcomingBookingEmail: boolean;
  upcomingBookingSms: boolean;
  bookingConfirmedEmail: boolean;
  bookingConfirmedSms: boolean;

  // Customer reminders
  customerRentalReminderEmail: boolean;
  customerRentalReminderSms: boolean;
  customerReturnReminderEmail: boolean;
  customerReturnReminderSms: boolean;
  customerPaymentReminderEmail: boolean;
  customerPaymentReminderSms: boolean;

  // Timing
  reminderHoursBefore: number;

  // SMS settings
  smsProviderPhone: string | null;
}

export default function NotificationSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPreferences();
    }
  }, [status]);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/settings');

      if (response.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load notification settings');
      }

      const data = await response.json();
      setPreferences(data.preferences);
      setIsPremium(data.isPremium);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Settings</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchPreferences}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!preferences) return null;

  const ToggleSwitch = ({
    label,
    enabled,
    onChange,
    disabled = false,
  }: {
    label: string;
    enabled: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
      <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <BellRing className="w-8 h-8" />
            Smart Notifications & Reminders
          </h1>
          <p className="text-purple-100">
            Configure email and SMS notifications for your business and customers
          </p>
          {!isPremium && (
            <div className="mt-4 bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="font-semibold text-sm">Premium Feature - Coming Soon!</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-semibold">Settings saved successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Business Alerts Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Business Alerts</h2>
              <p className="text-sm text-gray-600">Notifications sent to you about your business</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <ToggleSwitch
                label="New Inquiry - Email"
                enabled={preferences.newInquiryEmail}
                onChange={(v) => updatePreference('newInquiryEmail', v)}
              />
              <ToggleSwitch
                label="New Inquiry - SMS"
                enabled={preferences.newInquirySms}
                onChange={(v) => updatePreference('newInquirySms', v)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <ToggleSwitch
                label="Overdue Payment - Email"
                enabled={preferences.overduePaymentEmail}
                onChange={(v) => updatePreference('overduePaymentEmail', v)}
              />
              <ToggleSwitch
                label="Overdue Payment - SMS"
                enabled={preferences.overduePaymentSms}
                onChange={(v) => updatePreference('overduePaymentSms', v)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <ToggleSwitch
                label="Low Stock Alert - Email"
                enabled={preferences.lowStockEmail}
                onChange={(v) => updatePreference('lowStockEmail', v)}
              />
              <ToggleSwitch
                label="Low Stock Alert - SMS"
                enabled={preferences.lowStockSms}
                onChange={(v) => updatePreference('lowStockSms', v)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <ToggleSwitch
                label="Upcoming Booking - Email"
                enabled={preferences.upcomingBookingEmail}
                onChange={(v) => updatePreference('upcomingBookingEmail', v)}
              />
              <ToggleSwitch
                label="Upcoming Booking - SMS"
                enabled={preferences.upcomingBookingSms}
                onChange={(v) => updatePreference('upcomingBookingSms', v)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <ToggleSwitch
                label="Booking Confirmed - Email"
                enabled={preferences.bookingConfirmedEmail}
                onChange={(v) => updatePreference('bookingConfirmedEmail', v)}
              />
              <ToggleSwitch
                label="Booking Confirmed - SMS"
                enabled={preferences.bookingConfirmedSms}
                onChange={(v) => updatePreference('bookingConfirmedSms', v)}
              />
            </div>
          </div>
        </div>

        {/* Customer Reminders Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customer Reminders</h2>
              <p className="text-sm text-gray-600">Automatic reminders sent to your customers</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <ToggleSwitch
                label="Rental Reminder - Email"
                enabled={preferences.customerRentalReminderEmail}
                onChange={(v) => updatePreference('customerRentalReminderEmail', v)}
              />
              <ToggleSwitch
                label="Rental Reminder - SMS"
                enabled={preferences.customerRentalReminderSms}
                onChange={(v) => updatePreference('customerRentalReminderSms', v)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <ToggleSwitch
                label="Return Reminder - Email"
                enabled={preferences.customerReturnReminderEmail}
                onChange={(v) => updatePreference('customerReturnReminderEmail', v)}
              />
              <ToggleSwitch
                label="Return Reminder - SMS"
                enabled={preferences.customerReturnReminderSms}
                onChange={(v) => updatePreference('customerReturnReminderSms', v)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <ToggleSwitch
                label="Payment Reminder - Email"
                enabled={preferences.customerPaymentReminderEmail}
                onChange={(v) => updatePreference('customerPaymentReminderEmail', v)}
              />
              <ToggleSwitch
                label="Payment Reminder - SMS"
                enabled={preferences.customerPaymentReminderSms}
                onChange={(v) => updatePreference('customerPaymentReminderSms', v)}
              />
            </div>
          </div>
        </div>

        {/* Timing Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Timing Settings</h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send reminders (hours before event)
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={preferences.reminderHoursBefore}
              onChange={(e) =>
                updatePreference('reminderHoursBefore', parseInt(e.target.value, 10))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum: 168 hours (7 days)</p>
          </div>
        </div>

        {/* SMS Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">SMS Settings</h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business SMS Number (E.164 format)
            </label>
            <input
              type="tel"
              placeholder="+2348012345678"
              value={preferences.smsProviderPhone || ''}
              onChange={(e) => updatePreference('smsProviderPhone', e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: +[country code][number] (e.g., +2348012345678)
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
