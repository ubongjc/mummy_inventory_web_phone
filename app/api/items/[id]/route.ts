import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { updateItemSchema } from "@/app/lib/validation";
import { secureLog, sanitizeErrorResponse } from "@/app/lib/security";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify item belongs to user (unless admin)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    const existingItem = await prisma.item.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (!isAdmin && existingItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateItemSchema.parse(body);

    // If totalQuantity is being updated, check that it's not below current reservations
    if (validated.totalQuantity !== undefined) {
      // Get current and future bookings using this item
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const overlappingBookings = await prisma.booking.findMany({
        where: {
          AND: [
            { userId: session.user.id },
            { endDate: { gte: now } },
            { status: { in: ["CONFIRMED", "OUT"] } },
          ],
        },
        include: {
          items: {
            where: { itemId: id },
          },
        },
      });

      const maxReserved = overlappingBookings.reduce(
        (max: number, booking: any) =>
          Math.max(
            max,
            booking.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
          ),
        0
      );

      if (validated.totalQuantity < maxReserved) {
        return NextResponse.json(
          {
            error: `Cannot reduce total quantity to ${validated.totalQuantity}. Currently ${maxReserved} units are reserved in active/future bookings. Please cancel or modify those bookings first.`,
            maxReserved,
            requestedQuantity: validated.totalQuantity,
          },
          { status: 409 }
        );
      }
    }

    const item = await prisma.item.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(item);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      sanitizeErrorResponse(error, "Failed to update item"),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify item belongs to user (unless admin)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === 'admin';

    const existingItem = await prisma.item.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (!isAdmin && existingItem.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if item is used in any active bookings (CONFIRMED or OUT status only)
    const activeBookings = await prisma.bookingItem.findMany({
      where: {
        itemId: id,
        booking: {
          userId: session.user.id,
          status: {
            in: ["CONFIRMED", "OUT"]
          }
        }
      },
      include: {
        booking: {
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                name: true
              }
            }
          }
        }
      },
      distinct: ['bookingId']
    });

    if (activeBookings.length > 0) {
      // Format booking details with customer names and end dates
      const bookingDetails = activeBookings.map(item => {
        const customer = item.booking.customer;
        const customerName = customer.firstName
          ? `${customer.firstName} ${customer.lastName || ''}`.trim()
          : customer.name;
        const endDate = new Date(item.booking.endDate);
        const formattedDate = endDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        return `• ${customerName} (ends ${formattedDate})`;
      }).join('\n');

      const errorMessage = `Cannot delete item. It is being used in ${activeBookings.length} active booking${activeBookings.length > 1 ? 's' : ''}:\n\n${bookingDetails}\n\nComplete or cancel these bookings first.`;

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      sanitizeErrorResponse(error, "Failed to delete item"),
      { status: 500 }
    );
  }
}
