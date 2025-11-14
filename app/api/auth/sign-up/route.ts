import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hashPassword } from "@/app/lib/auth";
import {
  rateLimit,
  getClientIp,
  sanitizeString,
  sanitizeEmail,
  secureLog,
} from "@/app/lib/security";
import { z } from "zod";

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
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 signups per hour per IP
    const clientIp = getClientIp(request);
    if (
      !rateLimit(`signup:${clientIp}`, {
        maxRequests: 5,
        windowMs: 60 * 60 * 1000, // 1 hour
      })
    ) {
      secureLog("[SECURITY] Sign-up rate limit exceeded", { ip: clientIp });
      return NextResponse.json(
        {
          error:
            "Too many signup attempts. Please try again in an hour.",
        },
        { status: 429 }
      );
    }

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

    // Create user with free subscription
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
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
      },
    });

    secureLog("[AUTH] New user created", { userId: user.id, email: user.email });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
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
