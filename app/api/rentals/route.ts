import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createRentalSchema } from "@/app/lib/validation";
import { toUTCMidnight, addOneDay, formatDateISO } from "@/app/lib/dates";
import { getRandomRentalColor } from "@/app/lib/colors";
import { toUtcDateOnly, toYmd, addDays } from "@/app/lib/dateUtils";
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

    const rentals = await prisma.rental.findMany({
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
      const events = rentals.map((rental) => {
        const itemsSummary = rental.items
          .map((ri) => `${ri.item.name} ×${ri.quantity}`)
          .join(", ");

        // Use dateUtils helpers for consistent UTC date handling
        const startDate = toYmd(toUtcDateOnly(rental.startDate));
        // FullCalendar 'end' is exclusive for allDay events: add 1 day
        const endDate = toYmd(addDays(toUtcDateOnly(rental.endDate), 1));

        // Use custom color if set, otherwise default blue or red for OUT status
        const bgColor = (rental as any).color || (rental.status === "OUT" ? "#ef4444" : "#3b82f6");
        const borderColor = bgColor;
        // Show only firstName on the calendar to save space (as requested)
        const customerFirstName = rental.customer.firstName || rental.customer.name;
        const customerFullName = `${rental.customer.firstName || rental.customer.name} ${rental.customer.lastName || ""}`.trim();

        console.log(`[Calendar] Rental ${rental.id.substring(0, 8)}: "${customerFullName}" DB: ${rental.startDate.toISOString().split('T')[0]} to ${rental.endDate.toISOString().split('T')[0]}, Calendar: ${startDate} to ${endDate}, Color: ${(rental as any).color} → ${bgColor}`);

        return {
          id: rental.id,
          title: `${customerFirstName} — ${itemsSummary}`,
          start: startDate,
          end: endDate, // YYYY-MM-DD (no time, no Z)
          allDay: true,
          backgroundColor: bgColor,
          borderColor: borderColor,
          rentalItemIds: rental.items.map(ri => ri.itemId),
          extendedProps: {
            customerId: rental.customerId,
            customerName: customerFullName,
            status: rental.status,
            items: rental.items,
            color: (rental as any).color,
          },
        };
      });

      console.log(`[Calendar] Returning ${events.length} events for ${start} to ${end}`);
      if (events.length > 0) {
        const sample = events[0];
        console.log('[Calendar] Sample event - id:', sample.id, 'start:', sample.start, 'end:', sample.end, 'allDay:', sample.allDay);
      }
      return NextResponse.json(events);
    }

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return NextResponse.json(
      { error: "Failed to fetch rentals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] Received rental data:', JSON.stringify(body, null, 2));
    const validated = createRentalSchema.parse(body);
    console.log('[API] Validated initial payments:', validated.initialPayments);

    const startDate = toUTCMidnight(validated.startDate);
    const endDate = toUTCMidnight(validated.endDate);

    console.log('[CREATE RENTAL] Input dates:', validated.startDate, 'to', validated.endDate);
    console.log('[CREATE RENTAL] Parsed to UTC:', startDate.toISOString(), 'to', endDate.toISOString());

    // Check availability for each item
    for (const rentalItem of validated.items) {
      const item = await prisma.item.findUnique({
        where: { id: rentalItem.itemId },
      });

      if (!item) {
        return NextResponse.json(
          { error: `Item ${rentalItem.itemId} not found` },
          { status: 404 }
        );
      }

      // Get all overlapping rentals for this item
      const overlappingRentals = await prisma.rental.findMany({
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
              itemId: rentalItem.itemId,
            },
          },
        },
      });

      // Check availability day-by-day
      const currentDate = new Date(startDate);
      const endDateCheck = new Date(endDate);

      while (currentDate <= endDateCheck) {
        // Calculate reserved quantity on this specific day
        const reservedOnDay = overlappingRentals.reduce((sum, rental) => {
          const rentalStart = new Date(rental.startDate);
          const rentalEnd = new Date(rental.endDate);

          // Check if this rental overlaps with current day
          if (currentDate >= rentalStart && currentDate <= rentalEnd) {
            return sum + rental.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
          }
          return sum;
        }, 0);

        const availableOnDay = item.totalQuantity - reservedOnDay;

        if (availableOnDay < rentalItem.quantity) {
          return NextResponse.json(
            {
              error: "Insufficient availability",
              itemName: item.name,
              date: currentDate.toISOString().split('T')[0],
              requested: rentalItem.quantity,
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

    // Create rental with random color
    const rental = await prisma.rental.create({
      data: {
        customerId: validated.customerId,
        startDate,
        endDate,
        status: validated.status || "CONFIRMED",
        reference: validated.reference,
        notes: validated.notes,
        color: getRandomRentalColor(),
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

    return NextResponse.json(rental, { status: 201 });
  } catch (error: any) {
    console.error("Error creating rental:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create rental" },
      { status: 500 }
    );
  }
}
