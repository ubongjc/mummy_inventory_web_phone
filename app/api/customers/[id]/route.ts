import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { updateCustomerSchema } from "@/app/lib/validation";
import { secureLog } from "@/app/lib/security";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify customer belongs to user (unless admin)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (!isAdmin && existingCustomer.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateCustomerSchema.parse(body);

    // If firstName or lastName are being updated, also update the name field
    const dataToUpdate = { ...validated };
    if (validated.firstName !== undefined || validated.lastName !== undefined) {
      // Get current customer data if we need to combine with existing values
      const currentCustomer = await prisma.customer.findUnique({ where: { id } });
      if (currentCustomer) {
        const newFirstName = validated.firstName !== undefined ? validated.firstName : currentCustomer.firstName;
        const newLastName = validated.lastName !== undefined ? validated.lastName : currentCustomer.lastName;
        dataToUpdate.name = `${newFirstName || ''}${newLastName ? ' ' + newLastName : ''}`.trim();
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    secureLog("[ERROR] Failed to update customer", { error: error.message });
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify customer belongs to user (unless admin)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (!isAdmin && existingCustomer.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if customer has bookings
    const customerBookings = await prisma.booking.count({
      where: { customerId: id }
    });

    if (customerBookings > 0) {
      return NextResponse.json(
        { error: `Cannot delete customer with ${customerBookings} existing booking${customerBookings > 1 ? 's' : ''}. Delete the bookings first.` },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    secureLog("[ERROR] Failed to delete customer", { error: error.message });
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete customer" },
      { status: 500 }
    );
  }
}
