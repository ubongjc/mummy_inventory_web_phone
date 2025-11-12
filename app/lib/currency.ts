/**
 * Currency formatting and symbol utilities
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  CAD: "$",
  EUR: "€",
  GBP: "£",
};

/**
 * Get the currency symbol for a currency code
 */
export function symbolFor(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

/**
 * Format an amount with currency symbol
 * @param amount - The amount to format
 * @param currencyCode - Currency code (e.g., "NGN", "USD")
 * @param locale - Locale for formatting (default: "en-NG")
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale: string = "en-NG"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "symbol",
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    return `${symbolFor(currencyCode)}${amount.toFixed(2)}`;
  }
}
