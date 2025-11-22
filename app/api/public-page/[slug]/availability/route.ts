// Public availability checking API (no auth required)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { slug } = params;

    // Verify public page exists and is active
    const publicPage = await prisma.publicPage.findUnique({
      where: { slug },
      select: { userId: true, isActive: true },
    });

    if (!publicPage || !publicPage.isActive) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const body = await req.json();
    const { startDate, endDate, itemIds } = body;

    // Validation
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: 'Item IDs are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // Set to start of day for consistent comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Get all items with their details
    const items = await prisma.item.findMany({
      where: {
        userId: publicPage.userId,
        id: { in: itemIds },
      },
      select: {
        id: true,
        name: true,
        totalQuantity: true,
        unit: true,
        price: true,
        imageUrl: true,
      },
    });

    // Get all bookings that overlap with the requested period for these items
    const bookings = await prisma.booking.findMany({
      where: {
        userId: publicPage.userId,
        status: {
          in: ['CONFIRMED', 'CONFIRMED_WITHOUT_PAYMENT', 'OUT'], // Only count active bookings
        },
        OR: [
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: start } },
            ],
          },
        ],
      },
      include: {
        items: {
          where: {
            itemId: { in: itemIds },
          },
          select: {
            itemId: true,
            quantity: true,
          },
        },
      },
    });

    // Calculate availability for each item
    const availability = items.map((item) => {
      // Sum up all booked quantities for this item in the date range
      let bookedQuantity = 0;

      bookings.forEach((booking) => {
        const bookingItem = booking.items.find((bi) => bi.itemId === item.id);
        if (bookingItem) {
          bookedQuantity += bookingItem.quantity;
        }
      });

      const availableQuantity = item.totalQuantity - bookedQuantity;

      return {
        itemId: item.id,
        name: item.name,
        unit: item.unit,
        price: item.price,
        imageUrl: item.imageUrl,
        totalQuantity: item.totalQuantity,
        bookedQuantity,
        availableQuantity,
        isAvailable: availableQuantity > 0,
      };
    });

    return NextResponse.json({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      availability,
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
  }
}
