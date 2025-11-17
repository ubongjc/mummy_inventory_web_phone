import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth.config";
import { getUserUsageStats } from "@/app/lib/limits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usage = await getUserUsageStats(session.user.id);

    return NextResponse.json(usage);
  } catch (error: any) {
    console.error("[ERROR] Failed to fetch usage stats", error);
    return NextResponse.json(
      { error: "Failed to fetch usage stats" },
      { status: 500 }
    );
  }
}
