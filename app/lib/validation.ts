import { z } from "zod";
import {
  normalizeText,
  toTitleCase,
  normalizePhone,
  normalizeEmail,
  normalizeUnit,
  normalizeItemName,
  roundToTwoDecimals,
  normalizeHexColor,
} from "./normalization";

export const createItemSchema = z.object({
  name: z.string()
    .min(2, "Item name must be at least 2 characters")
    .max(50, "Item name must be 50 characters or less")
    .transform(normalizeItemName),
  unit: z.string()
    .min(2, "Unit must be at least 2 characters")
    .max(16, "Unit must be 16 characters or less")
    .regex(/^[a-zA-Z\s]+$/, "Unit must contain only letters and spaces")
    .transform(normalizeUnit),
  totalQuantity: z.number()
    .int("Total quantity must be a whole number")
    .min(0, "Total quantity must be non-negative")
    .max(100000, "Total quantity cannot exceed 100,000"),
  price: z.number()
    .min(0, "Price must be non-negative")
    .max(1000000, "Price cannot exceed 1,000,000")
    .transform(roundToTwoDecimals)
    .optional(),
  notes: z.string()
    .max(50, "Notes must be 50 characters or less")
    .transform(normalizeText)
    .optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const createCustomerSchema = z.object({
  name: z.string().optional(), // Keep for backward compatibility
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
    .transform(toTitleCase),
  lastName: z.string()
    .max(50, "Last name must be 50 characters or less")
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]*$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
    .transform((val) => val ? toTitleCase(val) : val)
    .optional()
    .nullable(),
  phone: z.string()
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must be 15 characters or less")
    .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number format (E.164)")
    .transform(normalizePhone)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  email: z.string()
    .min(3, "Email must be at least 3 characters")
    .max(254, "Email must be 254 characters or less")
    .email("Invalid email address")
    .transform(normalizeEmail)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  address: z.string()
    .max(200, "Address must be 200 characters or less")
    .transform(normalizeText)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  notes: z.string()
    .max(50, "Notes must be 50 characters or less")
    .transform(normalizeText)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const bookingItemSchema = z.object({
  itemId: z.string().cuid("Invalid item ID"),
  quantity: z.number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(100000, "Quantity cannot exceed 100,000"),
});

export const initialPaymentSchema = z.object({
  amount: z.number()
    .min(0.01, "Payment amount must be at least 0.01")
    .max(10000000, "Payment amount cannot exceed 10,000,000")
    .transform(roundToTwoDecimals),
  paymentDate: z.string().or(z.date()),
  notes: z.string()
    .max(100, "Payment notes must be 100 characters or less")
    .transform(normalizeText)
    .optional(),
});

// Base booking schema without validation refinements
const baseBookingSchema = z.object({
  customerId: z.string().cuid("Invalid customer ID"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z.enum(["CONFIRMED", "OUT", "RETURNED", "CANCELLED"]).optional(),
  reference: z.string()
    .regex(/^BKG-\d{6}$/, "Reference must be in format BKG-000000")
    .length(10, "Reference must be exactly 10 characters")
    .optional(),
  notes: z.string()
    .max(50, "Booking notes must be 50 characters or less")
    .transform(normalizeText)
    .optional(),
  items: z.array(bookingItemSchema).min(1, "At least one item is required"),
  totalPrice: z.number()
    .min(0, "Total price must be non-negative")
    .max(10000000, "Total price cannot exceed 10,000,000")
    .transform(roundToTwoDecimals)
    .optional(),
  advancePayment: z.number()
    .min(0, "Advance payment must be non-negative")
    .max(10000000, "Advance payment cannot exceed 10,000,000")
    .transform(roundToTwoDecimals)
    .optional(),
  paymentDueDate: z.string().or(z.date()).optional(),
  initialPayments: z.array(initialPaymentSchema).optional(),
  color: z.string()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Color must be a valid hex code (#RGB or #RRGGBB)")
    .optional(),
});

// Create booking schema with date validation
export const createBookingSchema = baseBookingSchema
  .refine(
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
  )
  .refine(
    (data) => {
      // Ensure advance payment doesn't exceed total price
      if (data.advancePayment && data.totalPrice) {
        return data.advancePayment <= data.totalPrice;
      }
      return true;
    },
    {
      message: "Advance payment cannot exceed total price",
      path: ["advancePayment"],
    }
  );

// Update booking schema (partial fields, validation applied on server)
export const updateBookingSchema = baseBookingSchema.partial();

export const updateBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "OUT", "RETURNED", "CANCELLED"]),
});

// Settings validation schema
export const updateSettingsSchema = z.object({
  businessName: z.string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be 100 characters or less")
    .transform(normalizeText)
    .optional(),
  currency: z.string()
    .length(3, "Currency code must be exactly 3 characters")
    .regex(/^[A-Z]{3}$/, "Currency code must be uppercase (e.g., USD, EUR, NGN)")
    .optional(),
  currencySymbol: z.string()
    .max(5, "Currency symbol must be 5 characters or less")
    .optional(),
  businessPhone: z.string()
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must be 15 characters or less")
    .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number format (E.164)")
    .transform(normalizePhone)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  businessEmail: z.string()
    .min(3, "Email must be at least 3 characters")
    .max(254, "Email must be 254 characters or less")
    .email("Invalid email address")
    .transform(normalizeEmail)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  businessAddress: z.string()
    .max(100, "Business address must be 100 characters or less")
    .transform(normalizeText)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  taxRate: z.number()
    .min(0, "Tax rate must be non-negative")
    .max(100, "Tax rate cannot exceed 100%")
    .transform(roundToTwoDecimals)
    .optional()
    .nullable(),
  lowStockThreshold: z.number()
    .int("Low stock threshold must be a whole number")
    .min(0, "Low stock threshold must be non-negative")
    .max(100000, "Low stock threshold cannot exceed 100,000")
    .optional(),
  defaultRentalDays: z.number()
    .int("Default rental days must be a whole number")
    .min(1, "Default rental days must be at least 1")
    .max(365, "Default rental days cannot exceed 365")
    .optional(),
  dateFormat: z.string().optional(),
  timezone: z.string()
    .max(64, "Timezone must be 64 characters or less")
    .optional(),
}).partial();

// Re-export toTitleCase for backward compatibility
export { toTitleCase } from "./normalization";
