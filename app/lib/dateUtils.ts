// Date utility helpers for consistent date handling across the app
// Ensures dates are stored and displayed consistently without timezone issues

/**
 * Converts a Date to UTC midnight (date-only, no time component)
 * This ensures dates are consistent regardless of user timezone
 */
export const toUtcDateOnly = (d: Date): Date => {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Converts a Date to YYYY-MM-DD format (ISO date string)
 * Uses UTC to avoid timezone shifts
 */
export const toYmd = (d: Date): string => {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Adds days to a date (UTC-safe)
 * @param d - The date to add days to
 * @param days - Number of days to add (can be negative)
 */
export const addDays = (d: Date, days: number): Date => {
  const result = new Date(d);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

/**
 * Parses a YYYY-MM-DD string to a UTC Date at midnight
 */
export const parseYmd = (ymd: string): Date => {
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};
