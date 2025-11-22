// Data export utilities for CSV, Excel, and PDF generation

import { format } from 'date-fns';

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string): Blob {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas, quotes, or newlines
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Export bookings to CSV with formatted data
 */
export function exportBookingsToCSV(bookings: any[]): Blob {
  const formattedData = bookings.map(booking => ({
    'Reference': booking.reference || booking.id.substring(0, 8).toUpperCase(),
    'Customer': `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim(),
    'Customer Email': booking.customer?.email || '',
    'Customer Phone': booking.customer?.phone || '',
    'Start Date': format(new Date(booking.startDate), 'MMM dd, yyyy'),
    'End Date': format(new Date(booking.endDate), 'MMM dd, yyyy'),
    'Status': booking.status,
    'Total Price': booking.totalPrice ? `$${Number(booking.totalPrice).toFixed(2)}` : '',
    'Advance Payment': booking.advancePayment ? `$${Number(booking.advancePayment).toFixed(2)}` : '',
    'Items': booking.items?.map((item: any) =>
      `${item.item?.name || 'Unknown'} (${item.quantity})`
    ).join('; ') || '',
    'Created': format(new Date(booking.createdAt), 'MMM dd, yyyy HH:mm'),
  }));

  return exportToCSV(formattedData, 'bookings.csv');
}

/**
 * Export customers to CSV
 */
export function exportCustomersToCSV(customers: any[]): Blob {
  const formattedData = customers.map(customer => ({
    'First Name': customer.firstName,
    'Last Name': customer.lastName,
    'Email': customer.email || '',
    'Phone': customer.phone || '',
    'Address': customer.address || '',
    'Total Bookings': customer._count?.bookings || 0,
    'Created': format(new Date(customer.createdAt), 'MMM dd, yyyy'),
  }));

  return exportToCSV(formattedData, 'customers.csv');
}

/**
 * Export items/inventory to CSV
 */
export function exportItemsToCSV(items: any[]): Blob {
  const formattedData = items.map(item => ({
    'Item Name': item.name,
    'Unit': item.unit || '',
    'Total Quantity': item.totalQuantity,
    'Price': item.price ? `$${Number(item.price).toFixed(2)}` : '',
    'Notes': item.notes || '',
    'Created': format(new Date(item.createdAt), 'MMM dd, yyyy'),
  }));

  return exportToCSV(formattedData, 'inventory.csv');
}

/**
 * Export payments to CSV
 */
export function exportPaymentsToCSV(payments: any[]): Blob {
  const formattedData = payments.map(payment => ({
    'Booking Reference': payment.booking?.reference || payment.bookingId.substring(0, 8).toUpperCase(),
    'Customer': payment.booking?.customer ?
      `${payment.booking.customer.firstName} ${payment.booking.customer.lastName}` : '',
    'Amount': `$${Number(payment.amount).toFixed(2)}`,
    'Payment Date': format(new Date(payment.paymentDate), 'MMM dd, yyyy'),
    'Notes': payment.notes || '',
    'Created': format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm'),
  }));

  return exportToCSV(formattedData, 'payments.csv');
}

/**
 * Generate business report data
 */
export interface BusinessReportData {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalBookings: number;
    totalRevenue: number;
    totalPayments: number;
    outstandingBalance: number;
    newCustomers: number;
    activeItems: number;
  };
  topCustomers: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
  topItems: Array<{
    name: string;
    timesRented: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  bookingsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Export business report to CSV
 */
export function exportBusinessReportToCSV(report: BusinessReportData): Blob {
  const lines: string[] = [];

  // Header
  lines.push(`Business Report - ${format(report.period.start, 'MMM dd, yyyy')} to ${format(report.period.end, 'MMM dd, yyyy')}`);
  lines.push('');

  // Summary
  lines.push('SUMMARY');
  lines.push('Metric,Value');
  lines.push(`Total Bookings,${report.summary.totalBookings}`);
  lines.push(`Total Revenue,$${report.summary.totalRevenue.toFixed(2)}`);
  lines.push(`Total Payments Received,$${report.summary.totalPayments.toFixed(2)}`);
  lines.push(`Outstanding Balance,$${report.summary.outstandingBalance.toFixed(2)}`);
  lines.push(`New Customers,${report.summary.newCustomers}`);
  lines.push(`Active Items,${report.summary.activeItems}`);
  lines.push('');

  // Top Customers
  lines.push('TOP CUSTOMERS');
  lines.push('Customer,Bookings,Revenue');
  report.topCustomers.forEach(customer => {
    lines.push(`${customer.name},${customer.bookings},$${customer.revenue.toFixed(2)}`);
  });
  lines.push('');

  // Top Items
  lines.push('TOP ITEMS');
  lines.push('Item,Times Rented,Revenue');
  report.topItems.forEach(item => {
    lines.push(`${item.name},${item.timesRented},$${item.revenue.toFixed(2)}`);
  });
  lines.push('');

  // Revenue by Month
  lines.push('REVENUE BY MONTH');
  lines.push('Month,Revenue,Bookings');
  report.revenueByMonth.forEach(month => {
    lines.push(`${month.month},$${month.revenue.toFixed(2)},${month.bookings}`);
  });
  lines.push('');

  // Bookings by Status
  lines.push('BOOKINGS BY STATUS');
  lines.push('Status,Count,Percentage');
  report.bookingsByStatus.forEach(status => {
    lines.push(`${status.status},${status.count},${status.percentage.toFixed(1)}%`);
  });

  const csvContent = lines.join('\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Trigger download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export to Excel (XLSX) format
 * This creates a simple Excel-compatible CSV with BOM for proper Excel opening
 */
export function exportToExcel(data: any[], filename: string): Blob {
  const csvBlob = exportToCSV(data, filename);

  // Add BOM for Excel UTF-8 recognition
  const BOM = '\uFEFF';
  const csvWithBOM = new Blob([BOM, csvBlob], {
    type: 'application/vnd.ms-excel;charset=utf-8;'
  });

  return csvWithBOM;
}

/**
 * Generate simple PDF report (HTML-based, can be printed to PDF)
 * Returns HTML string that can be used in a print dialog or PDF library
 */
export function generatePDFReportHTML(report: BusinessReportData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Business Report</title>
  <style>
    @media print {
      @page { margin: 1cm; }
      body { margin: 0; }
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #667eea;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }
    h2 {
      color: #555;
      margin-top: 30px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .summary-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .summary-card h3 {
      margin: 0 0 5px 0;
      font-size: 14px;
      color: #666;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Business Report</h1>
  <p><strong>Period:</strong> ${format(report.period.start, 'MMMM dd, yyyy')} - ${format(report.period.end, 'MMMM dd, yyyy')}</p>

  <h2>Summary</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <h3>Total Bookings</h3>
      <div class="value">${report.summary.totalBookings}</div>
    </div>
    <div class="summary-card">
      <h3>Total Revenue</h3>
      <div class="value">$${report.summary.totalRevenue.toFixed(2)}</div>
    </div>
    <div class="summary-card">
      <h3>Payments Received</h3>
      <div class="value">$${report.summary.totalPayments.toFixed(2)}</div>
    </div>
    <div class="summary-card">
      <h3>Outstanding Balance</h3>
      <div class="value">$${report.summary.outstandingBalance.toFixed(2)}</div>
    </div>
    <div class="summary-card">
      <h3>New Customers</h3>
      <div class="value">${report.summary.newCustomers}</div>
    </div>
    <div class="summary-card">
      <h3>Active Items</h3>
      <div class="value">${report.summary.activeItems}</div>
    </div>
  </div>

  <h2>Top Customers</h2>
  <table>
    <thead>
      <tr>
        <th>Customer</th>
        <th>Bookings</th>
        <th>Revenue</th>
      </tr>
    </thead>
    <tbody>
      ${report.topCustomers.map(customer => `
        <tr>
          <td>${customer.name}</td>
          <td>${customer.bookings}</td>
          <td>$${customer.revenue.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Top Items</h2>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Times Rented</th>
        <th>Revenue</th>
      </tr>
    </thead>
    <tbody>
      ${report.topItems.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.timesRented}</td>
          <td>$${item.revenue.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Revenue by Month</h2>
  <table>
    <thead>
      <tr>
        <th>Month</th>
        <th>Revenue</th>
        <th>Bookings</th>
      </tr>
    </thead>
    <tbody>
      ${report.revenueByMonth.map(month => `
        <tr>
          <td>${month.month}</td>
          <td>$${month.revenue.toFixed(2)}</td>
          <td>${month.bookings}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Bookings by Status</h2>
  <table>
    <thead>
      <tr>
        <th>Status</th>
        <th>Count</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      ${report.bookingsByStatus.map(status => `
        <tr>
          <td>${status.status}</td>
          <td>${status.count}</td>
          <td>${status.percentage.toFixed(1)}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
    <p>VerySimple Inventory - Business Report</p>
  </div>

  <script>
    // Auto-print on load (optional)
    // window.onload = () => window.print();
  </script>
</body>
</html>
  `;
}
