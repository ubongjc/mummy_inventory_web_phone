import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { toUTCMidnight } from "@/app/lib/dates";
import { secureLog } from "@/app/lib/security";

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

    // Verify booking belongs to user (unless admin)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!isAdmin && existingBooking.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify booking belongs to user (unless admin)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!isAdmin && existingBooking.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Build update data object with only provided fields
    const updateData: any = {};
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.color !== undefined) {
      updateData.color = body.color;
    }

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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Verify booking belongs to user (unless admin)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true }
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!isAdmin && existingBooking.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const startDate = toUTCMidnight(body.startDate);
    const endDate = toUTCMidnight(body.endDate);

    // Check if free user is trying to book more than 2 calendar months in the future
    const userWithSubscription = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    });

    const planType = userWithSubscription?.subscription?.plan || 'free';

    if (planType === 'free') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      // Calculate the last day of 2 months from now
      const maxYear = currentMonth + 2 >= 12 ? currentYear + 1 : currentYear;
      const maxMonth = (currentMonth + 2) % 12;
      const maxAllowedDate = new Date(maxYear, maxMonth + 1, 0, 23, 59, 59, 999); // Last day of the max month

      if (endDate > maxAllowedDate) {
        const maxDateStr = maxAllowedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return NextResponse.json(
          {
            error: "Booking date exceeds free plan limit",
            details: `Free users can only book up to 2 months in advance (through ${maxDateStr}). Upgrade to Premium for unlimited booking dates.`,
            maxDate: maxAllowedDate.toISOString().split('T')[0],
          },
          { status: 403 }
        );
      }
    }

    // Verify customer belongs to current user
    const customer = await prisma.customer.findUnique({
      where: { id: body.customerId },
      select: { userId: true }
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    if (customer.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Customer does not belong to you" },
        { status: 403 }
      );
    }

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

      // Verify item belongs to current user
      if (item.userId !== session.user.id) {
        return NextResponse.json(
          { error: `Item ${item.name} does not belong to you` },
          { status: 403 }
        );
      }

      // Get overlapping bookings (excluding the current booking being edited, only from current user)
      const overlappingBookings = await prisma.booking.findMany({
        where: {
          AND: [
            { userId: session.user.id },
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
