import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { createCustomerSchema } from "@/app/lib/validation";
import { secureLog } from "@/app/lib/security";
import { checkCustomerLimit } from "@/app/lib/limits";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    const customers = await prisma.customer.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" }
      ],
    });
    return NextResponse.json(customers);
  } catch (error: any) {
    secureLog("[ERROR] Failed to fetch customers", { error: error.message });
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createCustomerSchema.parse(body);

    // Check if user has reached their customer limit
    const limitCheck = await checkCustomerLimit(session.user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "Customer limit reached",
          details: limitCheck.message,
          current: limitCheck.current,
          limit: limitCheck.limit,
          planType: limitCheck.planType,
        },
        { status: 403 }
      );
    }

    // Create full name for backward compatibility
    const fullName = `${validated.firstName}${validated.lastName ? ' ' + validated.lastName : ''}`.trim();

    // Check for duplicate email for this user (if email is provided)
    if (validated.email) {
      const existingEmail = await prisma.customer.findFirst({
        where: {
          userId: session.user.id,
          email: validated.email,
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          {
            error: "Email already exists",
            details: `A customer with the email "${validated.email}" already exists. Please use a different email address.`,
          },
          { status: 409 } // Conflict status code
        );
      }
    }

    // Check for duplicate customer by full name for this user
    const existingCustomers = await prisma.customer.findMany({
      where: {
        userId: session.user.id,
        firstName: validated.firstName,
        ...(validated.lastName && { lastName: validated.lastName })
      }
    });

    if (existingCustomers.length > 0) {
      return NextResponse.json(
        {
          error: "Customer already exists",
          details: `A customer with the name "${fullName}" already exists. Please use a different name or add additional information.`
        },
        { status: 409 } // Conflict status code
      );
    }

    const customer = await prisma.customer.create({
      data: {
        ...validated,
        name: fullName, // Set name for backward compatibility
        userId: session.user.id, // Always set to current user
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    secureLog("[ERROR] Failed to create customer", { error: error.message });
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
