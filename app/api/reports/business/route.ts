// Business reports API endpoint - Generates comprehensive business analytics

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { applyRateLimit } from '@/app/lib/security';
import {
  BusinessReportData,
  exportBusinessReportToCSV,
  generatePDFReportHTML,
  exportToExcel,
} from '@/app/lib/export';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await applyRateLimit(req);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.plan === 'free') {
      return NextResponse.json(
        {
          error: 'Business reports are only available for Pro and Business plans',
          upgrade_required: true,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const exportFormat = searchParams.get('format'); // csv, excel, pdf, json
    const months = parseInt(searchParams.get('months') || '6', 10); // Default 6 months

    // Calculate date range
    const endDate = endOfMonth(new Date());
    const startDate = startOfMonth(subMonths(endDate, months - 1));

    // Fetch all bookings in period
    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        startDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: {
          select: {
            amount: true,
          },
        },
      },
    });

    // Fetch all customers created in period
    const newCustomers = await prisma.customer.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Fetch all items
    const allItems = await prisma.item.findMany({
      where: { userId: user.id },
    });

    // Calculate summary metrics
    const totalRevenue = bookings.reduce(
      (sum, b) => sum + (b.totalPrice ? Number(b.totalPrice) : 0),
      0
    );

    const totalPayments = bookings.reduce(
      (sum, b) => sum + b.payments.reduce((s, p) => s + Number(p.amount), 0),
      0
    );

    const outstandingBalance = totalRevenue - totalPayments;

    // Calculate top customers
    const customerStats = new Map<
      string,
      { name: string; bookings: number; revenue: number }
    >();

    bookings.forEach(booking => {
      const customerId = booking.customer.id;
      const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`;

      if (!customerStats.has(customerId)) {
        customerStats.set(customerId, { name: customerName, bookings: 0, revenue: 0 });
      }

      const stats = customerStats.get(customerId)!;
      stats.bookings += 1;
      stats.revenue += booking.totalPrice ? Number(booking.totalPrice) : 0;
    });

    const topCustomers = Array.from(customerStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate top items
    const itemStats = new Map<string, { name: string; timesRented: number; revenue: number }>();

    bookings.forEach(booking => {
      booking.items.forEach(bookingItem => {
        const itemId = bookingItem.item.id;
        const itemName = bookingItem.item.name;

        if (!itemStats.has(itemId)) {
          itemStats.set(itemId, { name: itemName, timesRented: 0, revenue: 0 });
        }

        const stats = itemStats.get(itemId)!;
        stats.timesRented += 1;
        stats.revenue += booking.totalPrice
          ? (Number(booking.totalPrice) / booking.items.length) * bookingItem.quantity
          : 0;
      });
    });

    const topItems = Array.from(itemStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate revenue by month
    const revenueByMonth: { [key: string]: { revenue: number; bookings: number } } = {};

    for (let i = 0; i < months; i++) {
      const monthDate = subMonths(endDate, i);
      const monthKey = format(monthDate, 'MMM yyyy');
      revenueByMonth[monthKey] = { revenue: 0, bookings: 0 };
    }

    bookings.forEach(booking => {
      const monthKey = format(booking.startDate, 'MMM yyyy');
      if (revenueByMonth[monthKey]) {
        revenueByMonth[monthKey].revenue += booking.totalPrice ? Number(booking.totalPrice) : 0;
        revenueByMonth[monthKey].bookings += 1;
      }
    });

    const revenueByMonthArray = Object.entries(revenueByMonth)
      .map(([month, data]) => ({ month, ...data }))
      .reverse();

    // Calculate bookings by status
    const statusCounts = new Map<string, number>();
    bookings.forEach(booking => {
      const count = statusCounts.get(booking.status) || 0;
      statusCounts.set(booking.status, count + 1);
    });

    const totalBookingsCount = bookings.length;
    const bookingsByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalBookingsCount > 0 ? (count / totalBookingsCount) * 100 : 0,
    }));

    // Build report data
    const reportData: BusinessReportData = {
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalBookings: bookings.length,
        totalRevenue,
        totalPayments,
        outstandingBalance,
        newCustomers: newCustomers.length,
        activeItems: allItems.length,
      },
      topCustomers,
      topItems,
      revenueByMonth: revenueByMonthArray,
      bookingsByStatus,
    };

    // Return based on format
    if (exportFormat === 'csv') {
      const blob = exportBusinessReportToCSV(reportData);
      const buffer = Buffer.from(await blob.arrayBuffer());
      const filename = `business_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    } else if (exportFormat === 'pdf') {
      const html = generatePDFReportHTML(reportData);
      const filename = `business_report_${format(new Date(), 'yyyy-MM-dd')}.html`;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="${filename}"`,
        },
      });
    } else if (exportFormat === 'excel') {
      const blob = exportToExcel(
        [
          { section: 'SUMMARY', ...reportData.summary },
          ...reportData.topCustomers.map((c, i) => ({
            section: i === 0 ? 'TOP CUSTOMERS' : '',
            ...c,
          })),
          ...reportData.topItems.map((item, i) => ({
            section: i === 0 ? 'TOP ITEMS' : '',
            ...item,
          })),
          ...reportData.revenueByMonth.map((m, i) => ({
            section: i === 0 ? 'REVENUE BY MONTH' : '',
            ...m,
          })),
          ...reportData.bookingsByStatus.map((s, i) => ({
            section: i === 0 ? 'BOOKINGS BY STATUS' : '',
            ...s,
          })),
        ],
        'business_report.xlsx'
      );
      const buffer = Buffer.from(await blob.arrayBuffer());
      const filename = `business_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    } else {
      // Default: JSON
      return NextResponse.json(reportData);
    }
  } catch (error) {
    console.error('Error generating business report:', error);
    return NextResponse.json(
      { error: 'Failed to generate business report' },
      { status: 500 }
    );
  }
}
