import * as React from "react";
import { cn } from "@/lib/cn";

type AppInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  requiredMark?: boolean;
};

export function AppInput({
  id,
  label,
  error,
  hint,
  requiredMark,
  className,
  ...props
}: AppInputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const msgId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-900">
        {label} {requiredMark && <span className="text-red-600">*</span>}
      </label>

      <input
        id={inputId}
        aria-invalid={hasError}
        aria-describedby={hasError ? msgId : undefined}
        className={cn(
          "block w-full px-3 py-2 rounded-md border text-base placeholder:text-gray-400",
          "transition focus:outline-none font-semibold",
          hasError
            ? "border-red-500 ring-2 ring-red-500/40 focus:ring-red-500"
            : "border-gray-400 focus:ring-2 focus:ring-blue-500",
          className
        )}
        {...props}
      />

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
