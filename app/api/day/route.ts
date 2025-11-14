import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { toUTCMidnight } from "@/app/lib/dates";
import { secureLog } from "@/app/lib/security";

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
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Parse the date string directly as YYYY-MM-DD at UTC midnight
    const targetDate = new Date(dateStr + "T00:00:00.000Z");

    // Get all bookings that span this date (inclusive, filtered by user unless admin)
    // A booking is active on targetDate if: startDate <= targetDate AND endDate >= targetDate
    const bookings = await prisma.booking.findMany({
      where: {
        ...(isAdmin ? {} : { userId: session.user.id }),
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

    // Get all items for this user and calculate remaining for this date
    const items = await prisma.item.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      include: {
        bookingItems: {
          include: {
            booking: true,
          },
        },
      },
    });

    const itemAvailability = items.map((item: any) => {
      const reserved = item.bookingItems
        .filter(
          (ri: any) =>
            new Date(ri.booking.startDate) <= targetDate &&
            new Date(ri.booking.endDate) >= targetDate &&
            (ri.booking.status === "CONFIRMED" || ri.booking.status === "OUT")
        )
        .reduce((sum: number, ri: any) => sum + ri.quantity, 0);

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
  } catch (error: any) {
    secureLog("[ERROR] Failed to fetch day data", { error: error.message });
    return NextResponse.json(
      { error: "Failed to fetch day data" },
      { status: 500 }
    );
  }
}
