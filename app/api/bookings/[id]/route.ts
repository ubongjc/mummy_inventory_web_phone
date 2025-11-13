import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { toUTCMidnight } from "@/app/lib/dates";
import { secureLog } from "@/app/lib/security";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete the booking and all associated booking items and payments (cascade delete)
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    secureLog("[ERROR] Failed to delete booking", { error: error.message });
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete booking" },
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

    // Build update data object with only provided fields
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.color !== undefined) updateData.color = body.color;

    const booking = await prisma.booking.update({
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

    return NextResponse.json(booking);
  } catch (error: any) {
    secureLog("[ERROR] Failed to update booking (PATCH)", { error: error.message });
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();

    const startDate = toUTCMidnight(body.startDate);
    const endDate = toUTCMidnight(body.endDate);

    // Check availability for each item (excluding current booking)
    for (const bookingItem of body.items) {
      const item = await prisma.item.findUnique({
        where: { id: bookingItem.itemId },
      });

      if (!item) {
        return NextResponse.json(
          { error: `Item ${bookingItem.itemId} not found` },
          { status: 404 }
        );
      }

      // Get overlapping bookings (excluding the current booking being edited)
      const overlappingBookings = await prisma.booking.findMany({
        where: {
          AND: [
            { id: { not: bookingId } },
            { startDate: { lte: endDate } },
            { endDate: { gte: startDate } },
            { status: { in: ["CONFIRMED", "OUT"] } },
          ],
        },
        include: {
          items: {
            where: {
              itemId: bookingItem.itemId,
            },
          },
        },
      });

      // Check availability day-by-day
      const currentDate = new Date(startDate);
      const endDateCheck = new Date(endDate);

      while (currentDate <= endDateCheck) {
        // Calculate reserved quantity on this specific day
        const reservedOnDay = overlappingBookings.reduce((sum: number, booking: any) => {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);

          // Check if this booking overlaps with current day
          if (currentDate >= bookingStart && currentDate <= bookingEnd) {
            return sum + booking.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
          }
          return sum;
        }, 0);

        const availableOnDay = item.totalQuantity - reservedOnDay;

        if (availableOnDay < bookingItem.quantity) {
          return NextResponse.json(
            {
              error: "Insufficient availability",
              itemName: item.name,
              date: currentDate.toISOString().split('T')[0],
              requested: bookingItem.quantity,
              available: availableOnDay,
              reserved: reservedOnDay,
              total: item.totalQuantity,
            },
            { status: 409 }
          );
        }

        // Move to next day
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
    }

    // Delete existing booking items
    await prisma.bookingItem.deleteMany({
      where: { bookingId: bookingId },
    });

    // Update booking with new data
    const booking = await prisma.booking.update({
      where: { id: bookingId },
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

    return NextResponse.json(booking);
  } catch (error: any) {
    secureLog("[ERROR] Failed to update booking (PUT)", { error: error.message });
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
