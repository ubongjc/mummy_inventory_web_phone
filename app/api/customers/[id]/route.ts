import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { updateCustomerSchema } from "@/app/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateCustomerSchema.parse(body);

    // If firstName or lastName are being updated, also update the name field
    let dataToUpdate = { ...validated };
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
    console.error("Error updating customer:", error);
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
    const { id } = await params;

    // Check if customer has bookings
    const customerBookings = await prisma.rental.count({
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
    console.error("Error deleting customer:", error);
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
