"use client";

import { useState } from "react";
import { toYmd } from "@/app/lib/dateUtils";
import { useSettings } from "@/app/hooks/useSettings";
import DatePicker from "../DatePicker";

interface PaymentPanelProps {
  onSubmit: (amount: number, date: Date, notes?: string) => void | Promise<void>;
  defaultDate?: Date;
  loading?: boolean;
  onSuccess?: () => void;
}

/**
 * Shared payment panel component with uniform UI
 * Green header with emoji, currency prefix, uniform heights
 */
export function PaymentPanel({
  onSubmit,
  defaultDate,
  loading = false,
  onSuccess,
}: PaymentPanelProps) {
  const { settings } = useSettings();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(defaultDate ? toYmd(defaultDate) : toYmd(new Date()));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!date) {
      setError("Please select a payment date");
      return;
    }

    try {
      const [year, month, day] = date.split("-").map(Number);
      const paymentDate = new Date(Date.UTC(year, month - 1, day));

      await onSubmit(amountNum, paymentDate, notes || undefined);

      // Reset form after successful submission
      setAmount("");
      setNotes("");
      setDate(toYmd(new Date()));

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError("Failed to record payment");
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
      {/* Green header with emoji */}
      <div className="bg-green-100 border-b border-green-300 px-4 py-3">
        <h3 className="text-base font-semibold text-green-800">
          💰 Record New Payment
        </h3>
      </div>

      {/* Form content with green background */}
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="w-full min-w-0">
            <label className="block text-sm font-medium text-green-800 mb-1">
              Amount
            </label>
            <div className="flex items-center">
              <div className="flex items-center justify-center h-11 px-3 bg-white border-2 border-gray-300 rounded-l">
                <span className="text-green-600 font-semibold text-base">
                  {settings?.currencySymbol || "₦"}
                </span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                disabled={loading}
                className="flex-1 h-11 px-3 border-2 border-l-0 border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="w-full min-w-0">
            <DatePicker
              value={date}
              onChange={(date) => setDate(date)}
              label="Payment Date"
              maxDate={toYmd(new Date())}
            />
          </div>
        </div>

        <div className="w-full min-w-0">
          <label className="block text-sm font-medium text-green-800 mb-1">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={50}
            placeholder="e.g., Cash payment, Bank transfer..."
            disabled={loading}
            className="w-full h-11 px-3 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <p className="text-xs text-gray-600 mt-1">
            {notes.length}/50 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? "Recording..." : "Record Payment"}
        </button>
      </form>
    </div>
  );
}
