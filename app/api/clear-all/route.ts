import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE() {
  try {
    // Delete in order: bookings first (has foreign keys to customers and items),
    // then customers and items can be deleted
    const bookingsResult = await prisma.booking.deleteMany({});
    const customersResult = await prisma.customer.deleteMany({});
    const itemsResult = await prisma.item.deleteMany({});

    return NextResponse.json({
      message: "All data deleted successfully",
      bookings: bookingsResult.count,
      customers: customersResult.count,
      items: itemsResult.count,
      total: bookingsResult.count + customersResult.count + itemsResult.count,
    });
  } catch (error) {
    console.error("Error clearing all data:", error);
    return NextResponse.json(
      { error: "Failed to clear all data" },
      { status: 500 }
    );
  }
}
