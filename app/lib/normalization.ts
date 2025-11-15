/**
 * Data normalization utilities for consistent data storage
 */

/**
 * Trims whitespace and collapses multiple consecutive spaces into one
 */
export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Converts text to Title Case (first letter of each word capitalized)
 * Handles names with apostrophes and hyphens correctly
 * Examples: "john doe" -> "John Doe", "o'brien" -> "O'Brien", "mary-jane" -> "Mary-Jane"
 */
export function toTitleCase(text: string): string {
  if (!text) {
    return text;
  }

  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // Collapse spaces first
    .split(/(\s+|-|')/) // Split on spaces, hyphens, and apostrophes
    .map((word, index, array) => {
      // Don't capitalize separators (spaces, hyphens, apostrophes)
      if (word === ' ' || word === '-' || word === "'") {
        return word;
      }

      // Capitalize first letter of each word part
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join('');
}

/**
 * Normalizes phone numbers to E.164 format (basic cleaning)
 * Removes all non-digit characters except leading +
 */
export function normalizePhone(phone: string): string {
  if (!phone) {
    return phone;
  }

  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Normalizes email to lowercase
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes unit strings (lowercase, letters and spaces only)
 */
export function normalizeUnit(unit: string): string {
  return unit.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Normalizes item names (Title Case, collapsed spaces)
 */
export function normalizeItemName(name: string): string {
  return toTitleCase(name);
}

/**
 * Rounds a number to 2 decimal places for money values
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Validates and normalizes hex color codes
 * Accepts #RGB or #RRGGBB format
 */
export function normalizeHexColor(color: string): string {
  const trimmed = color.trim();
  if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    throw new Error('Invalid hex color format');
  }
  return trimmed.toUpperCase();
}
