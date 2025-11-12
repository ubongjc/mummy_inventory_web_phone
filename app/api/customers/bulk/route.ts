import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE() {
  try {
    const result = await prisma.customer.deleteMany({});

    return NextResponse.json({
      message: "All customers deleted successfully",
      count: result.count,
    });
  } catch (error) {
    console.error("Error deleting all customers:", error);
    return NextResponse.json(
      { error: "Failed to delete customers" },
      { status: 500 }
    );
  }
}
