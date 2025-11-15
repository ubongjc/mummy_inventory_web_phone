import * as React from "react";
import { cn } from "@/lib/cn";

type AppSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
  requiredMark?: boolean;
};

export function AppSelect({
  id,
  label,
  error,
  hint,
  requiredMark,
  className,
  children,
  ...props
}: AppSelectProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const msgId = `${selectId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-gray-900">
        {label} {requiredMark && <span className="text-red-600">*</span>}
      </label>

      <select
        id={selectId}
        aria-invalid={hasError}
        aria-describedby={hasError ? msgId : undefined}
        className={cn(
          "block w-full px-3 py-2 rounded-md border text-base",
          "transition focus:outline-none font-semibold",
          hasError
            ? "border-red-500 ring-2 ring-red-500/40 focus:ring-red-500"
            : "border-gray-400 focus:ring-2 focus:ring-blue-500",
          className
        )}
        {...props}
      >
        {children}
      </select>

      {hasError ? (
        <p id={msgId} role="alert" className="mt-1 text-xs font-semibold text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}
