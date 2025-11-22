import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { mergeSuppliers } from "@/app/lib/wholesale/deduplicator";
import type { NormalizedSupplier } from "@/app/lib/wholesale/types";

/**
 * POST /api/wholesale/admin/merge
 *
 * Merge two supplier records. The primary supplier will be kept,
 * and the secondary supplier will be marked as merged/deleted.
 *
 * Request Body:
 * - primary_id: ID of supplier to keep
 * - secondary_id: ID of supplier to merge into primary
 * - notes: Optional merge notes
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
    const { primary_id, secondary_id, notes } = body;

    // Validate input
    if (!primary_id || !secondary_id) {
      return NextResponse.json(
        { error: "Both primary_id and secondary_id are required" },
        { status: 400 }
      );
    }

    if (primary_id === secondary_id) {
      return NextResponse.json(
        { error: "Cannot merge a supplier with itself" },
        { status: 400 }
      );
    }

    // Get both suppliers
    const [primarySupplier, secondarySupplier] = await Promise.all([
      prisma.wholesaleSupplier.findUnique({ where: { id: primary_id } }),
      prisma.wholesaleSupplier.findUnique({ where: { id: secondary_id } }),
    ]);

    if (!primarySupplier || !secondarySupplier) {
      return NextResponse.json(
        { error: "One or both suppliers not found" },
        { status: 404 }
      );
    }

    // Convert to NormalizedSupplier format
    const toNormalized = (s: any): NormalizedSupplier => ({
      id: s.id,
      supplier_id: s.supplierId,
      company_name: s.companyName,
      aka_names: (s.akaNames as string[]) || [],
      categories: (s.categories as string[]) || [],
      product_examples: (s.productExamples as string[]) || [],
      wholesale_terms: (s.wholesaleTerms as any) || {},
      coverage_regions: (s.coverageRegions as string[]) || [],
      address_text: s.addressText,
      state: s.state || null,
      lga_or_city: s.lgaOrCity,
      lat: s.lat ? parseFloat(s.lat.toString()) : null,
      lon: s.lon ? parseFloat(s.lon.toString()) : null,
      phones: (s.phones as string[]) || [],
      whatsapp: (s.whatsapp as string[]) || [],
      emails: (s.emails as string[]) || [],
      websites: (s.websites as string[]) || [],
      socials: (s.socials as any) || {},
      business_hours: s.businessHours,
      ratings: (s.ratings as any) || {},
      verifications: (s.verifications as any) || {},
      notes: s.notes,
      source_url: s.sourceUrl,
      source_platform: s.sourcePlatform as any,
      extracted_at: s.extractedAt.toISOString(),
      confidence: parseFloat(s.confidence.toString()),
    });

    const normalizedPrimary = toNormalized(primarySupplier);
    const normalizedSecondary = toNormalized(secondarySupplier);

    // Perform merge using deduplicator logic
    const mergedData = mergeSuppliers(normalizedPrimary, normalizedSecondary);

    // Update primary supplier with merged data
    const updatedSupplier = await prisma.wholesaleSupplier.update({
      where: { id: primary_id },
      data: {
        akaNames: mergedData.aka_names,
        categories: mergedData.categories,
        productExamples: mergedData.product_examples,
        phones: mergedData.phones,
        whatsapp: mergedData.whatsapp,
        emails: mergedData.emails,
        websites: mergedData.websites,
        coverageRegions: mergedData.coverage_regions,
        // Keep primary's scalar values (state, address, etc.)
        notes: notes
          ? `${primarySupplier.notes || ""}\n\n[Merge on ${new Date().toISOString()}]: Merged with ${secondarySupplier.companyName} (ID: ${secondary_id}). ${notes}`
          : `${primarySupplier.notes || ""}\n\n[Merge on ${new Date().toISOString()}]: Merged with ${secondarySupplier.companyName} (ID: ${secondary_id})`,
        updatedAt: new Date(),
      },
    });

    // Mark secondary supplier as merged (soft delete by blacklisting)
    await prisma.wholesaleSupplier.update({
      where: { id: secondary_id },
      data: {
        isBlacklisted: true,
        blacklistReason: `Merged into ${primarySupplier.companyName} (ID: ${primary_id}) on ${new Date().toISOString()}`,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "wholesale_supplier_merge",
        entityType: "wholesale_supplier",
        entityId: primary_id,
        details: {
          primary_id,
          primary_name: primarySupplier.companyName,
          secondary_id,
          secondary_name: secondarySupplier.companyName,
          notes,
        },
      },
    });

    return NextResponse.json({
      success: true,
      merged_supplier: {
        id: updatedSupplier.id,
        company_name: updatedSupplier.companyName,
        aka_names: updatedSupplier.akaNames,
        categories: updatedSupplier.categories,
        merged_from: {
          id: secondary_id,
          company_name: secondarySupplier.companyName,
        },
      },
    });
  } catch (error) {
    console.error("Error merging suppliers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
