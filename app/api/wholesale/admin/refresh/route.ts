import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { queueRefreshJob } from "@/app/lib/wholesale/jobs/queue";

/**
 * POST /api/wholesale/admin/refresh
 *
 * Trigger a manual crawl/refresh of wholesale supplier data.
 *
 * Request Body:
 * - manual_refresh: true
 * - sources: Optional array of specific sources to crawl
 * - states: Optional array of specific states to focus on
 * - full_crawl: Optional boolean for full vs incremental crawl
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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

    const body = await request.json();
    const {
      manual_refresh,
      sources,
      states,
      full_crawl = false,
    } = body;

    // Default sources if not specified
    const sourcesToCrawl = sources || ["maps", "directory"];

    // Queue the refresh job
    const { jobId, runId } = await queueRefreshJob({
      sources: sourcesToCrawl,
      states: states || undefined,
      fullCrawl: full_crawl,
      triggeredBy: session.user.id,
    });

    // Log the refresh request
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "wholesale_refresh_triggered",
        entityType: "wholesale_supplier",
        entityId: runId,
        details: {
          manual_refresh,
          sources: sourcesToCrawl,
          states: states || "all",
          full_crawl,
          jobId,
        },
      },
    });

    // Estimate duration based on sources and full_crawl
    const estimatedMinutes = full_crawl
      ? sourcesToCrawl.length * 15
      : sourcesToCrawl.length * 8;

    return NextResponse.json({
      run_id: runId,
      job_id: jobId,
      status: "queued",
      estimated_duration_minutes: estimatedMinutes,
      sources_queued: sourcesToCrawl,
      states_queued: states || "all",
      progress_url: `/api/wholesale/admin/refresh/${runId}`,
      message: "Refresh job queued successfully. Processing will begin shortly.",
    });
  } catch (error) {
    console.error("Error triggering refresh:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
