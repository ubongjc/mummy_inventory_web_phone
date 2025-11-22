import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/wholesale/admin/refresh/:run_id
 *
 * Get status of a running or completed refresh job.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { run_id: string } }
) {
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

    const { run_id } = params;

    // Get all source logs for this run
    const sourceLogs = await prisma.wholesaleSupplierSourceLog.findMany({
      where: { runId: run_id },
      orderBy: { crawledAt: "asc" },
    });

    if (sourceLogs.length === 0) {
      return NextResponse.json(
        { error: "Refresh run not found" },
        { status: 404 }
      );
    }

    // Calculate progress statistics
    const sourcesTotal = sourceLogs.length;
    const sourcesCompleted = sourceLogs.filter(
      (log) => log.status === "completed"
    ).length;
    const sourcesFailed = sourceLogs.filter(
      (log) => log.status === "failed"
    ).length;
    const sourcesRunning = sourceLogs.filter(
      (log) => log.status === "running"
    ).length;
    const sourcesPending = sourceLogs.filter(
      (log) => log.status === "pending"
    ).length;

    const recordsFound = sourceLogs.reduce(
      (sum, log) => sum + (log.recordsFound || 0),
      0
    );
    const recordsNew = sourceLogs.reduce(
      (sum, log) => sum + (log.recordsNew || 0),
      0
    );
    const recordsUpdated = sourceLogs.reduce(
      (sum, log) => sum + (log.recordsUpdated || 0),
      0
    );

    // Determine overall status
    let overallStatus: string;
    if (sourcesPending === sourcesTotal) {
      overallStatus = "started";
    } else if (sourcesRunning > 0 || sourcesPending > 0) {
      overallStatus = "running";
    } else if (sourcesFailed === sourcesTotal) {
      overallStatus = "failed";
    } else {
      overallStatus = "completed";
    }

    // Find current source being processed
    const currentSource = sourceLogs.find((log) => log.status === "running");

    // Calculate timing
    const startedAt = sourceLogs[0].crawledAt;
    const latestLog = sourceLogs[sourceLogs.length - 1];
    const completedAt =
      overallStatus === "completed" || overallStatus === "failed"
        ? latestLog.crawledAt
        : null;

    const durationSeconds = completedAt
      ? Math.floor(
          (completedAt.getTime() - startedAt.getTime()) / 1000
        )
      : Math.floor((Date.now() - startedAt.getTime()) / 1000);

    // Collect errors
    const errors = sourceLogs
      .filter((log) => log.errorMessage)
      .map((log) => ({
        source: log.sourcePlatform,
        url: log.sourceUrl,
        error: log.errorMessage,
        timestamp: log.crawledAt.toISOString(),
      }));

    return NextResponse.json({
      run_id,
      status: overallStatus,
      progress: {
        sources_completed: sourcesCompleted,
        sources_total: sourcesTotal,
        sources_failed: sourcesFailed,
        sources_running: sourcesRunning,
        sources_pending: sourcesPending,
        records_found: recordsFound,
        records_new: recordsNew,
        records_updated: recordsUpdated,
        records_merged: 0, // TODO: Track merges separately
        current_source: currentSource?.sourcePlatform || null,
        current_source_progress: currentSource ? "processing" : null,
      },
      started_at: startedAt.toISOString(),
      completed_at: completedAt?.toISOString() || null,
      duration_seconds: durationSeconds,
      errors,
      source_details: sourceLogs.map((log) => ({
        source: log.sourcePlatform,
        url: log.sourceUrl,
        status: log.status,
        http_status: log.httpStatus,
        parse_success: log.parseSuccess,
        records_found: log.recordsFound,
        records_new: log.recordsNew,
        records_updated: log.recordsUpdated,
        error: log.errorMessage,
        crawled_at: log.crawledAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching refresh status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
