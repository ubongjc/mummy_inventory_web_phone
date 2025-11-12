import { startOfDay, addDays, format } from "date-fns";

/**
 * Normalize a date string (YYYY-MM-DD) to 00:00 UTC
 * IMPORTANT: Input should be YYYY-MM-DD format from date inputs
 */
export function toUTCMidnight(date: Date | string): Date {
  if (typeof date === "string") {
    // Parse as YYYY-MM-DD and create UTC midnight directly
    const parts = date.split("T")[0].split("-"); // Handle both "2025-11-03" and "2025-11-03T..."
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
    const day = parseInt(parts[2]);
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  }
  // If it's already a Date object, normalize to UTC midnight
  const d = date;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Format date as YYYY-MM-DD using UTC components
 */
export function formatDateISO(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if two date ranges overlap (inclusive)
 */
export function rangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && start2 <= end1;
}

/**
 * Add one day to a date (for FullCalendar end date conversion)
 */
export function addOneDay(date: Date): Date {
  return addDays(date, 1);
}

/**
 * Convert DB date to local date string
 */
export function toLocalDateString(date: Date): string {
  return format(date, "MMM dd, yyyy");
}
