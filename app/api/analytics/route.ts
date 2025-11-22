// Premium Analytics API for individual users
// Provides utilization rates, conversion rates, and profitability analysis

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/app/lib/prisma';
import { hasFeature } from '@/app/lib/auth';
import { applyRateLimit } from '@/app/lib/security';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check premium access
    const hasPremium = await hasFeature(user.id, 'analytics');
    if (!hasPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required for Custom Analytics' },
        { status: 403 }
      );
    }

    // Get time period from query params with validation
    const searchParams = request.nextUrl.searchParams;
    const periodParam = searchParams.get('period') || '30';
    let period = parseInt(periodParam, 10);

    // Validate period: must be positive and within reasonable bounds (max 2 years)
    if (isNaN(period) || period < 1 || period > 730) {
      return NextResponse.json(
        { error: 'Invalid period. Must be between 1 and 730 days.' },
        { status: 400 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // 1. UTILIZATION RATES
    // Calculate how often items are rented vs available
    const items = await prisma.item.findMany({
      where: { userId: user.id },
      include: {
        bookingItems: {
          include: {
            booking: {
              where: {
                dateStart: { gte: startDate },
                status: { in: ['CONFIRMED', 'OUT', 'RETURNED'] },
              },
            },
          },
        },
      },
    });

    const itemUtilization = items.map((item) => {
      const bookings = item.bookingItems
        .filter((bi) => bi.booking)
        .map((bi) => bi.booking);

      // Calculate total days rented
      let totalDaysRented = 0;
      bookings.forEach((booking: any) => {
        const start = new Date(booking.dateStart);
        const end = new Date(booking.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalDaysRented += days;
      });

      const utilizationRate = period > 0 ? (totalDaysRented / period) * 100 : 0;

      return {
        itemName: item.name,
        totalQuantity: item.totalQuantity,
        timesRented: bookings.length,
        daysRented: totalDaysRented,
        utilizationRate: Math.min(utilizationRate, 100).toFixed(1),
      };
    }).sort((a, b) => parseFloat(b.utilizationRate) - parseFloat(a.utilizationRate));

    // 2. REVENUE TRENDS
    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: startDate },
      },
      include: {
        payments: true,
      },
    });

    // Group by date
    const revenueTrends: { [key: string]: number } = {};
    bookings.forEach((booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      const totalPaid = booking.payments.reduce(
        (sum, p) => sum + parseFloat(p.amount.toString()),
        0
      );
      revenueTrends[date] = (revenueTrends[date] || 0) + totalPaid;
    });

    const revenueTrendsArray = Object.keys(revenueTrends)
      .sort()
      .map((date) => ({
        date,
        revenue: revenueTrends[date],
      }));

    // 3. CONVERSION RATES
    // Inquiries to bookings conversion (if public pages exist)
    const inquiries = await prisma.publicInquiry.findMany({
      where: {
        page: {
          userId: user.id,
        },
        createdAt: { gte: startDate },
      },
    });

    const totalInquiries = inquiries.length;
    const convertedInquiries = inquiries.filter((i) => i.status === 'converted').length;
    const conversionRate = totalInquiries > 0 ? (convertedInquiries / totalInquiries) * 100 : 0;

    // Also track quote-to-booking conversion
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((b) => b.status !== 'CANCELLED').length;
    const bookingConversionRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;

    // 4. MOST PROFITABLE ITEMS
    const itemRevenue = await prisma.bookingItem.findMany({
      where: {
        booking: {
          userId: user.id,
          createdAt: { gte: startDate },
        },
      },
      include: {
        item: true,
        booking: {
          include: {
            payments: true,
          },
        },
      },
    });

    const profitabilityMap: { [itemId: string]: { name: string; revenue: number; bookings: number } } = {};

    itemRevenue.forEach((bi) => {
      const itemId = bi.itemId;
      const totalPaid = bi.booking.payments.reduce(
        (sum, p) => sum + parseFloat(p.amount.toString()),
        0
      );

      // Distribute revenue proportionally based on quantity
      const totalItemsInBooking = bi.booking.items.reduce((sum, i) => sum + i.quantity, 0);
      const itemShare = totalItemsInBooking > 0 ? bi.quantity / totalItemsInBooking : 0;
      const itemRevenue = totalPaid * itemShare;

      if (!profitabilityMap[itemId]) {
        profitabilityMap[itemId] = {
          name: bi.item.name,
          revenue: 0,
          bookings: 0,
        };
      }

      profitabilityMap[itemId].revenue += itemRevenue;
      profitabilityMap[itemId].bookings += 1;
    });

    const mostProfitable = Object.values(profitabilityMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((item) => ({
        name: item.name,
        revenue: item.revenue.toFixed(2),
        bookings: item.bookings,
        avgRevenuePerBooking: (item.revenue / item.bookings).toFixed(2),
      }));

    // 5. PAYMENT STATS & INCOME BREAKDOWN
    const allPayments = bookings.flatMap((b) => b.payments);
    const totalRevenue = allPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    const avgPaymentAmount = allPayments.length > 0 ? totalRevenue / allPayments.length : 0;

    const totalBookingValue = bookings.reduce(
      (sum, b) => sum + (b.totalPrice ? parseFloat(b.totalPrice.toString()) : 0),
      0
    );
    const totalPaid = totalRevenue;
    const outstandingBalance = totalBookingValue - totalPaid;
    const collectionRate = totalBookingValue > 0 ? (totalPaid / totalBookingValue) * 100 : 0;

    // 5a. PUBLIC BOOKING PAGE METRICS
    // Get all public inquiries (rental requests from public page)
    const publicPage = await prisma.publicPage.findUnique({
      where: { userId: user.id },
    });

    let publicPageStats = {
      totalInquiries: 0,
      confirmedBookings: 0,
      conversionRate: 0,
      totalRevenue: 0,
      platformFeesCollected: 0,
      netRevenue: 0,
    };

    if (publicPage) {
      const publicInquiries = await prisma.publicInquiry.findMany({
        where: {
          publicPageId: publicPage.id,
          createdAt: { gte: startDate },
        },
      });

      publicPageStats.totalInquiries = publicInquiries.length;
      publicPageStats.confirmedBookings = publicInquiries.filter((i) => i.status === 'confirmed').length;
      publicPageStats.conversionRate = publicPageStats.totalInquiries > 0
        ? (publicPageStats.confirmedBookings / publicPageStats.totalInquiries) * 100
        : 0;

      // Calculate revenue from confirmed public bookings
      const confirmedInquiries = publicInquiries.filter((i) => i.status === 'confirmed');
      publicPageStats.totalRevenue = confirmedInquiries.reduce(
        (sum, i) => sum + (i.totalAmount ? parseFloat(i.totalAmount.toString()) : 0),
        0
      );
      publicPageStats.platformFeesCollected = confirmedInquiries.reduce(
        (sum, i) => sum + (i.platformFee ? parseFloat(i.platformFee.toString()) : 0),
        0
      );
      publicPageStats.netRevenue = publicPageStats.totalRevenue - publicPageStats.platformFeesCollected;
    }

    // 5b. APP BOOKINGS VS PUBLIC PAGE BOOKINGS
    // App bookings = total bookings revenue
    // Public page bookings = revenue from public inquiries
    const appBookings = bookings.length;
    const appRevenue = totalPaid; // All payments through the app
    const publicPageRevenue = publicPageStats.totalRevenue;
    const totalGrossRevenue = appRevenue + publicPageRevenue;

    // 5c. TAX CALCULATION (excludes platform fees - premium feature)
    const taxRate = user.settings?.taxRate ? parseFloat(user.settings.taxRate.toString()) : 0;
    const taxableAmount = totalGrossRevenue - publicPageStats.platformFeesCollected; // Tax applies to revenue, not platform fees
    const taxAmount = taxRate > 0 ? (taxableAmount * taxRate) / 100 : 0;

    // 5d. NET INCOME (after platform fees and tax)
    const platformFeesTotal = publicPageStats.platformFeesCollected;
    const netIncome = totalGrossRevenue - platformFeesTotal - taxAmount;

    // 6. BOOKING STATS BY STATUS
    const bookingsByStatus = {
      CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
      OUT: bookings.filter((b) => b.status === 'OUT').length,
      RETURNED: bookings.filter((b) => b.status === 'RETURNED').length,
      CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
    };

    return NextResponse.json({
      // Utilization Rates
      itemUtilization: itemUtilization.slice(0, 10), // Top 10
      avgUtilizationRate: items.length > 0
        ? (itemUtilization.reduce((sum, item) => sum + parseFloat(item.utilizationRate), 0) / items.length).toFixed(1)
        : '0.0',

      // Revenue Trends
      revenueTrends: revenueTrendsArray,
      totalRevenue: totalRevenue.toFixed(2),
      avgRevenuePerBooking: (totalRevenue / Math.max(bookings.length, 1)).toFixed(2),

      // Conversion Rates
      conversionRate: conversionRate.toFixed(1),
      bookingConversionRate: bookingConversionRate.toFixed(1),
      totalInquiries,
      convertedInquiries,
      totalBookings,
      confirmedBookings,

      // Profitability
      mostProfitable,

      // Payment Stats
      paymentStats: {
        totalPaid: totalPaid.toFixed(2),
        totalBookingValue: totalBookingValue.toFixed(2),
        outstandingBalance: outstandingBalance.toFixed(2),
        collectionRate: collectionRate.toFixed(1),
        avgPaymentAmount: avgPaymentAmount.toFixed(2),
        paymentCount: allPayments.length,
      },

      // Booking Stats
      bookingsByStatus,

      // NEW: Income Breakdown & Public Page Impact
      incomeBreakdown: {
        grossRevenue: totalGrossRevenue.toFixed(2),
        platformFees: platformFeesTotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        taxRate: taxRate.toFixed(2),
        netIncome: netIncome.toFixed(2),
      },

      // NEW: Booking Source Breakdown
      bookingSourceStats: {
        appBookings: appBookings,
        appRevenue: appRevenue.toFixed(2),
        publicPageBookings: publicPageStats.confirmedBookings,
        publicPageRevenue: publicPageRevenue.toFixed(2),
        publicPageConversionRate: publicPageStats.conversionRate.toFixed(1),
      },

      // NEW: Public Page Impact
      publicPageImpact: {
        totalInquiries: publicPageStats.totalInquiries,
        confirmedBookings: publicPageStats.confirmedBookings,
        conversionRate: publicPageStats.conversionRate.toFixed(1),
        grossRevenue: publicPageStats.totalRevenue.toFixed(2),
        platformFees: publicPageStats.platformFeesCollected.toFixed(2),
        netRevenue: publicPageStats.netRevenue.toFixed(2),
        helpedEarn: publicPageStats.netRevenue.toFixed(2), // How much the app helped them make (net from public page)
      },

      // Period info
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
