import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/wholesale/admin/approvals
 *
 * Get list of suppliers awaiting approval (low confidence or pending review).
 *
 * Query Parameters:
 * - status: Filter by approval status (pending, approved, rejected)
 * - page: Page number (1-indexed)
 * - limit: Results per page (max 100)
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get("status") || "pending";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    // Build WHERE clause
    const where: any = {
      approvalStatus: statusFilter,
      isBlacklisted: false,
    };

    // For pending, also include low-confidence suppliers
    if (statusFilter === "pending") {
      where.OR = [
        { approvalStatus: "pending" },
        { confidence: { lt: 0.6 }, approvalStatus: "pending" },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [suppliers, totalCount] = await Promise.all([
      prisma.wholesaleSupplier.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.wholesaleSupplier.count({ where }),
    ]);

    // Format response
    const pendingApprovals = suppliers.map((s) => {
      // Determine review reason
      let needsReviewReason = "";
      const conf = parseFloat(s.confidence.toString());
      const verifications = s.verifications as any;

      if (conf < 0.6) {
        needsReviewReason = `Low confidence (${(conf * 100).toFixed(0)}%)`;
        if (!verifications?.explicit_wholesale_language) {
          needsReviewReason += " - no explicit wholesale language";
        }
      } else if (!verifications?.explicit_wholesale_language) {
        needsReviewReason = "No explicit wholesale language detected";
      } else {
        needsReviewReason = "Manual review requested";
      }

      return {
        id: s.id,
        supplier_id: s.supplierId,
        company_name: s.companyName,
        confidence: conf,
        state: s.state,
        categories: s.categories,
        phones: s.phones,
        emails: s.emails,
        verifications: s.verifications,
        needs_review_reason: needsReviewReason,
        submitted_at: s.createdAt.toISOString(),
        last_seen_at: s.lastSeenAt.toISOString(),
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      pending_approvals: pendingApprovals,
      pagination: {
        page,
        limit,
        total_results: totalCount,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching approval queue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
