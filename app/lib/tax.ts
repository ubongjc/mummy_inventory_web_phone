/**
 * Tax calculation utilities for Premium users
 * Default: Nigeria VAT at 7.5%
 */

export interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
  taxInclusive: boolean;
}

/**
 * Calculate tax for a booking
 * @param amount - The base amount
 * @param taxRate - Tax rate as percentage (e.g., 7.5 for 7.5%)
 * @param taxInclusive - Whether the price includes tax (true) or tax is added on top (false)
 */
export function calculateTax(
  amount: number,
  taxRate: number,
  taxInclusive: boolean = false
): TaxCalculation {
  const rate = taxRate / 100;

  if (taxInclusive) {
    // Price includes tax - extract tax amount
    const total = amount;
    const subtotal = total / (1 + rate);
    const taxAmount = total - subtotal;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
      taxRate,
      taxInclusive,
    };
  } else {
    // Tax is added on top
    const subtotal = amount;
    const taxAmount = subtotal * rate;
    const total = subtotal + taxAmount;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
      taxRate,
      taxInclusive,
    };
  }
}

/**
 * Format currency amount (Nigerian Naira by default)
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'NGN',
  symbol: string = '₦'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return `${symbol}0.00`;
  }

  return `${symbol}${numAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and commas
  const cleaned = currencyString.replace(/[₦$,]/g, '').trim();
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : amount;
}

/**
 * Calculate tax breakdown for a booking with multiple items
 */
export function calculateBookingTax(
  itemPrices: number[],
  taxRate: number,
  taxInclusive: boolean = false
): TaxCalculation {
  const subtotal = itemPrices.reduce((sum, price) => sum + price, 0);
  return calculateTax(subtotal, taxRate, taxInclusive);
}

/**
 * Format tax rate for display
 */
export function formatTaxRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}
