import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createCustomerSchema } from "@/app/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" }
      ],
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createCustomerSchema.parse(body);

    // Create full name for backward compatibility
    const fullName = `${validated.firstName}${validated.lastName ? ' ' + validated.lastName : ''}`.trim();

    // Check for duplicate customer by full name
    const existingCustomers = await prisma.customer.findMany({
      where: {
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
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error("Error creating customer:", error);
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
