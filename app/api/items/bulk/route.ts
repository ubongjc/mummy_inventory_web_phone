import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function DELETE() {
  try {
    const result = await prisma.item.deleteMany({});

    return NextResponse.json({
      message: "All items deleted successfully",
      count: result.count,
    });
  } catch (error) {
    console.error("Error deleting all items:", error);
    return NextResponse.json(
      { error: "Failed to delete items" },
      { status: 500 }
    );
  }
}
