import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * POST /api/wholesale/admin/blacklist
 *
 * Blacklist a supplier (spam, invalid, duplicate, etc.).
 *
 * Request Body:
 * - supplier_id: ID of supplier to blacklist
 * - reason: Reason for blacklisting
 * - pattern_type: Optional pattern type (spam, duplicate, invalid_data, etc.)
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
    const { supplier_id, reason, pattern_type } = body;

    // Validate input
    if (!supplier_id || !reason) {
      return NextResponse.json(
        { error: "supplier_id and reason are required" },
        { status: 400 }
      );
    }

    // Get supplier
    const supplier = await prisma.wholesaleSupplier.findUnique({
      where: { id: supplier_id },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Update supplier to blacklisted
    const updatedSupplier = await prisma.wholesaleSupplier.update({
      where: { id: supplier_id },
      data: {
        isBlacklisted: true,
        blacklistReason: reason,
        approvalStatus: "rejected",
        updatedAt: new Date(),
      },
    });

    // Create blacklist record
    await prisma.wholesaleSupplierBlacklist.create({
      data: {
        supplierId: supplier_id,
        reason,
        patternType: pattern_type || "other",
        blacklistedBy: session.user.id,
      },
    });

    // Extract pattern for future matching
    let pattern = null;
    if (pattern_type === "spam") {
      // Create pattern from company name or phone
      pattern = {
        company_name: supplier.companyName,
        phones: supplier.phones,
      };
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "wholesale_supplier_blacklist",
        entityType: "wholesale_supplier",
        entityId: supplier_id,
        details: {
          company_name: supplier.companyName,
          reason,
          pattern_type,
          pattern,
        },
      },
    });

    return NextResponse.json({
      success: true,
      blacklisted_supplier: {
        id: updatedSupplier.id,
        company_name: updatedSupplier.companyName,
        blacklist_reason: updatedSupplier.blacklistReason,
        blacklisted_at: updatedSupplier.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error blacklisting supplier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wholesale/admin/blacklist
 *
 * Get list of blacklisted suppliers.
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

    // Get all blacklisted suppliers
    const blacklistedSuppliers = await prisma.wholesaleSupplier.findMany({
      where: {
        isBlacklisted: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 100,
    });

    // Format response
    const blacklist = blacklistedSuppliers.map((s) => ({
      id: s.id,
      company_name: s.companyName,
      phones: s.phones,
      emails: s.emails,
      state: s.state,
      blacklist_reason: s.blacklistReason,
      blacklisted_at: s.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      blacklist,
      total: blacklist.length,
    });
  } catch (error) {
    console.error("Error fetching blacklist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
