"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toTitleCase } from "@/app/lib/validation";
import { useSettings } from "@/app/hooks/useSettings";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NOTES_CHAR_LIMIT = 50;

export default function AddItemModal({
  isOpen,
  onClose,
  onSuccess,
}: AddItemModalProps) {
  const { settings } = useSettings();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unitError, setUnitError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [priceError, setPriceError] = useState("");

  const validatePrice = (value: string): boolean => {
    if (!value) return true; // Optional field

    // Check if it matches price format with up to 2 decimal places
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    return priceRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear all errors
    setError("");
    setUnitError("");
    setQuantityError("");
    setPriceError("");

    // Validate unit (must be alphabetic)
    if (/\d/.test(unit)) {
      setUnitError("The unit must be alphabetic");
      return;
    }

    // Validate quantity (must be a valid number)
    const quantityNum = parseInt(totalQuantity);
    if (isNaN(quantityNum) || totalQuantity === "" || quantityNum < 1) {
      setQuantityError("Please enter a valid quantity");
      setTotalQuantity("");
      return;
    }

    // Validate price format
    if (price && !validatePrice(price)) {
      setPriceError("Price must have at most two decimal places");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: toTitleCase(name),
          unit,
          totalQuantity: quantityNum,
          price: price ? parseFloat(price) : undefined,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to create item" }));
        throw new Error(errorData.error || "Failed to create item");
      }

      // Reset form
      setName("");
      setUnit("pcs");
      setTotalQuantity("");
      setPrice("");
      setNotes("");

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 transform transition-all">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-bold text-black">Add New Item</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {error && (
              <div className="bg-red-50 text-red-600 p-2 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-1 text-black">
                Item Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-base"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1 text-black">
                  Unit *
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value.toLowerCase());
                    setUnitError("");
                  }}
                  onKeyPress={(e) => {
                    // Prevent numbers and uppercase letters from being typed
                    if (/[0-9A-Z]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full px-3 py-2 border-2 ${
                    unitError ? "border-red-500" : "border-gray-400"
                  } rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-base`}
                  required
                />
                {unitError && (
                  <p className="text-red-600 text-xs mt-1">{unitError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-black">
                  Total Quantity *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={totalQuantity}
                  onChange={(e) => {
                    setTotalQuantity(e.target.value);
                    setQuantityError("");
                  }}
                  onKeyPress={(e) => {
                    // Only allow numbers
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full px-3 py-2 border-2 ${
                    quantityError ? "border-red-500" : "border-gray-400"
                  } rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-base`}
                  required
                  min="1"
                />
                {quantityError && (
                  <p className="text-red-600 text-xs mt-1">{quantityError}</p>
                )}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <label className="block text-sm font-bold mb-2 text-green-800">
                Price (optional)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-11 px-3 bg-white border-2 border-gray-400 rounded-l">
                  <span className="text-green-600 font-bold text-lg">
                    {settings?.currencySymbol || "₦"}
                  </span>
                </div>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setPriceError("");
                  }}
                  className={`flex-1 h-11 px-3 border-2 ${
                    priceError ? "border-red-500" : "border-gray-400"
                  } rounded-r focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-base`}
                  placeholder="0.00"
                />
              </div>
              {priceError && (
                <p className="text-red-600 text-xs mt-1">{priceError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-black">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => {
                  if (e.target.value.length <= NOTES_CHAR_LIMIT) {
                    setNotes(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border-2 border-gray-400 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-base"
                rows={2}
              />
              <p className="text-xs text-gray-600 mt-1">
                {NOTES_CHAR_LIMIT - notes.length} characters remaining
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
