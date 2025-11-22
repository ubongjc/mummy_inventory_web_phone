import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { findDuplicates } from "@/app/lib/wholesale/deduplicator";
import type { NormalizedSupplier } from "@/app/lib/wholesale/types";

/**
 * GET /api/wholesale/admin/duplicates
 *
 * Find potential duplicate suppliers using similarity matching.
 *
 * Query Parameters:
 * - min_similarity: Minimum similarity score (0-1) - Default: 0.7
 * - limit: Max duplicate pairs to return - Default: 50
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
    const minSimilarity = parseFloat(
      searchParams.get("min_similarity") || "0.7"
    );
    const limit = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("limit") || "50"))
    );

    // Get all approved suppliers (excluding blacklisted)
    const suppliers = await prisma.wholesaleSupplier.findMany({
      where: {
        isBlacklisted: false,
      },
    });

    // Convert to NormalizedSupplier format
    const normalizedSuppliers: NormalizedSupplier[] = suppliers.map((s) => ({
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
    }));

    // Find duplicates using deduplicator
    const duplicateMatches = findDuplicates(normalizedSuppliers);

    // Filter by minimum similarity and limit
    const filteredDuplicates = duplicateMatches
      .filter((match) => match.similarity >= minSimilarity)
      .slice(0, limit);

    // Format response
    const duplicatePairs = filteredDuplicates.map((match) => ({
      supplier1: {
        id: match.supplier1.id,
        company_name: match.supplier1.company_name,
        phones: match.supplier1.phones,
        emails: match.supplier1.emails,
        state: match.supplier1.state,
        confidence: match.supplier1.confidence,
      },
      supplier2: {
        id: match.supplier2.id,
        company_name: match.supplier2.company_name,
        phones: match.supplier2.phones,
        emails: match.supplier2.emails,
        state: match.supplier2.state,
        confidence: match.supplier2.confidence,
      },
      similarity: match.similarity,
      reason: match.reason,
    }));

    return NextResponse.json({
      duplicate_pairs: duplicatePairs,
      total_duplicates_found: duplicatePairs.length,
    });
  } catch (error) {
    console.error("Error finding duplicates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
