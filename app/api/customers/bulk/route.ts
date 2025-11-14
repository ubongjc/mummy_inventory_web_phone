import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { prisma } from "@/app/lib/prisma";
import { secureLog } from "@/app/lib/security";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only delete customers belonging to current user
    const result = await prisma.customer.deleteMany({
      where: { userId: session.user.id }
    });

    return NextResponse.json({
      message: "All your customers deleted successfully",
      count: result.count,
    });
  } catch (error: any) {
    secureLog("[ERROR] Failed to delete customers", { error: error.message });
    return NextResponse.json(
      { error: "Failed to delete customers" },
      { status: 500 }
    );
  }
}
