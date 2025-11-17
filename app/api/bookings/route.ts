import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { createBookingSchema } from "@/app/lib/validation";
import { toUTCMidnight } from "@/app/lib/dates";
import { getRandomBookingColor } from "@/app/lib/colors";
import { toUtcDateOnly, toYmd, addDays } from "@/app/lib/dateUtils";
import { secureLog, applyRateLimit, RateLimitPresets } from "@/app/lib/security";
import { checkActiveBookingLimit, checkMonthlyBookingLimit, getBookingHistoryCutoff } from "@/app/lib/limits";

export async function GET(request: NextRequest) {
  // Apply rate limiting for read operations
  const rateLimitResult = await applyRateLimit(request, RateLimitPresets.READ);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

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

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let whereClause: any = isAdmin ? {} : { userId: session.user.id };

    if (start && end) {
      const startDate = toUTCMidnight(start);
      const endDate = toUTCMidnight(end);

      whereClause = {
        AND: [
          ...(isAdmin ? [] : [{ userId: session.user.id }]),
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
          { status: { in: ["CONFIRMED", "OUT"] } },
        ],
      };
    } else {
      // Apply booking history limit for non-admin users when not fetching calendar view
      if (!isAdmin) {
        const historyCutoff = await getBookingHistoryCutoff(session.user.id);
        if (historyCutoff) {
          whereClause = {
            AND: [
              { userId: session.user.id },
              { createdAt: { gte: historyCutoff } },
            ],
          };
        }
      }
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
    console.error("[ERROR] Failed to fetch bookings:", error);
    secureLog("[ERROR] Failed to fetch bookings", { error: error.message, stack: error.stack });
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting for write operations
  const rateLimitResult = await applyRateLimit(request, RateLimitPresets.WRITE);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createBookingSchema.parse(body);

    const startDate = toUTCMidnight(validated.startDate);
    const endDate = toUTCMidnight(validated.endDate);

    // Check if user has reached their active booking limit (only for new CONFIRMED/OUT bookings)
    const bookingStatus = validated.status || "CONFIRMED";
    if (bookingStatus === "CONFIRMED" || bookingStatus === "OUT") {
      const activeBookingCheck = await checkActiveBookingLimit(session.user.id);
      if (!activeBookingCheck.allowed) {
        return NextResponse.json(
          {
            error: "Active booking limit reached",
            details: activeBookingCheck.message,
            current: activeBookingCheck.current,
            limit: activeBookingCheck.limit,
            planType: activeBookingCheck.planType,
          },
          { status: 403 }
        );
      }
    }

    // Check if user has reached their monthly booking limit
    const monthlyBookingCheck = await checkMonthlyBookingLimit(session.user.id);
    if (!monthlyBookingCheck.allowed) {
      return NextResponse.json(
        {
          error: "Monthly booking limit reached",
          details: monthlyBookingCheck.message,
          current: monthlyBookingCheck.current,
          limit: monthlyBookingCheck.limit,
          planType: monthlyBookingCheck.planType,
        },
        { status: 403 }
      );
    }

    // Check availability for each item (must belong to current user)
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

      // Verify item belongs to current user
      if (item.userId !== session.user.id) {
        return NextResponse.json(
          { error: `Item ${item.name} does not belong to you` },
          { status: 403 }
        );
      }

      // Get all overlapping bookings for this item (only from current user)
      const overlappingBookings = await prisma.booking.findMany({
        where: {
          AND: [
            { userId: session.user.id },
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

    // Verify customer belongs to current user
    const customer = await prisma.customer.findUnique({
      where: { id: validated.customerId },
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
        userId: session.user.id, // Always set to current user
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
