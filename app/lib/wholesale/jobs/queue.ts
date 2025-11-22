/**
 * Job Queue for Wholesale Supplier Refresh
 *
 * Uses Bull for background job processing with Redis.
 */

import Bull from "bull";
import { ScraperOrchestrator } from "../scrapers/orchestrator";
import { exportToJsonl, exportToCsv, generateQualityReport } from "../export";
import { prisma } from "@/app/lib/prisma";

export interface RefreshJobData {
  runId: string;
  sources?: string[];
  states?: string[];
  categories?: string[];
  fullCrawl?: boolean;
  triggeredBy?: string;
}

export interface RefreshJobResult {
  runId: string;
  success: boolean;
  totalRecordsFound: number;
  totalRecordsNew: number;
  totalRecordsUpdated: number;
  errors: string[];
  duration: number;
}

// Create Bull queue
// Redis connection from environment variable
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const wholesaleRefreshQueue = new Bull<RefreshJobData>(
  "wholesale-refresh",
  redisUrl,
  {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 60000, // 1 minute
      },
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: false, // Keep failed jobs for debugging
    },
  }
);

/**
 * Process refresh jobs
 */
wholesaleRefreshQueue.process(async (job) => {
  const { runId, sources, states, categories, fullCrawl } = job.data;

  console.log(`[Queue] Processing wholesale refresh job ${runId}`);

  const startTime = Date.now();

  try {
    // Update job progress
    await job.progress(10);

    // Create orchestrator
    const orchestrator = new ScraperOrchestrator();

    // Run scrapers
    await job.progress(20);
    console.log(`[Queue] Starting scrapers...`);

    const result = await orchestrator.run({
      sources: sources as any,
      states,
      categories,
      fullCrawl,
    });

    await job.progress(60);

    // Run deduplication
    console.log(`[Queue] Running deduplication...`);
    await orchestrator.runDeduplication();

    await job.progress(70);

    // Export data
    console.log(`[Queue] Exporting data...`);
    const suppliers = await prisma.wholesaleSupplier.findMany({
      where: {
        approvalStatus: "approved",
        isBlacklisted: false,
      },
      orderBy: { confidence: "desc" },
    });

    await exportToJsonl(suppliers);
    await exportToCsv(suppliers);
    await generateQualityReport(suppliers);

    await job.progress(90);

    // Log completion
    await prisma.activityLog.create({
      data: {
        userId: "system",
        action: "wholesale_refresh_completed",
        entityType: "wholesale_supplier",
        entityId: runId,
        details: {
          runId,
          totalRecordsFound: result.totalRecordsFound,
          totalRecordsNew: result.totalRecordsNew,
          totalRecordsUpdated: result.totalRecordsUpdated,
          success: result.success,
          duration: Date.now() - startTime,
        },
      },
    });

    await job.progress(100);

    const jobResult: RefreshJobResult = {
      runId,
      success: result.success,
      totalRecordsFound: result.totalRecordsFound,
      totalRecordsNew: result.totalRecordsNew,
      totalRecordsUpdated: result.totalRecordsUpdated,
      errors: result.errors,
      duration: Date.now() - startTime,
    };

    console.log(`[Queue] Refresh job ${runId} completed successfully`);

    return jobResult;
  } catch (error) {
    console.error(`[Queue] Refresh job ${runId} failed:`, error);

    // Log failure
    await prisma.activityLog.create({
      data: {
        userId: "system",
        action: "wholesale_refresh_failed",
        entityType: "wholesale_supplier",
        entityId: runId,
        details: {
          runId,
          error: String(error),
          duration: Date.now() - startTime,
        },
      },
    });

    throw error;
  }
});

/**
 * Event handlers
 */
wholesaleRefreshQueue.on("completed", async (job, result: RefreshJobResult) => {
  console.log(
    `[Queue] Job ${job.id} completed: ${result.totalRecordsFound} found, ${result.totalRecordsNew} new`
  );

  // Send email notification
  try {
    const { sendRefreshNotification } = await import("../notifications/email");
    await sendRefreshNotification({
      runId: result.runId,
      trigger: job.data.triggeredBy || "automated",
      totalRecordsFound: result.totalRecordsFound,
      totalRecordsNew: result.totalRecordsNew,
      totalRecordsUpdated: result.totalRecordsUpdated,
      duration: result.duration,
      success: result.success,
      errors: result.errors,
    });
  } catch (error) {
    console.error("[Queue] Error sending notification:", error);
  }
});

wholesaleRefreshQueue.on("failed", async (job, error) => {
  console.error(`[Queue] Job ${job?.id} failed:`, error);

  // Send failure notification
  if (job) {
    try {
      const { sendRefreshNotification } = await import("../notifications/email");
      await sendRefreshNotification({
        runId: job.data.runId,
        trigger: job.data.triggeredBy || "automated",
        totalRecordsFound: 0,
        totalRecordsNew: 0,
        totalRecordsUpdated: 0,
        duration: 0,
        success: false,
        errors: [String(error)],
      });
    } catch (notifError) {
      console.error("[Queue] Error sending failure notification:", notifError);
    }
  }
});

wholesaleRefreshQueue.on("error", (error) => {
  console.error("[Queue] Queue error:", error);
});

/**
 * Add a refresh job to the queue
 */
export async function queueRefreshJob(
  data: Omit<RefreshJobData, "runId">
): Promise<{ jobId: string; runId: string }> {
  const runId = `run_${new Date().toISOString().replace(/[:.]/g, "_")}`;

  const job = await wholesaleRefreshQueue.add(
    {
      runId,
      ...data,
    },
    {
      jobId: runId,
    }
  );

  console.log(`[Queue] Queued refresh job ${runId}`);

  return { jobId: job.id.toString(), runId };
}

/**
 * Get job status
 */
export async function getJobStatus(
  jobId: string
): Promise<{
  state: string;
  progress: number;
  result?: RefreshJobResult;
  error?: string;
}> {
  const job = await wholesaleRefreshQueue.getJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const state = await job.getState();
  const progress = (job.progress() as number) || 0;
  const result = (await job.finished()) as RefreshJobResult;

  return {
    state,
    progress,
    result,
    error: job.failedReason,
  };
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string): Promise<void> {
  const job = await wholesaleRefreshQueue.getJob(jobId);

  if (job) {
    await job.remove();
    console.log(`[Queue] Cancelled job ${jobId}`);
  }
}

/**
 * Get queue stats
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed] = await Promise.all([
    wholesaleRefreshQueue.getWaitingCount(),
    wholesaleRefreshQueue.getActiveCount(),
    wholesaleRefreshQueue.getCompletedCount(),
    wholesaleRefreshQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
  };
}

/**
 * Clean up old jobs
 */
export async function cleanQueue() {
  await wholesaleRefreshQueue.clean(7 * 24 * 60 * 60 * 1000); // 7 days
  console.log("[Queue] Cleaned old jobs");
}
