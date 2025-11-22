// Cron job endpoint for daily event scraping
// This should be called daily by a cron service (Vercel Cron, etc.)

import { NextRequest, NextResponse } from 'next/server';
import { EventScraperManager } from '@/app/lib/events/scraper-manager';

/**
 * GET /api/cron/scrape-events
 * Daily cron job to scrape and refresh Nigerian events
 * Should be configured in vercel.json or cron service
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization (Vercel Cron sends a special header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting daily event scraping cron job...');
    const manager = new EventScraperManager();
    const result = await manager.runAll();

    console.log('Daily event scraping complete:', {
      added: result.totalAdded,
      updated: result.totalUpdated,
      removed: result.totalRemoved,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: {
        totalAdded: result.totalAdded,
        totalUpdated: result.totalUpdated,
        totalRemoved: result.totalRemoved,
        errorCount: result.errors.length,
      },
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
