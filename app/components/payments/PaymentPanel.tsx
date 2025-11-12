"use client";

import { useState } from "react";
import { AppMoneyInput } from "@/app/components/ui/AppMoneyInput";
import { AppDateInput } from "@/app/components/ui/AppDateInput";
import { AppInput } from "@/app/components/ui/AppInput";
import { toYmd } from "@/app/lib/dateUtils";

interface PaymentPanelProps {
  currencyCode: string;
  onSubmit: (amount: number, date: Date, notes?: string) => void | Promise<void>;
  defaultDate?: Date;
  loading?: boolean;
}

/**
 * Shared payment panel component with uniform UI
 * Green header with emoji, currency prefix, uniform heights
 */
export function PaymentPanel({
  currencyCode,
  onSubmit,
  defaultDate,
  loading = false,
}: PaymentPanelProps) {
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
    } catch (err) {
      setError("Failed to record payment");
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Green header with emoji */}
      <div className="bg-green-50 border-b border-green-200 px-4 py-3">
        <h3 className="text-base font-semibold text-green-800">
          💰 Record New Payment
        </h3>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AppMoneyInput
            label="Amount"
            currencyCode={currencyCode}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            disabled={loading}
          />

          <AppDateInput
            label="Payment Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={toYmd(new Date())} // Cannot record future payments
            required
            disabled={loading}
          />
        </div>

        <AppInput
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Cash payment, Bank transfer..."
          disabled={loading}
        />

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
