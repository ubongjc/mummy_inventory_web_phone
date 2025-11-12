import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { updateItemSchema } from "@/app/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateItemSchema.parse(body);

    const item = await prisma.item.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("Error updating item:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if item is used in any rentals
    const itemRentals = await prisma.rentalItem.count({
      where: { itemId: id }
    });

    if (itemRentals > 0) {
      return NextResponse.json(
        { error: `Cannot delete item that is used in ${itemRentals} rental${itemRentals > 1 ? 's' : ''}. Delete or modify the rentals first.` },
        { status: 400 }
      );
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting item:", error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}
