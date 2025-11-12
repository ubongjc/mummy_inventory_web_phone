import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { parseYmd } from "@/app/lib/dateUtils";

/**
 * GET /api/availability/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Returns reserved quantities for each item in the given date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");

    if (!startStr || !endStr) {
      return NextResponse.json(
        { error: "Both start and end dates are required" },
        { status: 400 }
      );
    }

    const startDate = parseYmd(startStr);
    const endDate = parseYmd(endStr);

    // Get all bookings that overlap with the date range
    const bookings = await prisma.booking.findMany({
      where: {
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
          { status: { in: ["CONFIRMED", "OUT"] } },
        ],
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    // Calculate reserved quantities per item
    const reservedByItem: Record<string, { itemId: string; name: string; reserved: number }> = {};

    for (const booking of bookings) {
      for (const bookingItem of booking.items) {
        if (!reservedByItem[bookingItem.itemId]) {
          reservedByItem[bookingItem.itemId] = {
            itemId: bookingItem.itemId,
            name: bookingItem.item.name,
            reserved: 0,
          };
        }
        reservedByItem[bookingItem.itemId].reserved += bookingItem.quantity;
      }
    }

    // Convert to array
    const summary = Object.values(reservedByItem);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching availability summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability summary" },
      { status: 500 }
    );
  }
}
