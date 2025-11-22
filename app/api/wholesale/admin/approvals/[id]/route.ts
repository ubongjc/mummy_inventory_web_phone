import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * PATCH /api/wholesale/admin/approvals/:id
 *
 * Approve or reject a supplier.
 *
 * Request Body:
 * - action: "approved" | "rejected"
 * - notes: Optional admin notes
 * - override_confidence: Optional manual confidence score (0.0-1.0)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;
    const body = await request.json();
    const { action, notes, override_confidence } = body;

    // Validate action
    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // Validate override_confidence if provided
    if (
      override_confidence !== undefined &&
      (override_confidence < 0 || override_confidence > 1)
    ) {
      return NextResponse.json(
        { error: "Invalid override_confidence. Must be between 0.0 and 1.0" },
        { status: 400 }
      );
    }

    // Find supplier
    const supplier = await prisma.wholesaleSupplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Update supplier approval status
    const updateData: any = {
      approvalStatus: action,
      updatedAt: new Date(),
    };

    // Add notes if provided
    if (notes) {
      const existingNotes = supplier.notes || "";
      updateData.notes = existingNotes
        ? `${existingNotes}\n\n[Admin ${action} on ${new Date().toISOString()}]: ${notes}`
        : `[Admin ${action} on ${new Date().toISOString()}]: ${notes}`;
    }

    // Override confidence if provided
    if (override_confidence !== undefined) {
      updateData.confidence = override_confidence;
    }

    // Update supplier
    const updatedSupplier = await prisma.wholesaleSupplier.update({
      where: { id },
      data: updateData,
    });

    // Create approval record
    await prisma.wholesaleSupplierApproval.create({
      data: {
        supplierId: id,
        action,
        adminId: session.user.id,
        notes: notes || null,
        confidenceOverride: override_confidence || null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `wholesale_supplier_${action}`,
        entityType: "wholesale_supplier",
        entityId: id,
        details: {
          company_name: supplier.companyName,
          action,
          notes,
          override_confidence,
        },
      },
    });

    return NextResponse.json({
      success: true,
      supplier: {
        id: updatedSupplier.id,
        approval_status: updatedSupplier.approvalStatus,
        confidence: parseFloat(updatedSupplier.confidence.toString()),
        approved_by: session.user.id,
        approved_at: updatedSupplier.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error approving/rejecting supplier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
