import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/wholesale/admin/stats
 *
 * Get comprehensive system statistics and data quality metrics.
 */
export async function GET(request: NextRequest) {
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

    // Execute multiple queries in parallel
    const [
      totalSuppliers,
      approvedSuppliers,
      pendingSuppliers,
      rejectedSuppliers,
      blacklistedSuppliers,
      confidenceStats,
      statesCovered,
      recentSuppliers,
      sourceCounts,
    ] = await Promise.all([
      // Total suppliers
      prisma.wholesaleSupplier.count(),

      // Approved suppliers
      prisma.wholesaleSupplier.count({
        where: { approvalStatus: "approved", isBlacklisted: false },
      }),

      // Pending approval
      prisma.wholesaleSupplier.count({
        where: { approvalStatus: "pending", isBlacklisted: false },
      }),

      // Rejected
      prisma.wholesaleSupplier.count({
        where: { approvalStatus: "rejected" },
      }),

      // Blacklisted
      prisma.wholesaleSupplier.count({
        where: { isBlacklisted: true },
      }),

      // Confidence score statistics
      prisma.wholesaleSupplier.aggregate({
        where: { isBlacklisted: false },
        _avg: { confidence: true },
        _min: { confidence: true },
        _max: { confidence: true },
      }),

      // States covered
      prisma.wholesaleSupplier.groupBy({
        by: ["state"],
        where: {
          approvalStatus: "approved",
          isBlacklisted: false,
          state: { not: null },
        },
        _count: { id: true },
      }),

      // Recently added suppliers (last 7 days)
      prisma.wholesaleSupplier.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Suppliers by source platform
      prisma.wholesaleSupplier.groupBy({
        by: ["sourcePlatform"],
        where: {
          approvalStatus: "approved",
          isBlacklisted: false,
        },
        _count: { id: true },
        _avg: { confidence: true },
      }),
    ]);

    // Calculate confidence distribution
    const allSuppliers = await prisma.wholesaleSupplier.findMany({
      where: { isBlacklisted: false },
      select: { confidence: true, verifications: true },
    });

    let highConfidence = 0;
    let mediumConfidence = 0;
    let lowConfidence = 0;
    let explicitWholesale = 0;

    allSuppliers.forEach((s) => {
      const conf = parseFloat(s.confidence.toString());
      if (conf >= 0.8) highConfidence++;
      else if (conf >= 0.6) mediumConfidence++;
      else lowConfidence++;

      const verifications = s.verifications as any;
      if (verifications?.explicit_wholesale_language) {
        explicitWholesale++;
      }
    });

    // Calculate data completeness
    const suppliersWithPhone = await prisma.wholesaleSupplier.count({
      where: {
        approvalStatus: "approved",
        isBlacklisted: false,
        phones: { not: Prisma.DbNull },
      },
    });

    const suppliersWithEmail = await prisma.wholesaleSupplier.count({
      where: {
        approvalStatus: "approved",
        isBlacklisted: false,
        emails: { not: Prisma.DbNull },
      },
    });

    const suppliersWithWebsite = await prisma.wholesaleSupplier.count({
      where: {
        approvalStatus: "approved",
        isBlacklisted: false,
        websites: { not: Prisma.DbNull },
      },
    });

    // Get recent crawl logs
    const recentCrawlLogs = await prisma.wholesaleSupplierSourceLog.findMany({
      orderBy: { crawledAt: "desc" },
      take: 5,
    });

    // Format source performance
    const sourcePerformance = sourceCounts.map((s) => ({
      platform: s.sourcePlatform,
      supplier_count: s._count.id,
      avg_confidence: s._avg.confidence
        ? parseFloat(s._avg.confidence.toString())
        : 0,
    }));

    return NextResponse.json({
      overview: {
        total_suppliers: totalSuppliers,
        approved: approvedSuppliers,
        pending_approval: pendingSuppliers,
        rejected: rejectedSuppliers,
        blacklisted: blacklistedSuppliers,
        recently_added_7d: recentSuppliers,
      },
      confidence_distribution: {
        high: { count: highConfidence, percentage: (highConfidence / allSuppliers.length) * 100 },
        medium: { count: mediumConfidence, percentage: (mediumConfidence / allSuppliers.length) * 100 },
        low: { count: lowConfidence, percentage: (lowConfidence / allSuppliers.length) * 100 },
        avg: confidenceStats._avg.confidence
          ? parseFloat(confidenceStats._avg.confidence.toString())
          : 0,
        min: confidenceStats._min.confidence
          ? parseFloat(confidenceStats._min.confidence.toString())
          : 0,
        max: confidenceStats._max.confidence
          ? parseFloat(confidenceStats._max.confidence.toString())
          : 0,
      },
      geographic_coverage: {
        states_covered: statesCovered.length,
        total_states: 37,
        coverage_percentage: (statesCovered.length / 37) * 100,
        states: statesCovered
          .map((s) => ({
            state: s.state,
            supplier_count: s._count.id,
          }))
          .sort((a, b) => b.supplier_count - a.supplier_count),
      },
      data_quality: {
        explicit_wholesale_language: {
          count: explicitWholesale,
          percentage: (explicitWholesale / allSuppliers.length) * 100,
        },
        contact_coverage: {
          phone: {
            count: suppliersWithPhone,
            percentage: (suppliersWithPhone / approvedSuppliers) * 100,
          },
          email: {
            count: suppliersWithEmail,
            percentage: (suppliersWithEmail / approvedSuppliers) * 100,
          },
          website: {
            count: suppliersWithWebsite,
            percentage: (suppliersWithWebsite / approvedSuppliers) * 100,
          },
        },
      },
      source_performance: sourcePerformance,
      recent_crawls: recentCrawlLogs.map((log) => ({
        run_id: log.runId,
        source: log.sourcePlatform,
        status: log.status,
        records_found: log.recordsFound,
        records_new: log.recordsNew,
        records_updated: log.recordsUpdated,
        crawled_at: log.crawledAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { Prisma } from "@prisma/client";
