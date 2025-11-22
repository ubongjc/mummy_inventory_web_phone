// Notification analytics API - provides insights into notification sending

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';

// GET - Fetch notification analytics
export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get period from query params (default 30 days)
    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get('period');
    const period = periodParam ? parseInt(periodParam, 10) : 30;

    // Validate period
    if (isNaN(period) || period < 1 || period > 365) {
      return NextResponse.json(
        { error: 'Invalid period. Must be between 1 and 365 days.' },
        { status: 400 }
      );
    }

    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - period);

    // Get total notifications sent
    const totalNotifications = await prisma.notificationLog.count({
      where: {
        userId: user.id,
        sentAt: {
          gte: periodStart,
        },
      },
    });

    // Get notifications by channel
    const notificationsByChannel = await prisma.notificationLog.groupBy({
      by: ['channel'],
      where: {
        userId: user.id,
        sentAt: {
          gte: periodStart,
        },
      },
      _count: true,
    });

    // Get notifications by type
    const notificationsByType = await prisma.notificationLog.groupBy({
      by: ['notificationType'],
      where: {
        userId: user.id,
        sentAt: {
          gte: periodStart,
        },
      },
      _count: true,
    });

    // Get notifications by status
    const notificationsByStatus = await prisma.notificationLog.groupBy({
      by: ['status'],
      where: {
        userId: user.id,
        sentAt: {
          gte: periodStart,
        },
      },
      _count: true,
    });

    // Calculate success rate
    const successfulSends = notificationsByStatus.find((s) => s.status === 'sent')?._count || 0;
    const successRate = totalNotifications > 0
      ? ((successfulSends / totalNotifications) * 100).toFixed(1)
      : '0.0';

    // Get daily breakdown for chart
    const dailyStats = await prisma.$queryRaw<Array<{
      date: string;
      sent: number;
      failed: number;
      skipped: number;
    }>>`
      SELECT
        DATE(sentAt) as date,
        COUNT(CASE WHEN status = 'sent' THEN 1 END)::int as sent,
        COUNT(CASE WHEN status = 'failed' THEN 1 END)::int as failed,
        COUNT(CASE WHEN status = 'skipped' THEN 1 END)::int as skipped
      FROM "NotificationLog"
      WHERE "userId" = ${user.id}
        AND "sentAt" >= ${periodStart}
      GROUP BY DATE(sentAt)
      ORDER BY date DESC
      LIMIT 30
    `;

    // Get opt-out statistics
    const totalCustomers = await prisma.customer.count({
      where: { userId: user.id },
    });

    const optOutStats = await prisma.customerNotificationOptOut.groupBy({
      by: ['optOutEmail', 'optOutSms'],
      where: {
        customer: {
          userId: user.id,
        },
      },
      _count: true,
    });

    const emailOptOuts = optOutStats
      .filter((s) => s.optOutEmail)
      .reduce((sum, s) => sum + s._count, 0);

    const smsOptOuts = optOutStats
      .filter((s) => s.optOutSms)
      .reduce((sum, s) => sum + s._count, 0);

    const emailOptOutRate = totalCustomers > 0
      ? ((emailOptOuts / totalCustomers) * 100).toFixed(1)
      : '0.0';

    const smsOptOutRate = totalCustomers > 0
      ? ((smsOptOuts / totalCustomers) * 100).toFixed(1)
      : '0.0';

    // Get recent notifications
    const recentNotifications = await prisma.notificationLog.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: 20,
      select: {
        id: true,
        notificationType: true,
        channel: true,
        recipient: true,
        status: true,
        sentAt: true,
        errorMessage: true,
      },
    });

    return NextResponse.json({
      period,
      totalNotifications,
      successRate,
      byChannel: notificationsByChannel.map((c) => ({
        channel: c.channel,
        count: c._count,
      })),
      byType: notificationsByType.map((t) => ({
        type: t.notificationType,
        count: t._count,
      })),
      byStatus: notificationsByStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      dailyStats: dailyStats.map((d) => ({
        date: new Date(d.date).toISOString().split('T')[0],
        sent: d.sent,
        failed: d.failed,
        skipped: d.skipped,
        total: d.sent + d.failed + d.skipped,
      })),
      optOuts: {
        totalCustomers,
        emailOptOuts,
        smsOptOuts,
        emailOptOutRate,
        smsOptOutRate,
      },
      recentNotifications: recentNotifications.map((n) => ({
        id: n.id,
        type: n.notificationType,
        channel: n.channel,
        recipient: n.recipient,
        status: n.status,
        sentAt: n.sentAt.toISOString(),
        error: n.errorMessage,
      })),
    });
  } catch (error) {
    console.error('Error fetching notification analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
