import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

    // Get user statistics
    const totalUsers = await prisma.user.count();
    const freeUsers = await prisma.subscription.count({
      where: { plan: "free", status: "active" },
    });
    const proUsers = await prisma.subscription.count({
      where: { plan: "pro", status: "active" },
    });
    const businessUsers = await prisma.subscription.count({
      where: { plan: "business", status: "active" },
    });

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
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
