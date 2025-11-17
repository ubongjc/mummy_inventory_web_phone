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

    // Update or create subscription with new plan
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: { plan },
      create: {
        userId,
        plan,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("Error updating user plan:", error);
    return NextResponse.json(
      { error: "Failed to update user plan" },
      { status: 500 }
    );
  }
}
