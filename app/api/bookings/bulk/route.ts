import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE() {
  try {
    const result = await prisma.booking.deleteMany({});

    return NextResponse.json({
      message: "All bookings deleted successfully",
      count: result.count,
    });
  } catch (error) {
    console.error("Error deleting all bookings:", error);
    return NextResponse.json(
      { error: "Failed to delete bookings" },
      { status: 500 }
    );
  }
}
