import * as React from "react";
import { cn } from "@/lib/cn";

type AppTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
  requiredMark?: boolean;
  showCharCount?: boolean;
  currentLength?: number;
};

export function AppTextarea({
  id,
  label,
  error,
  hint,
  requiredMark,
  showCharCount,
  currentLength,
  maxLength,
  className,
  ...props
}: AppTextareaProps) {
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;
  const msgId = `${textareaId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <label htmlFor={textareaId} className="mb-1 block text-sm font-medium text-gray-900">
        {label} {requiredMark && <span className="text-red-600">*</span>}
      </label>

      <textarea
        id={textareaId}
        aria-invalid={hasError}
        aria-describedby={hasError ? msgId : undefined}
        maxLength={maxLength}
        className={cn(
          "block w-full px-3 py-2 rounded-md border text-base placeholder:text-gray-400",
          "transition focus:outline-none font-semibold resize-none",
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

      {showCharCount && maxLength && (
        <p className="mt-1 text-xs text-gray-500">
          {currentLength ?? 0}/{maxLength} characters {maxLength - (currentLength ?? 0) > 0 ? "remaining" : "maximum"}
        </p>
      )}
    </div>
  );
}
