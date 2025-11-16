import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { isAdmin } from "@/app/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all users with relevant information including subscription
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        logoUrl: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to flatten the subscription plan
    const transformedUsers = users.map((user: typeof users[number]) => ({
      ...user,
      plan: user.subscription?.plan || "free",
      subscription: undefined, // Remove the nested subscription object
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * Update a user's subscription plan and status
 * Admin only
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, plan, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate plan if provided
    if (plan && !["free", "pro", "business"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan. Must be: free, pro, or business" }, { status: 400 });
    }

    // Validate status if provided
    if (status && !["active", "trialing", "past_due", "canceled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be: active, trialing, past_due, or canceled" }, { status: 400 });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from removing their own admin status if they're trying to change their own subscription
    if (userId === session.user.id && plan === "free") {
      return NextResponse.json({
        error: "Cannot downgrade your own admin account to free plan"
      }, { status: 403 });
    }

    // Find or create subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    let subscription;
    if (existingSubscription) {
      // Update existing subscription
      subscription = await prisma.subscription.update({
        where: { userId },
        data: {
          ...(plan && { plan }),
          ...(status && { status }),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new subscription
      subscription = await prisma.subscription.create({
        data: {
          userId,
          plan: plan || "free",
          status: status || "active",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "User subscription updated successfully",
      subscription,
    });
  } catch (error: any) {
    console.error("Error updating user subscription:", error);
    return NextResponse.json(
      { error: "Failed to update user subscription", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users
 * Delete a user account and all their data
 * Admin only
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json({
        error: "Cannot delete your own admin account. Use the account settings page instead."
      }, { status: 403 });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the user (cascade will handle all related data)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: `User ${userExists.email} and all associated data deleted successfully`,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user", details: error.message },
      { status: 500 }
    );
  }
}
