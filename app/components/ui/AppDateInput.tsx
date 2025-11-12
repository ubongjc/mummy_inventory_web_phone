"use client";

import React from "react";

interface AppDateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Date input with uniform styling
 * Height: h-11 (44px), full width, consistent with other inputs
 */
export function AppDateInput({
  label,
  error,
  helperText,
  className = "",
  ...props
}: AppDateInputProps) {
  return (
    <div className="w-full min-w-0">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        {...props}
        type="date"
        className={`w-full h-11 text-base px-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-red-500 ring-2 ring-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        } ${className}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
