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

    // Only delete items belonging to current user
    const result = await prisma.item.deleteMany({
      where: { userId: session.user.id }
    });

    return NextResponse.json({
      message: "All your items deleted successfully",
      count: result.count,
    });
  } catch (error: any) {
    secureLog("[ERROR] Failed to delete items", { error: error.message });
    return NextResponse.json(
      { error: "Failed to delete items" },
      { status: 500 }
    );
  }
}
