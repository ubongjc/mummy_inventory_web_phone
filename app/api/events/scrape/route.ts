// API route to manually trigger event scraping (admin only)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { EventScraperManager } from '@/app/lib/events/scraper-manager';

const prisma = new PrismaClient();

/**
 * POST /api/events/scrape
 * Manually trigger event scraping
 * Admin only
 */
export async function POST() {
  try {
    // Check authentication and admin status
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Run scrapers
    console.log('Manual scrape triggered by admin:', user.email);
    const manager = new EventScraperManager();
    const result = await manager.runAll();

    return NextResponse.json({
      success: true,
      result: {
        totalAdded: result.totalAdded,
        totalUpdated: result.totalUpdated,
        totalRemoved: result.totalRemoved,
        sourceLogs: result.sourceLogs,
        errorCount: result.errors.length,
        errors: result.errors.slice(0, 10), // Return first 10 errors only
      },
    });
  } catch (error) {
    console.error('Error running scrapers:', error);
    return NextResponse.json(
      {
        error: 'Failed to run scrapers',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
