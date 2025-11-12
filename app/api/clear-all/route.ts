import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE() {
  try {
    // Delete in order: rentals first (has foreign keys to customers and items),
    // then customers and items can be deleted
    const rentalsResult = await prisma.rental.deleteMany({});
    const customersResult = await prisma.customer.deleteMany({});
    const itemsResult = await prisma.item.deleteMany({});

    return NextResponse.json({
      message: "All data deleted successfully",
      rentals: rentalsResult.count,
      customers: customersResult.count,
      items: itemsResult.count,
      total: rentalsResult.count + customersResult.count + itemsResult.count,
    });
  } catch (error) {
    console.error("Error clearing all data:", error);
    return NextResponse.json(
      { error: "Failed to clear all data" },
      { status: 500 }
    );
  }
}
