import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { isAdmin } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(session.user.id);
    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // Default to 30 days

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user growth over time
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Aggregate by day
    const dailyUserGrowth = users.reduce((acc: any, user: { createdAt: Date }) => {
      const date = new Date(user.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += 1;
      return acc;
    }, {});

    // Get booking statistics
    const totalBookings = await prisma.booking.count();
    const bookingsInPeriod = await prisma.booking.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get bookings by status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get revenue data (bookings by price)
    const bookingsWithRevenue = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    // Calculate daily revenue
    const dailyRevenue = bookingsWithRevenue.reduce((acc: any, booking: any) => {
      const date = new Date(booking.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      // Calculate booking revenue - convert to number and sanitize
      const revenue = booking.items.reduce((sum: number, bi: any) => {
        const price = Number(bi.item?.price) || 0;
        // Sanity check: price should be reasonable (< 100 million)
        const sanitizedPrice = price > 100000000 ? 0 : price;
        return sum + sanitizedPrice;
      }, 0);
      acc[date] += revenue;
      return acc;
    }, {});

    // Get items usage statistics
    const itemsUsage = await prisma.bookingItem.groupBy({
      by: ["itemId"],
      _count: true,
      orderBy: {
        _count: {
          itemId: "desc",
        },
      },
      take: 10,
    });

    // Get item names
    const itemIds = itemsUsage.map((iu: any) => iu.itemId);
    const items = await prisma.item.findMany({
      where: {
        id: {
          in: itemIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const itemsWithNames = itemsUsage.map((iu: any) => {
      const item = items.find((i: any) => i.id === iu.itemId);
      return {
        name: item?.name || "Unknown",
        bookings: iu._count,
      };
    });

    // Get public page views (inquiries as proxy)
    const inquiries = await prisma.publicInquiry.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const dailyInquiries = inquiries.reduce((acc: any, inquiry: { createdAt: Date }) => {
      const date = new Date(inquiry.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += 1;
      return acc;
    }, {});

    // Get subscription stats over time
    const allSubscriptions = await prisma.subscription.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by plan type (derived from status) and date
    const subscriptionsByPlanAndDate = allSubscriptions.reduce((acc: any, sub: { status: string; createdAt: Date }) => {
      const date = new Date(sub.createdAt).toISOString().split("T")[0];
      // Determine plan type from status
      const planType = ['active', 'trialing'].includes(sub.status) ? 'premium' : 'free';
      const key = `${planType}-${date}`;
      if (!acc[key]) {
        acc[key] = { plan: planType, date, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    }, {});

    return NextResponse.json({
      userGrowth: Object.entries(dailyUserGrowth).map(([date, count]) => ({
        date,
        users: count,
      })),
      bookings: {
        total: totalBookings,
        inPeriod: bookingsInPeriod,
        byStatus: bookingsByStatus.map((b: any) => ({
          status: b.status,
          count: b._count,
        })),
      },
      revenue: Object.entries(dailyRevenue).map(([date, amount]) => ({
        date,
        amount: Number(amount) || 0,
      })),
      topItems: itemsWithNames,
      inquiries: Object.entries(dailyInquiries).map(([date, count]) => ({
        date,
        count,
      })),
      subscriptions: Object.values(subscriptionsByPlanAndDate),
    });
  } catch (error: any) {
    console.error("[ERROR] Failed to fetch analytics", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
