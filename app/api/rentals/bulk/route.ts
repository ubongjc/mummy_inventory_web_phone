import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE() {
  try {
    const result = await prisma.rental.deleteMany({});

    return NextResponse.json({
      message: "All rentals deleted successfully",
      count: result.count,
    });
  } catch (error) {
    console.error("Error deleting all rentals:", error);
    return NextResponse.json(
      { error: "Failed to delete rentals" },
      { status: 500 }
    );
  }
}
