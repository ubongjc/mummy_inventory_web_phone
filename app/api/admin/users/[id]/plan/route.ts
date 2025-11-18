import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { plan } = body;

    if (!plan || (plan !== "free" && plan !== "premium")) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Update or create subscription with new status-based approach
    const isPremium = plan === "premium";
    const status = isPremium ? "active" : "canceled";

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        status,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      create: {
        userId,
        stripeCustomerId: `admin_${userId}`, // Placeholder for admin-created subscriptions
        status,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Update user's isPremium flag
    await prisma.user.update({
      where: { id: userId },
      data: { isPremium },
    });

    return NextResponse.json({ success: true, subscription, isPremium });
  } catch (error) {
    console.error("Error updating user plan:", error);
    return NextResponse.json(
      { error: "Failed to update user plan" },
      { status: 500 }
    );
  }
}
