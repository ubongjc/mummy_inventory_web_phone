import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hashPassword } from "@/app/lib/auth";
import {
  applyRateLimit,
  RateLimitPresets,
  getClientIp,
  sanitizeString,
  sanitizeEmail,
  secureLog,
} from "@/app/lib/security";
import { sendEmailVerification } from "@/app/lib/email";
import { z } from "zod";
import crypto from "crypto";

const signUpSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(3, "Email must be at least 3 characters")
    .max(254, "Email must be 254 characters or less")
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be 100 characters or less")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less")
    .optional(),
  lastName: z
    .string()
    .max(50, "Last name must be 50 characters or less")
    .optional(),
  businessName: z
    .string()
    .max(25, "Business name must be 25 characters or less")
    .optional(),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting for authentication (strict)
  const rateLimitResult = await applyRateLimit(request, RateLimitPresets.AUTH);
  if (!rateLimitResult.success) {
    const clientIp = getClientIp(request);
    secureLog("[SECURITY] Sign-up rate limit exceeded", { ip: clientIp });
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validated = signUpSchema.parse(body);

    // Sanitize inputs
    const email = sanitizeEmail(validated.email);
    const firstName = validated.firstName
      ? sanitizeString(validated.firstName)
      : undefined;
    const lastName = validated.lastName
      ? sanitizeString(validated.lastName)
      : undefined;
    const businessName = validated.businessName
      ? sanitizeString(validated.businessName)
      : undefined;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      secureLog("[SECURITY] Duplicate email signup attempt", { email });
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Create user (free tier - no subscription needed)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        businessName,
        isPremium: false,
        emailVerified: false, // Explicitly set to false
        subscription: {
          create: {
            plan: "free",
            status: "active",
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
      },
    });

    secureLog("[AUTH] New user created", { userId: user.id, email: user.email });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Invalidate any existing unused verification tokens for this user
    await prisma.emailVerification.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Create email verification token
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        used: false,
      },
    });

    // Send verification email
    try {
      await sendEmailVerification(user.email, verificationToken);
      secureLog("[AUTH] Email verification sent", {
        userId: user.id,
        email: user.email,
      });
    } catch (emailError) {
      console.error("[AUTH] Failed to send verification email:", emailError);
      secureLog("[ERROR] Email verification failed", {
        userId: user.id,
        error: (emailError as Error).message,
      });
      // Still return success but log the error
      // User can request a new verification email later
    }

    return NextResponse.json(
      {
        message:
          "Account created successfully. Please check your email to verify your account.",
        user,
        emailSent: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    secureLog("[ERROR] Sign-up failed", { error: error.message });

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
