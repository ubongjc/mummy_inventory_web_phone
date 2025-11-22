/**
 * Wholesale Supplier Refresh Scheduler
 *
 * Automated cron jobs to refresh supplier data twice monthly:
 * - 1st of each month at 04:00 Africa/Lagos
 * - 15th of each month at 04:00 Africa/Lagos
 *
 * Uses node-cron for scheduling.
 */

import cron from "node-cron";
import { queueRefreshJob } from "../jobs/queue";
import { prisma } from "@/app/lib/prisma";

export class WholesaleRefreshScheduler {
  private jobs: cron.ScheduledTask[] = [];

  constructor() {
    // No orchestrator needed - using job queue instead
  }

  /**
   * Start automated refresh jobs
   */
  start(): void {
    console.log("[Scheduler] Starting wholesale supplier refresh scheduler...");

    // Job 1: 1st of month at 04:00 Africa/Lagos
    // Cron expression: "0 4 1 * *" (minute hour day-of-month month day-of-week)
    const job1 = cron.schedule(
      "0 4 1 * *",
      async () => {
        await this.runScheduledRefresh("monthly-1st");
      },
      {
        timezone: "Africa/Lagos",
      }
    );

    // Job 2: 15th of month at 04:00 Africa/Lagos
    const job2 = cron.schedule(
      "0 4 15 * *",
      async () => {
        await this.runScheduledRefresh("monthly-15th");
      },
      {
        timezone: "Africa/Lagos",
      }
    );

    this.jobs.push(job1, job2);

    console.log(
      "[Scheduler] Scheduled refresh jobs: 1st & 15th of each month at 04:00 Africa/Lagos"
    );
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    console.log("[Scheduler] Stopping scheduler...");
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
  }

  /**
   * Run a scheduled refresh
   */
  private async runScheduledRefresh(trigger: string): Promise<void> {
    console.log(`[Scheduler] Starting scheduled refresh: ${trigger}`);

    try {
      // Log start
      await this.logRefreshEvent(trigger, "started");

      // Queue the refresh job
      const { jobId, runId } = await queueRefreshJob({
        sources: ["maps", "directory"],
        fullCrawl: false, // Incremental update
        triggeredBy: `cron-${trigger}`,
      });

      console.log(
        `[Scheduler] Scheduled refresh ${trigger} queued as job ${jobId} (run ${runId})`
      );

      // Log that job was queued
      await this.logRefreshEvent(trigger, "completed", {
        jobId,
        runId,
        status: "queued",
      });
    } catch (error) {
      console.error(`[Scheduler] Error in scheduled refresh:`, error);
      await this.logRefreshEvent(trigger, "failed", null, String(error));
    }
  }

  /**
   * Log refresh event
   */
  private async logRefreshEvent(
    trigger: string,
    status: "started" | "completed" | "failed",
    result?: any,
    error?: string
  ): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          userId: "system", // System-initiated
          action: `wholesale_refresh_${status}`,
          entityType: "wholesale_supplier",
          entityId: trigger,
          details: {
            trigger,
            status,
            result,
            error,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (err) {
      console.error("[Scheduler] Error logging refresh event:", err);
    }
  }

  /**
   * Manually trigger refresh (for testing)
   */
  async triggerManualRefresh(): Promise<any> {
    return this.runScheduledRefresh("manual-trigger");
  }
}

/**
 * Initialize and start scheduler
 * Call this from your app initialization
 */
export function initWholesaleScheduler(): WholesaleRefreshScheduler {
  const scheduler = new WholesaleRefreshScheduler();
  scheduler.start();
  return scheduler;
}

/**
 * Example usage in app startup:
 *
 * // In your Next.js app (e.g., middleware or API route)
 * import { initWholesaleScheduler } from '@/app/lib/wholesale/cron/scheduler';
 *
 * // Start scheduler on app init
 * if (process.env.NODE_ENV === 'production') {
 *   initWholesaleScheduler();
 * }
 */
