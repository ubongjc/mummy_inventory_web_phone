import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createBookingSchema } from "@/app/lib/validation";
import { toUTCMidnight, addOneDay, formatDateISO } from "@/app/lib/dates";
import { getRandomBookingColor } from "@/app/lib/colors";
import { toUtcDateOnly, toYmd, addDays } from "@/app/lib/dateUtils";
import { secureLog } from "@/app/lib/security";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let whereClause = {};

    if (start && end) {
      const startDate = toUTCMidnight(start);
      const endDate = toUTCMidnight(end);

      whereClause = {
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
          { status: { in: ["CONFIRMED", "OUT"] } },
        ],
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
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
      orderBy: { startDate: "desc" },
    });

    // Format for FullCalendar if start and end are provided
    if (start && end) {
      const events = bookings.map((booking: any) => {
        const itemsSummary = booking.items
          .map((ri: any) => `${ri.item.name} ×${ri.quantity}`)
          .join(", ");

        // Use dateUtils helpers for consistent UTC date handling
        const startDate = toYmd(toUtcDateOnly(booking.startDate));
        // FullCalendar 'end' is exclusive for allDay events: add 1 day
        const endDate = toYmd(addDays(toUtcDateOnly(booking.endDate), 1));

        // Use custom color if set, otherwise default blue or red for OUT status
        const bgColor = (booking as any).color || (booking.status === "OUT" ? "#ef4444" : "#3b82f6");
        const borderColor = bgColor;
        // Show only firstName on the calendar to save space (as requested)
        const customerFirstName = booking.customer.firstName || booking.customer.name;
        const customerFullName = `${booking.customer.firstName || booking.customer.name} ${booking.customer.lastName || ""}`.trim();

        // Logging removed - contains customer PII

        return {
          id: booking.id,
          title: `${customerFirstName} — ${itemsSummary}`,
          start: startDate,
          end: endDate, // YYYY-MM-DD (no time, no Z)
          allDay: true,
          backgroundColor: bgColor,
          borderColor: borderColor,
          bookingItemIds: booking.items.map((ri: any) => ri.itemId),
          extendedProps: {
            customerId: booking.customerId,
            customerName: customerFullName,
            status: booking.status,
            items: booking.items,
            color: (booking as any).color,
          },
        };
      });

      // Events returned successfully
      return NextResponse.json(events);
    }

    return NextResponse.json(bookings);
  } catch (error: any) {
    secureLog("[ERROR] Failed to fetch bookings", { error: error.message });
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createBookingSchema.parse(body);

    const startDate = toUTCMidnight(validated.startDate);
    const endDate = toUTCMidnight(validated.endDate);

    // Check availability for each item
    for (const bookingItem of validated.items) {
      const item = await prisma.item.findUnique({
        where: { id: bookingItem.itemId },
      });

      if (!item) {
        return NextResponse.json(
          { error: `Item ${bookingItem.itemId} not found` },
          { status: 404 }
        );
      }

      // Get all overlapping bookings for this item
      const overlappingBookings = await prisma.booking.findMany({
        where: {
          AND: [
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

    // Validate that total payments don't exceed total price
    if (validated.totalPrice) {
      const advancePayment = validated.advancePayment || 0;
      const initialPaymentsTotal = validated.initialPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const totalPayments = advancePayment + initialPaymentsTotal;

      if (totalPayments > validated.totalPrice) {
        return NextResponse.json(
          {
            error: "Total payments exceed total price",
            totalPrice: validated.totalPrice,
            advancePayment,
            initialPaymentsTotal,
            totalPayments,
          },
          { status: 400 }
        );
      }
    }

    // Create booking with random color
    const booking = await prisma.booking.create({
      data: {
        customerId: validated.customerId,
        startDate,
        endDate,
        status: validated.status || "CONFIRMED",
        reference: validated.reference,
        notes: validated.notes,
        color: getRandomBookingColor(),
        totalPrice: validated.totalPrice,
        advancePayment: validated.advancePayment,
        paymentDueDate: validated.paymentDueDate ? toUTCMidnight(validated.paymentDueDate) : undefined,
        items: {
          create: validated.items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
          })),
        },
        payments: validated.initialPayments ? {
          create: validated.initialPayments.map((payment) => ({
            amount: payment.amount,
            paymentDate: toUTCMidnight(payment.paymentDate),
            notes: payment.notes,
          })),
        } : undefined,
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    secureLog("[ERROR] Failed to create booking", { error: error.message });
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
