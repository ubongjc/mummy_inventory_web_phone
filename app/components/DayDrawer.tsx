"use client";

import { useEffect, useState } from "react";
import { X, Edit2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import EditRentalModal from "./EditRentalModal";
import { useSettings } from "@/app/hooks/useSettings";

interface DayDrawerProps {
  date: Date | null;
  isOpen: boolean;
  onClose: () => void;
  selectedItemIds: string[];
  onDataChange?: () => void;
}

interface RentalItem {
  id: string;
  itemId: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    unit: string;
  };
}

interface Rental {
  id: string;
  customerId: string;
  customer: {
    id: string;
    name: string; // For backward compatibility
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  color?: string;
  notes?: string;
  totalPrice?: number;
  advancePayment?: number;
  paymentDueDate?: string;
  items: RentalItem[];
  payments?: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    notes?: string;
  }>;
}

const STATUS_OPTIONS = [
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "OUT", label: "Out" },
  { value: "RETURNED", label: "Returned" },
  { value: "CANCELLED", label: "Cancelled" },
];

interface ItemAvailability {
  id: string;
  name: string;
  total: number;
  reserved: number;
  remaining: number;
  unit: string;
}

export default function DayDrawer({ date, isOpen, onClose, selectedItemIds, onDataChange }: DayDrawerProps) {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [itemAvailability, setItemAvailability] = useState<ItemAvailability[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const { formatCurrency } = useSettings();

  // Format date without timezone conversion
  const formatDate = (dateString: string, includeYear = false) => {
    const datePart = dateString.split('T')[0]; // "2025-11-06"
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formatted = `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`;
    return includeYear ? `${formatted}, ${date.getUTCFullYear()}` : formatted;
  };

  useEffect(() => {
    if (isOpen && date) {
      fetchDayData();
    }
  }, [isOpen, date, selectedItemIds]);

  // Add escape key handler to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const fetchDayData = async () => {
    if (!date) return;

    setLoading(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const response = await fetch(`/api/day?date=${dateStr}`);

      if (!response.ok) {
        throw new Error("Failed to fetch day data");
      }

      const data = await response.json();

      // Filter rentals by selected items
      // If no items selected, show no rentals
      let filteredRentals = data.rentals || [];
      if (selectedItemIds.length === 0) {
        filteredRentals = [];
      } else {
        filteredRentals = filteredRentals.filter((rental: Rental) =>
          rental.items.some((item) => selectedItemIds.includes(item.itemId))
        );
      }

      setRentals(filteredRentals);
      setItemAvailability(data.itemAvailability || []);
    } catch (error) {
      console.error("Error fetching day data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRental = (rental: Rental) => {
    setSelectedRental(rental);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchDayData(); // Refresh the data
  };

  const handleUpdateRentalStatus = async (rentalId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/rentals/${rentalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rental status");
      }

      // Refresh the data
      fetchDayData();
    } catch (error) {
      console.error("Error updating rental status:", error);
      alert("Failed to update rental status");
    }
  };

  const handleUpdateRentalColor = async (rentalId: string, newColor: string) => {
    try {
      const response = await fetch(`/api/rentals/${rentalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ color: newColor }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rental color");
      }

      // Refresh the data
      fetchDayData();
      // Notify parent component to refresh calendar
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error("Error updating rental color:", error);
      alert("Failed to update rental color");
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "OUT":
        return "bg-red-100 text-red-800";
      case "RETURNED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 xl:w-1/3 bg-gradient-to-br from-white to-gray-50 shadow-2xl z-50 overflow-y-auto border-l-4 border-blue-500">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">
              {date ? format(date, "MMMM dd, yyyy") : ""}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-black font-bold text-lg">Loading...</div>
            </div>
          ) : (
            <>
              {/* Rentals Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-black mb-4">
                  Active Rentals ({rentals.length})
                </h3>

                {rentals.length === 0 ? (
                  <p className="text-black text-sm font-semibold">
                    No rentals for this date
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {rentals.map((rental) => (
                      <div
                        key={rental.id}
                        className="border border-gray-300 rounded-lg p-2.5 hover:shadow-md hover:border-blue-400 transition-all bg-white relative overflow-hidden"
                      >
                        {/* Color indicator stripe */}
                        {rental.color && (
                          <div
                            className="absolute top-0 left-0 w-1 h-full"
                            style={{ backgroundColor: rental.color }}
                          />
                        )}

                        <div className="flex items-start justify-between mb-1.5 pl-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-black text-sm mb-0.5">
                              {rental.customer.firstName || rental.customer.name} {rental.customer.lastName || ""}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-black font-medium">
                              <span>
                                {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                              </span>
                              {rental.customer.phone && (
                                <span className="text-gray-600">• {rental.customer.phone}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <input
                              type="color"
                              value={rental.color || "#3b82f6"}
                              onChange={(e) => handleUpdateRentalColor(rental.id, e.target.value)}
                              className="w-7 h-7 border border-gray-300 rounded cursor-pointer hover:border-blue-500 transition-colors"
                              title="Change rental color"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={() => handleEditRental(rental)}
                              className="px-2 py-1 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded transition-colors"
                            >
                              EDIT
                            </button>
                            <select
                              value={rental.status}
                              onChange={(e) => handleUpdateRentalStatus(rental.id, e.target.value)}
                              className={`px-2 py-1 rounded text-xs font-bold border cursor-pointer min-w-[100px] ${getStatusColor(
                                rental.status
                              )}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded p-1.5 pl-3.5 text-xs">
                          {rental.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-black font-semibold flex justify-between py-0.5"
                            >
                              <span>{item.item.name}</span>
                              <span className="font-medium text-gray-700">
                                ×{item.quantity} {item.item.unit}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Payment Information */}
                        {rental.totalPrice && (
                          <div className="mt-2 bg-purple-50 border border-purple-200 rounded p-1.5 pl-3.5 text-xs">
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-black font-bold">
                                <span>Total Amount:</span>
                                <span className="text-purple-900">{formatCurrency(rental.totalPrice)}</span>
                              </div>
                              <div className="flex justify-between text-black font-bold">
                                <span>Amount Due:</span>
                                <span className="text-red-700">
                                  {formatCurrency(
                                    rental.totalPrice -
                                    (rental.advancePayment || 0) -
                                    (rental.payments?.reduce((sum, p) => sum + p.amount, 0) || 0)
                                  )}
                                </span>
                              </div>
                              {rental.paymentDueDate && (
                                <div className="text-gray-600 text-[10px] pt-0.5">
                                  Due: {formatDate(rental.paymentDueDate, true)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Item Availability Section */}
              <div>
                <h3 className="text-lg font-bold text-black mb-4">
                  Item Availability for {date ? format(date, "MMMM d, yyyy") : ""}
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y-2 divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r-2 border-gray-300">
                          Item
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-black uppercase tracking-wider border-r-2 border-gray-300">
                          Total
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-black uppercase tracking-wider border-r-2 border-gray-300">
                          Booked
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-black uppercase tracking-wider min-w-[100px]">
                          Remaining
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {itemAvailability.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-3 text-sm font-bold text-black border-r border-gray-200">
                            {item.name}
                          </td>
                          <td className="px-3 py-3 text-sm text-center text-black font-semibold border-r border-gray-200">
                            {item.total}
                          </td>
                          <td className="px-3 py-3 text-sm text-center text-black font-semibold border-r border-gray-200">
                            {item.reserved}
                          </td>
                          <td
                            className={`px-3 py-3 text-sm text-center font-semibold min-w-[100px] ${
                              item.remaining === 0
                                ? "text-red-600"
                                : item.remaining < 5
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {item.remaining}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Rental Modal */}
      <EditRentalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        rental={selectedRental}
      />
    </>
  );
}
