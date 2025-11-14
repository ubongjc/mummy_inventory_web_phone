import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { parseYmd } from "@/app/lib/dateUtils";
import { secureLog } from "@/app/lib/security";

/**
 * GET /api/availability/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
 * Returns reserved quantities for each item in the given date range
 */
export async function GET(request: NextRequest) {
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

    // Get all bookings that overlap with the date range (filtered by user unless admin)
    const bookings = await prisma.booking.findMany({
      where: {
        AND: [
          ...(isAdmin ? [] : [{ userId: session.user.id }]),
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
  } catch (error: any) {
    secureLog("[ERROR] Failed to fetch availability summary", { error: error.message });
    return NextResponse.json(
      { error: "Failed to fetch availability summary" },
      { status: 500 }
    );
  }
}
