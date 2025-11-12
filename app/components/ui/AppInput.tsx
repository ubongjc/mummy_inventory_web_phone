"use client";

import React from "react";

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Standardized input component with uniform styling
 * Height: h-11 (44px), full width, consistent padding
 */
export function AppInput({
  label,
  error,
  helperText,
  className = "",
  ...props
}: AppInputProps) {
  return (
    <div className="w-full min-w-0">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        {...props}
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
