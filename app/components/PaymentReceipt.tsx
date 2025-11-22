'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  FileText,
  CheckCircle,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface ReceiptData {
  receiptNumber: string;
  receiptDate: string;
  business: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  booking: {
    id: string;
    reference: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }>;
  financial: {
    subtotal: number;
    totalAmount: number;
    totalPaid: number;
    balance: number;
    currency: string;
    currencySymbol: string;
  };
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    notes: string;
  }>;
}

interface PaymentReceiptProps {
  bookingId: string;
}

export function PaymentReceipt({ bookingId }: PaymentReceiptProps) {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReceipt();
  }, [bookingId]);

  const fetchReceipt = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/receipt`);

      if (!response.ok) {
        throw new Error('Failed to load receipt');
      }

      const data = await response.json();
      setReceipt(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    alert('PDF download functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">Loading receipt...</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">{error || 'Receipt not available'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Action Buttons (hidden when printing) */}
      <div className="p-4 border-b flex gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Receipt Content */}
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PAYMENT RECEIPT</h1>
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">PAID</span>
          </div>
          <p className="text-gray-600 mt-2">Receipt #{receipt.receiptNumber}</p>
          <p className="text-sm text-gray-500">
            {new Date(receipt.receiptDate).toLocaleDateString('en-NG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Business & Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">From:</h3>
            <p className="font-semibold text-lg">{receipt.business.name}</p>
            {receipt.business.email && <p className="text-gray-600">{receipt.business.email}</p>}
            {receipt.business.phone && <p className="text-gray-600">{receipt.business.phone}</p>}
            {receipt.business.address && <p className="text-gray-600">{receipt.business.address}</p>}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">To:</h3>
            <p className="font-semibold text-lg">{receipt.customer.name}</p>
            {receipt.customer.email && <p className="text-gray-600">{receipt.customer.email}</p>}
            {receipt.customer.phone && <p className="text-gray-600">{receipt.customer.phone}</p>}
            {receipt.customer.address && <p className="text-gray-600">{receipt.customer.address}</p>}
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Booking Reference</p>
              <p className="font-semibold">{receipt.booking.reference || receipt.booking.id.substring(0, 8)}</p>
            </div>
            <div>
              <p className="text-gray-600">Start Date</p>
              <p className="font-semibold">
                {new Date(receipt.booking.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">End Date</p>
              <p className="font-semibold">
                {new Date(receipt.booking.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-semibold capitalize">{receipt.booking.status.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Items:</h3>
          <table className="w-full">
            <thead className="border-b-2 border-gray-300">
              <tr className="text-left">
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Quantity</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-3">{item.name}</td>
                  <td className="py-3 text-right">{item.quantity} {item.unit}</td>
                  <td className="py-3 text-right">
                    {receipt.financial.currencySymbol}{item.price.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {receipt.financial.currencySymbol}{(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment History */}
        {receipt.payments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">Payment History:</h3>
            <div className="space-y-2">
              {receipt.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                  <div>
                    <p className="font-medium">
                      {new Date(payment.date).toLocaleDateString('en-NG')}
                    </p>
                    {payment.notes && <p className="text-sm text-gray-600">{payment.notes}</p>}
                  </div>
                  <p className="font-semibold text-green-600">
                    +{receipt.financial.currencySymbol}{payment.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="space-y-2 text-right">
            <div className="flex justify-between">
              <span className="font-semibold">Subtotal:</span>
              <span>{receipt.financial.currencySymbol}{receipt.financial.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-bold">Total Amount:</span>
              <span className="font-bold">
                {receipt.financial.currencySymbol}{receipt.financial.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-green-600">
              <span className="font-semibold">Total Paid:</span>
              <span className="font-semibold">
                {receipt.financial.currencySymbol}{receipt.financial.totalPaid.toLocaleString()}
              </span>
            </div>
            {receipt.financial.balance > 0 && (
              <div className="flex justify-between text-orange-600">
                <span className="font-semibold">Outstanding Balance:</span>
                <span className="font-semibold">
                  {receipt.financial.currencySymbol}{receipt.financial.balance.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>Thank you for your business!</p>
          <p className="mt-2">This is a computer-generated receipt and does not require a signature.</p>
        </div>
      </div>
    </div>
  );
}
