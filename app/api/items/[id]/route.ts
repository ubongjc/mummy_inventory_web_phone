import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { updateItemSchema } from "@/app/lib/validation";
import { secureLog } from "@/app/lib/security";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateItemSchema.parse(body);

    // If totalQuantity is being updated, check that it's not below current reservations
    if (validated.totalQuantity !== undefined) {
      // Get current and future bookings using this item
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const overlappingBookings = await prisma.booking.findMany({
        where: {
          AND: [
            { endDate: { gte: now } },
            { status: { in: ["CONFIRMED", "OUT"] } },
          ],
        },
        include: {
          items: {
            where: { itemId: id },
          },
        },
      });

      const maxReserved = overlappingBookings.reduce(
        (max: number, booking: any) =>
          Math.max(
            max,
            booking.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
          ),
        0
      );

      if (validated.totalQuantity < maxReserved) {
        return NextResponse.json(
          {
            error: `Cannot reduce total quantity to ${validated.totalQuantity}. Currently ${maxReserved} units are reserved in active/future bookings. Please cancel or modify those bookings first.`,
            maxReserved,
            requestedQuantity: validated.totalQuantity,
          },
          { status: 409 }
        );
      }
    }

    const item = await prisma.item.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(item);
  } catch (error: any) {
    secureLog("[ERROR] Failed to update item", { error: error.message });
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update item" },
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

    // Check if item is used in any bookings
    const itemBookings = await prisma.bookingItem.count({
      where: { itemId: id }
    });

    if (itemBookings > 0) {
      return NextResponse.json(
        { error: `Cannot delete item that is used in ${itemBookings} booking${itemBookings > 1 ? 's' : ''}. Delete or modify the bookings first.` },
        { status: 400 }
      );
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    secureLog("[ERROR] Failed to delete item", { error: error.message });
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}
