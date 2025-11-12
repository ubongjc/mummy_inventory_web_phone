import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { toUTCMidnight } from "@/app/lib/dates";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Parse the date string directly as YYYY-MM-DD at UTC midnight
    const targetDate = new Date(dateStr + "T00:00:00.000Z");

    console.log("Target date for day query:", dateStr, "->", targetDate.toISOString());

    // Get all bookings that span this date (inclusive)
    // A booking is active on targetDate if: startDate <= targetDate AND endDate >= targetDate
    const bookings = await prisma.booking.findMany({
      where: {
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
        status: { in: ["CONFIRMED", "OUT"] },
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
      orderBy: { startDate: "asc" },
    });

    console.log(`Found ${bookings.length} bookings for ${dateStr}`);
    bookings.forEach(r => {
      console.log(`  - Booking ${r.id}: ${r.startDate} to ${r.endDate} (${r.status})`);
    });

    // Get all items and calculate remaining for this date
    const items = await prisma.item.findMany({
      include: {
        bookingItems: {
          include: {
            booking: true,
          },
        },
      },
    });

    const itemAvailability = items.map((item) => {
      const reserved = item.bookingItems
        .filter(
          (ri) =>
            new Date(ri.booking.startDate) <= targetDate &&
            new Date(ri.booking.endDate) >= targetDate &&
            (ri.booking.status === "CONFIRMED" || ri.booking.status === "OUT")
        )
        .reduce((sum, ri) => sum + ri.quantity, 0);

      return {
        id: item.id,
        name: item.name,
        total: item.totalQuantity,
        reserved,
        remaining: item.totalQuantity - reserved,
        unit: item.unit,
      };
    });

    return NextResponse.json({
      date: dateStr,
      bookings,
      itemAvailability,
    });
  } catch (error) {
    console.error("Error fetching day data:", error);
    return NextResponse.json(
      { error: "Failed to fetch day data" },
      { status: 500 }
    );
  }
}
