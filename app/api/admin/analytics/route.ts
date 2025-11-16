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
    const userGrowth = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: true,
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Aggregate by day
    const dailyUserGrowth = userGrowth.reduce((acc: any, curr: { createdAt: Date; _count: number }) => {
      const date = new Date(curr.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += curr._count;
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
      // Calculate booking revenue
      const revenue = booking.items.reduce((sum: number, bi: any) => {
        return sum + (bi.item?.price || 0);
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
    const inquiriesByDay = await prisma.publicInquiry.groupBy({
      by: ["createdAt"],
      _count: true,
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const dailyInquiries = inquiriesByDay.reduce((acc: any, curr: { createdAt: Date; _count: number }) => {
      const date = new Date(curr.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += curr._count;
      return acc;
    }, {});

    // Get subscription stats over time
    const subscriptions = await prisma.subscription.groupBy({
      by: ["plan", "createdAt"],
      _count: true,
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

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
        amount,
      })),
      topItems: itemsWithNames,
      inquiries: Object.entries(dailyInquiries).map(([date, count]) => ({
        date,
        count,
      })),
      subscriptions: subscriptions.map((s: any) => ({
        plan: s.plan,
        date: new Date(s.createdAt).toISOString().split("T")[0],
        count: s._count,
      })),
    });
  } catch (error: any) {
    console.error("[ERROR] Failed to fetch analytics", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
