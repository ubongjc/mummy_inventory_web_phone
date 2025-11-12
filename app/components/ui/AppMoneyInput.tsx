"use client";

import React from "react";
import { symbolFor } from "@/app/lib/currency";

interface AppMoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  currencyCode: string;
}

/**
 * Money input with currency symbol prefix
 * Height: h-11 (44px), currency symbol on the left at same height
 */
export function AppMoneyInput({
  label,
  error,
  helperText,
  currencyCode,
  className = "",
  ...props
}: AppMoneyInputProps) {
  const symbol = symbolFor(currencyCode);

  return (
    <div className="w-full min-w-0">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <span className="text-green-600 font-semibold text-base">
            {symbol}
          </span>
        </div>
        <input
          {...props}
          type="number"
          step="0.01"
          min="0"
          className={`w-full h-11 text-base pl-8 pr-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-red-500 ring-2 ring-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          } ${className}`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
