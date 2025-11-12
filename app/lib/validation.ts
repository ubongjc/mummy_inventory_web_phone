import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unit: z.string().min(1, "Unit is required").max(10, "Unit must be 10 characters or less").regex(/^[A-Za-z\s]+$/, "Unit must contain only letters"),
  totalQuantity: z.number().int().min(0, "Total quantity must be non-negative"),
  price: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const createCustomerSchema = z.object({
  name: z.string().optional(), // Keep for backward compatibility
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const rentalItemSchema = z.object({
  itemId: z.string().cuid(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const initialPaymentSchema = z.object({
  amount: z.number().min(0, "Payment amount must be non-negative"),
  paymentDate: z.string().or(z.date()),
  notes: z.string().optional(),
});

export const createRentalSchema = z.object({
  customerId: z.string().cuid(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z.enum(["DRAFT", "CONFIRMED", "OUT", "RETURNED", "CANCELLED"]).optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(rentalItemSchema).min(1, "At least one item is required"),
  totalPrice: z.number().min(0).optional(),
  advancePayment: z.number().min(0).optional(),
  paymentDueDate: z.string().or(z.date()).optional(),
  initialPayments: z.array(initialPaymentSchema).optional(),
}).refine(
  (data) => {
    // Parse dates and ensure endDate >= startDate
    const start = typeof data.startDate === 'string'
      ? new Date(data.startDate)
      : data.startDate;
    const end = typeof data.endDate === 'string'
      ? new Date(data.endDate)
      : data.endDate;

    return end >= start;
  },
  {
    message: "Return date cannot be before start date",
    path: ["endDate"],
  }
);

export const updateRentalSchema = createRentalSchema.partial();

export const updateRentalStatusSchema = z.object({
  status: z.enum(["DRAFT", "CONFIRMED", "OUT", "RETURNED", "CANCELLED"]),
});

// Utility function to convert string to title case
export function toTitleCase(str: string): string {
  if (!str) return str;

  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
