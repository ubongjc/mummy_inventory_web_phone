"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { toTitleCase } from "@/app/lib/validation";
import { useSettings } from "@/app/hooks/useSettings";
import { AppInput } from "@/app/components/ui/AppInput";
import { AppTextarea } from "@/app/components/ui/AppTextarea";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NOTES_CHAR_LIMIT = 50;

// Zod schema for form validation
const ItemFormSchema = z.object({
  name: z
    .string()
    .min(2, "*Item name must be at least 2 characters")
    .max(50, "*Item name must be 50 characters or less"),
  unit: z
    .string()
    .min(2, "*Unit must be at least 2 characters")
    .max(16, "*Unit must be 16 characters or less")
    .regex(/^[a-z\s]+$/, "*Enter letters only (no numbers)"),
  totalQuantity: z
    .string()
    .min(1, "*Enter a numeric quantity")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "*Quantity must be 0 or greater",
    })
    .refine((val) => !isNaN(Number(val)) && Number(val) <= 100000, {
      message: "*Quantity cannot exceed 100,000",
    }),
  price: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && /^\d+(\.\d{1,2})?$/.test(val) && num <= 1000000;
      },
      { message: "*Price must be valid (max 2 decimals, max 1,000,000)" }
    ),
  notes: z.string().max(NOTES_CHAR_LIMIT, "*Maximum 50 characters").optional(),
});

type ItemFormValues = z.infer<typeof ItemFormSchema>;

export default function AddItemModal({
  isOpen,
  onClose,
  onSuccess,
}: AddItemModalProps) {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setFocus,
  } = useForm<ItemFormValues>({
    resolver: zodResolver(ItemFormSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues: {
      name: "",
      unit: "pcs",
      totalQuantity: "",
      price: "",
      notes: "",
    },
  });

  const notesValue = watch("notes") || "";

  const onSubmit = async (data: ItemFormValues) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: toTitleCase(data.name),
          unit: data.unit,
          totalQuantity: parseInt(data.totalQuantity),
          price: data.price ? parseFloat(data.price) : undefined,
          notes: data.notes || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to create item" }));
        throw new Error(errorData.error || "Failed to create item");
      }

      // Reset form
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = () => {
    // Focus on first error for accessibility
    const firstError = Object.keys(errors)[0] as keyof ItemFormValues | undefined;
    if (firstError) setFocus(firstError);
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

          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="p-4 space-y-3"
          >
            {error && (
              <div className="bg-red-50 text-red-600 p-2 rounded text-sm">
                {error}
              </div>
            )}

            <AppInput
              label="Item Name"
              requiredMark
              {...register("name")}
              error={errors.name?.message}
            />

            <div className="grid grid-cols-2 gap-3">
              <AppInput
                label="Unit"
                requiredMark
                {...register("unit", {
                  onChange: (e) => {
                    e.target.value = e.target.value.toLowerCase();
                  },
                })}
                onKeyPress={(e) => {
                  // Prevent numbers and uppercase letters from being typed
                  if (/[0-9A-Z]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                error={errors.unit?.message}
              />

              <AppInput
                label="Total Quantity"
                requiredMark
                type="text"
                inputMode="numeric"
                {...register("totalQuantity")}
                onKeyPress={(e) => {
                  // Only allow numbers
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                error={errors.totalQuantity?.message}
              />
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
                  {...register("price")}
                  className={`flex-1 h-11 px-3 border-2 ${
                    errors.price
                      ? "border-red-500 ring-2 ring-red-500/40 focus:ring-red-500"
                      : "border-gray-400 focus:ring-2 focus:ring-blue-500"
                  } rounded-r focus:outline-none text-black font-semibold text-base transition`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>

            <AppTextarea
              label="Notes (optional)"
              {...register("notes")}
              rows={2}
              maxLength={NOTES_CHAR_LIMIT}
              showCharCount
              currentLength={notesValue.length}
              error={errors.notes?.message}
            />

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
