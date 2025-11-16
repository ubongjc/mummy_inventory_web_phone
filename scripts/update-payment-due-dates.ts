/**
 * Script to update all payment due dates to match rental end dates
 * This ensures payment due dates are on or after the rental end date
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePaymentDueDates() {
  try {
    console.log('Starting payment due date updates...\n');

    // Find all bookings
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        reference: true,
        endDate: true,
        paymentDueDate: true,
      },
    });

    console.log(`Found ${bookings.length} bookings to check\n`);

    let updatedCount = 0;
    let skippedCount = 0;

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

        console.log(
          `✓ Updated ${booking.reference || booking.id}: paymentDueDate set to ${booking.endDate.toISOString().split('T')[0]}`
        );
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total bookings: ${bookings.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped (already valid): ${skippedCount}`);
    console.log('\nPayment due date updates completed successfully!');
  } catch (error) {
    console.error('Error updating payment due dates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updatePaymentDueDates()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
