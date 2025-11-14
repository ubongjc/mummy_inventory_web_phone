import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { isAdmin } from "@/app/lib/auth";
import { secureLog } from "@/app/lib/security";

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

    // Get user statistics
    const totalUsers = await prisma.user.count();

    // Count users by plan
    const proUsers = await prisma.subscription.count({
      where: { plan: "pro", status: "active" },
    });
    const businessUsers = await prisma.subscription.count({
      where: { plan: "business", status: "active" },
    });

    // Free users = all users without pro/business subscriptions
    const freeUsers = totalUsers - proUsers - businessUsers;

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get public pages count
    const publicPages = await prisma.publicPage.count();
    const activePublicPages = await prisma.publicPage.count({
      where: { isActive: true },
    });

    // Get inquiries count
    const totalInquiries = await prisma.publicInquiry.count();
    const newInquiries = await prisma.publicInquiry.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      users: {
        total: totalUsers,
        free: freeUsers,
        pro: proUsers,
        business: businessUsers,
        newThisMonth: newUsers,
      },
      publicPages: {
        total: publicPages,
        active: activePublicPages,
      },
      inquiries: {
        total: totalInquiries,
        newThisMonth: newInquiries,
      },
    });
  } catch (error: any) {
    secureLog("[ERROR] Failed to fetch admin stats", { error: error.message });
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
