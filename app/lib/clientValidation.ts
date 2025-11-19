import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

// Sanitize function for XSS protection
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

// Phone validation regex (E.164 format)
export const phoneRegex = /^\+?[1-9]\d{7,14}$/;

// Email validation regex
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Name validation regex (letters, spaces, hyphens, apostrophes)
export const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

// Shared validation schemas
export const firstNameValidation = z
  .string()
  .min(2, "First name must be at least 2 characters")
  .max(50, "First name must be less than 50 characters")
  .regex(nameRegex, "First name can only contain letters, spaces, hyphens, and apostrophes")
  .transform(sanitizeInput);

export const lastNameValidation = z
  .string()
  .max(50, "Last name must be less than 50 characters")
  .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]*$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
  .transform((val) => (val ? sanitizeInput(val) : ""))
  .catch("");

export const emailValidation = z
  .string()
  .min(3, "Email must be at least 3 characters")
  .max(254, "Email must be less than 254 characters")
  .regex(emailRegex, "Please enter a valid email address")
  .transform(sanitizeInput);

export const phoneValidation = z
  .string()
  .min(8, "Phone number must be at least 8 digits")
  .max(15, "Phone number must be less than 15 digits")
  .regex(phoneRegex, "Please enter a valid phone number (e.g., +1234567890)")
  .optional()
  .or(z.literal(""))
  .transform((val) => (val ? sanitizeInput(val) : ""));

export const addressValidation = z
  .string()
  .max(200, "Address must be less than 200 characters")
  .optional()
  .or(z.literal(""))
  .transform((val) => (val ? sanitizeInput(val) : ""));

// Password validation - match server requirements
export const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be 100 characters or less")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

// Sign-up form schema
export const signUpFormSchema = z
  .object({
    firstName: firstNameValidation,
    lastName: z
      .string()
      .max(50, "Last name must be less than 50 characters")
      .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]*$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
      .transform((val) => (val ? sanitizeInput(val) : "")),
    businessName: z
      .string()
      .max(25, "Business name must be less than 25 characters")
      .transform((val) => (val ? sanitizeInput(val) : "")),
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// New customer form schema (for booking modal)
export const newCustomerFormSchema = z.object({
  firstName: firstNameValidation,
  lastName: lastNameValidation,
  phone: phoneValidation,
  email: z
    .string()
    .regex(emailRegex, "Please enter a valid email address")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? sanitizeInput(val) : "")),
  address: addressValidation,
});

// Password strength calculator (lenient for non-tech users)
export const calculatePasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;

  // Length scoring
  if (password.length >= 7) {
    score++;
  }
  if (password.length >= 10) {
    score++;
  }
  if (password.length >= 12) {
    score++;
  }

  // Character variety (optional bonuses)
  if (/[a-z]/.test(password)) {
    score++;
  }
  if (/[A-Z]/.test(password)) {
    score++;
  }
  if (/\d/.test(password)) {
    score++;
  }

  // Simple classification
  if (score <= 2) {
    return { score, label: "Weak", color: "yellow" };
  }
  if (score <= 4) {
    return { score, label: "Good", color: "green" };
  }
  return { score, label: "Strong", color: "green" };
};

// Validation for business settings
export const businessPhoneValidation = z
  .string()
  .min(8, "Phone number must be at least 8 digits")
  .max(15, "Phone number must be less than 15 digits")
  .regex(phoneRegex, "Please enter a valid phone number (e.g., +2341234567890 or +11234567890)")
  .optional()
  .or(z.literal(""))
  .transform((val) => (val ? sanitizeInput(val) : ""));

export const businessEmailValidation = z
  .string()
  .min(3, "Email must be at least 3 characters")
  .max(254, "Email must be less than 254 characters")
  .regex(emailRegex, "Please enter a valid email address (e.g., business@example.com)")
  .optional()
  .or(z.literal(""))
  .transform((val) => (val ? sanitizeInput(val) : ""));
