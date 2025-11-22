// Cron job endpoint for sending scheduled reminders
// Call this endpoint from Vercel Cron or external cron service

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { NotificationService } from '@/app/lib/notifications';

/**
 * POST /api/cron/send-reminders
 *
 * Security: Protected by CRON_SECRET environment variable
 * Schedule: Run daily via Vercel Cron or external cron service
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    // Vercel cron jobs don't send auth headers, but we can check for custom secret for external services
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow if no CRON_SECRET is set (Vercel cron in production) OR if secret matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting reminder send job...');

    const now = new Date();
    const stats = {
      rentalReminders: 0,
      returnReminders: 0,
      paymentReminders: 0,
      totalProcessed: 0,
      errors: 0,
    };

    // Get all users with notification preferences
    const users = await prisma.user.findMany({
      where: {
        notificationPreferences: {
          isNot: null,
        },
      },
      include: {
        notificationPreferences: true,
      },
    });

    for (const user of users) {
      if (!user.notificationPreferences) continue;

      const { reminderHoursBefore } = user.notificationPreferences;
      const reminderDate = new Date(now.getTime() + reminderHoursBefore * 60 * 60 * 1000);

      try {
        // Send rental start reminders
        if (user.notificationPreferences.customerRentalReminderEmail ||
            user.notificationPreferences.customerRentalReminderSms) {

          const upcomingRentals = await prisma.booking.findMany({
            where: {
              userId: user.id,
              status: { in: ['CONFIRMED', 'OUT'] },
              startDate: {
                gte: now,
                lte: reminderDate,
              },
            },
            include: {
              customer: true,
              items: {
                include: {
                  item: true,
                },
              },
            },
          });

          for (const booking of upcomingRentals) {
            // Check if we already sent a reminder recently (within last 12 hours)
            const recentReminder = await prisma.notificationLog.findFirst({
              where: {
                userId: user.id,
                bookingId: booking.id,
                notificationType: 'rental_reminder',
                sentAt: {
                  gte: new Date(now.getTime() - 12 * 60 * 60 * 1000),
                },
              },
            });

            if (recentReminder) {
              console.log(`Skipping rental reminder for booking ${booking.id} - already sent recently`);
              continue;
            }

            const items = booking.items.map(
              (bi) => `${bi.item.name} (${bi.quantity} ${bi.item.unit})`
            );

            await NotificationService.sendRentalReminder(
              user.id,
              booking.customerId,
              booking.id,
              booking.customer.name,
              booking.customer.email,
              booking.customer.phone,
              booking.startDate,
              booking.endDate,
              items,
              booking.reference || undefined
            );

            stats.rentalReminders++;
          }
        }

        // Send return reminders
        if (user.notificationPreferences.customerReturnReminderEmail ||
            user.notificationPreferences.customerReturnReminderSms) {

          const upcomingReturns = await prisma.booking.findMany({
            where: {
              userId: user.id,
              status: 'OUT',
              endDate: {
                gte: now,
                lte: reminderDate,
              },
            },
            include: {
              customer: true,
              items: {
                include: {
                  item: true,
                },
              },
            },
          });

          for (const booking of upcomingReturns) {
            // Check if we already sent a reminder recently
            const recentReminder = await prisma.notificationLog.findFirst({
              where: {
                userId: user.id,
                bookingId: booking.id,
                notificationType: 'return_reminder',
                sentAt: {
                  gte: new Date(now.getTime() - 12 * 60 * 60 * 1000),
                },
              },
            });

            if (recentReminder) {
              console.log(`Skipping return reminder for booking ${booking.id} - already sent recently`);
              continue;
            }

            const items = booking.items.map(
              (bi) => `${bi.item.name} (${bi.quantity} ${bi.item.unit})`
            );

            await NotificationService.sendReturnReminder(
              user.id,
              booking.customerId,
              booking.id,
              booking.customer.name,
              booking.customer.email,
              booking.customer.phone,
              booking.endDate,
              items,
              booking.reference || undefined
            );

            stats.returnReminders++;
          }
        }

        // Send payment reminders for overdue bookings
        if (user.notificationPreferences.customerPaymentReminderEmail ||
            user.notificationPreferences.customerPaymentReminderSms) {

          const overdueBookings = await prisma.booking.findMany({
            where: {
              userId: user.id,
              status: { in: ['CONFIRMED', 'OUT', 'RETURNED'] },
              totalPrice: { not: null },
            },
            include: {
              customer: true,
              payments: true,
              items: {
                include: {
                  item: true,
                },
              },
            },
          });

          for (const booking of overdueBookings) {
            if (!booking.totalPrice) continue;

            // Calculate outstanding balance
            const totalPaid = booking.payments.reduce(
              (sum, payment) => sum + Number(payment.amount),
              0
            );
            const balance = Number(booking.totalPrice) - totalPaid;

            if (balance <= 0) continue; // Fully paid

            // Check if payment is overdue
            const isOverdue = booking.paymentDueDate
              ? booking.paymentDueDate < now
              : booking.endDate < now; // If no due date, consider overdue after return date

            if (!isOverdue) continue;

            // Check if we already sent a reminder recently (within last 24 hours for payments)
            const recentReminder = await prisma.notificationLog.findFirst({
              where: {
                userId: user.id,
                bookingId: booking.id,
                notificationType: 'payment_reminder',
                sentAt: {
                  gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                },
              },
            });

            if (recentReminder) {
              console.log(`Skipping payment reminder for booking ${booking.id} - already sent recently`);
              continue;
            }

            const items = booking.items.map(
              (bi) => `${bi.item.name} (${bi.quantity} ${bi.item.unit})`
            );

            // Get user settings for currency
            const settings = await prisma.settings.findUnique({
              where: { userId: user.id },
            });

            await NotificationService.sendPaymentReminder(
              user.id,
              booking.customerId,
              booking.id,
              booking.customer.name,
              booking.customer.email,
              booking.customer.phone,
              balance,
              items,
              booking.reference || undefined
            );

            stats.paymentReminders++;
          }
        }

        stats.totalProcessed++;
      } catch (error) {
        console.error(`Error processing reminders for user ${user.id}:`, error);
        stats.errors++;
      }
    }

    console.log('[CRON] Reminder send job completed:', stats);

    return NextResponse.json({
      success: true,
      stats,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error in reminder send job:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing (also requires auth)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'Cron endpoint is active',
    message: 'Use POST to trigger reminder send',
  });
}
