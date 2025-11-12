import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { toUTCMidnight } from "@/app/lib/dates";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete the rental and all associated rental items and payments (cascade delete)
    await prisma.rental.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting rental:", error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete rental" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Reject Draft status
    if (body.status === "DRAFT") {
      return NextResponse.json(
        { error: "Draft status is not allowed" },
        { status: 400 }
      );
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.color !== undefined) updateData.color = body.color;

    const rental = await prisma.rental.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    return NextResponse.json(rental);
  } catch (error: any) {
    console.error("Error updating rental:", error);
    return NextResponse.json(
      { error: "Failed to update rental" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rentalId } = await params;
    const body = await request.json();

    // Reject Draft status
    if (body.status === "DRAFT") {
      return NextResponse.json(
        { error: "Draft status is not allowed" },
        { status: 400 }
      );
    }

    const startDate = toUTCMidnight(body.startDate);
    const endDate = toUTCMidnight(body.endDate);

    // Check availability for each item (excluding current rental)
    for (const rentalItem of body.items) {
      const item = await prisma.item.findUnique({
        where: { id: rentalItem.itemId },
      });

      if (!item) {
        return NextResponse.json(
          { error: `Item ${rentalItem.itemId} not found` },
          { status: 404 }
        );
      }

      // Get overlapping rentals (excluding the current rental being edited)
      const overlappingRentals = await prisma.rental.findMany({
        where: {
          AND: [
            { id: { not: rentalId } },
            { startDate: { lte: endDate } },
            { endDate: { gte: startDate } },
            { status: { in: ["CONFIRMED", "OUT"] } },
          ],
        },
        include: {
          items: {
            where: {
              itemId: rentalItem.itemId,
            },
          },
        },
      });

      const reserved = overlappingRentals.reduce(
        (sum, rental) =>
          sum +
          rental.items.reduce(
            (itemSum, item) => itemSum + item.quantity,
            0
          ),
        0
      );

      const available = item.totalQuantity - reserved;

      if (available < rentalItem.quantity) {
        return NextResponse.json(
          {
            error: "Insufficient availability",
            itemName: item.name,
            requested: rentalItem.quantity,
            available,
            total: item.totalQuantity,
          },
          { status: 409 }
        );
      }
    }

    // Delete existing rental items
    await prisma.rentalItem.deleteMany({
      where: { rentalId },
    });

    // Update rental with new data
    const rental = await prisma.rental.update({
      where: { id: rentalId },
      data: {
        customerId: body.customerId,
        startDate,
        endDate,
        status: body.status,
        notes: body.notes,
        totalPrice: body.totalPrice,
        advancePayment: body.advancePayment,
        paymentDueDate: body.paymentDueDate ? toUTCMidnight(body.paymentDueDate) : null,
        items: {
          create: body.items.map((item: any) => ({
            itemId: item.itemId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    return NextResponse.json(rental);
  } catch (error: any) {
    console.error("Error updating rental:", error);
    return NextResponse.json(
      { error: "Failed to update rental" },
      { status: 500 }
    );
  }
}
