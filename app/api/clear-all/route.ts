import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { secureLog } from "@/app/lib/security";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin - only admin can use this endpoint
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Delete in order: bookings first (has foreign keys to customers and items),
    // then customers and items can be deleted
    const bookingsResult = await prisma.booking.deleteMany({});
    const customersResult = await prisma.customer.deleteMany({});
    const itemsResult = await prisma.item.deleteMany({});
    const settingsResult = await prisma.settings.deleteMany({});

    return NextResponse.json({
      message: "All data deleted successfully",
      bookings: bookingsResult.count,
      customers: customersResult.count,
      items: itemsResult.count,
      settings: settingsResult.count,
      total: bookingsResult.count + customersResult.count + itemsResult.count + settingsResult.count,
    });
  } catch (error: any) {
    secureLog("[ERROR] Failed to clear all data", { error: error.message });
    return NextResponse.json(
      { error: "Failed to clear all data" },
      { status: 500 }
    );
  }
}
