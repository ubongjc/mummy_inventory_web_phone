import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth.config';
import { prisma } from '@/app/lib/prisma';

/**
 * Admin endpoint to update all payment due dates to match rental end dates
 * This ensures payment due dates are on or after the rental end date
 * Run this once after deployment to fix existing data
 */
export async function POST() {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Find all user's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        reference: true,
        endDate: true,
        paymentDueDate: true,
      },
    });

    let updatedCount = 0;
    let skippedCount = 0;
    const updates: string[] = [];

    for (const booking of bookings) {
      const shouldUpdate =
        // Update if payment due date is null
        !booking.paymentDueDate ||
        // Update if payment due date is before end date
        booking.paymentDueDate < booking.endDate;

      if (shouldUpdate) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { paymentDueDate: booking.endDate },
        });

        updates.push(
          `Updated ${booking.reference || booking.id}: paymentDueDate set to ${booking.endDate.toISOString().split('T')[0]}`
        );
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      total: bookings.length,
      updated: updatedCount,
      skipped: skippedCount,
      updates,
    });
  } catch (error: any) {
    console.error('Error updating payment due dates:', error);
    return NextResponse.json(
      { error: 'Failed to update payment due dates', details: error.message },
      { status: 500 }
    );
  }
}
