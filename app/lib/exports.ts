/**
 * Export utilities for Premium users
 * Generate CSV/Excel exports for items, customers, bookings, and payments
 */

import { formatCurrency } from './tax';

export type ExportFormat = 'csv' | 'excel';

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const cols = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = cols.map((col) => escapeCSVValue(col)).join(',');

  // Create data rows
  const dataRows = data.map((row) => {
    return cols
      .map((col) => {
        const value = row[col];
        return escapeCSVValue(value);
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export items to CSV
 */
export function exportItemsToCSV(items: any[]): string {
  const data = items.map((item) => ({
    Name: item.name,
    Unit: item.unit,
    'Total Quantity': item.totalQuantity,
    'Price (₦)': item.price ? formatCurrency(item.price) : 'N/A',
    Notes: item.notes || '',
    'Created At': new Date(item.createdAt).toLocaleDateString('en-NG'),
  }));

  return arrayToCSV(data);
}

/**
 * Export customers to CSV
 */
export function exportCustomersToCSV(customers: any[]): string {
  const data = customers.map((customer) => ({
    'First Name': customer.firstName || customer.name || '',
    'Last Name': customer.lastName || '',
    Phone: customer.phone || '',
    Email: customer.email || '',
    Address: customer.address || '',
    Notes: customer.notes || '',
    'Created At': new Date(customer.createdAt).toLocaleDateString('en-NG'),
  }));

  return arrayToCSV(data);
}

/**
 * Export bookings to CSV
 */
export function exportBookingsToCSV(bookings: any[]): string {
  const data = bookings.map((booking) => ({
    Reference: booking.reference || booking.id.substring(0, 8),
    Customer: booking.customer?.name || booking.customer?.firstName || '',
    'Start Date': new Date(booking.startDate).toLocaleDateString('en-NG'),
    'End Date': new Date(booking.endDate).toLocaleDateString('en-NG'),
    Status: booking.status,
    'Total Price (₦)': booking.totalPrice
      ? formatCurrency(booking.totalPrice)
      : 'N/A',
    'Advance Payment (₦)': booking.advancePayment
      ? formatCurrency(booking.advancePayment)
      : 'N/A',
    'Tax Amount (₦)': booking.taxAmount
      ? formatCurrency(booking.taxAmount)
      : 'N/A',
    'Total with Tax (₦)': booking.totalWithTax
      ? formatCurrency(booking.totalWithTax)
      : 'N/A',
    Notes: booking.notes || '',
    'Created At': new Date(booking.createdAt).toLocaleDateString('en-NG'),
  }));

  return arrayToCSV(data);
}

/**
 * Export payments to CSV
 */
export function exportPaymentsToCSV(payments: any[]): string {
  const data = payments.map((payment) => ({
    'Booking Reference': payment.booking?.reference || '',
    Customer: payment.booking?.customer?.name || '',
    'Amount (₦)': formatCurrency(payment.amount),
    'Payment Date': new Date(payment.paymentDate).toLocaleDateString('en-NG'),
    Notes: payment.notes || '',
  }));

  return arrayToCSV(data);
}

/**
 * Export analytics data to CSV
 */
export function exportAnalyticsToCSV(
  data: any[],
  headers: string[]
): string {
  return arrayToCSV(data, headers);
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(
  prefix: string,
  format: ExportFormat = 'csv'
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}_${timestamp}.${format}`;
}
