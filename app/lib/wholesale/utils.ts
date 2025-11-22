/**
 * Utility functions for wholesale supplier system
 */

import crypto from "crypto";

/**
 * Generate stable supplier ID from key fields
 * SHA-256 hash of (company_name + primary_phone + state)
 */
export function generateSupplierId(
  companyName: string,
  primaryPhone: string,
  state: string
): string {
  const normalized = [
    companyName.toLowerCase().trim(),
    primaryPhone.trim(),
    state.trim(),
  ].join("|");

  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Deduplicate array
 */
export function dedupeArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Calculate array overlap percentage
 */
export function arrayOverlap<T>(arr1: T[], arr2: T[]): number {
  if (arr1.length === 0 || arr2.length === 0) return 0;

  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  const intersection = new Set([...set1].filter((x) => set2.has(x)));

  return intersection.size / Math.min(arr1.length, arr2.length);
}

/**
 * Sanitize text for CSV export
 */
export function sanitizeForCsv(text: string): string {
  return text.replace(/"/g, '""').replace(/\n/g, " ").replace(/\r/g, "");
}

/**
 * Format date for Africa/Lagos timezone
 */
export function formatDateLagos(date: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Clean company name (remove Inc, Ltd, etc.)
 */
export function cleanCompanyName(name: string): string {
  return name
    .replace(/\b(Ltd|Limited|Inc|Incorporated|LLC|Co|Company)\b\.?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
