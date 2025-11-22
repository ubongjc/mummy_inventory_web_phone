import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/wholesale/suppliers/:id
 *
 * Get full details of a single supplier with similar/related suppliers.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Find supplier by ID or supplier_id
    const supplier = await prisma.wholesaleSupplier.findFirst({
      where: {
        OR: [{ id }, { supplierId: id }],
        approvalStatus: "approved",
        isBlacklisted: false,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Format supplier data
    const formattedSupplier = {
      id: supplier.id,
      supplier_id: supplier.supplierId,
      company_name: supplier.companyName,
      aka_names: (supplier.akaNames as string[]) || [],
      categories: (supplier.categories as string[]) || [],
      product_examples: (supplier.productExamples as string[]) || [],
      wholesale_terms: supplier.wholesaleTerms || {},
      coverage_regions: (supplier.coverageRegions as string[]) || [],
      address_text: supplier.addressText,
      state: supplier.state,
      lga_or_city: supplier.lgaOrCity,
      lat: supplier.lat ? parseFloat(supplier.lat.toString()) : null,
      lon: supplier.lon ? parseFloat(supplier.lon.toString()) : null,
      phones: (supplier.phones as string[]) || [],
      whatsapp: (supplier.whatsapp as string[]) || [],
      emails: (supplier.emails as string[]) || [],
      websites: (supplier.websites as string[]) || [],
      socials: supplier.socials || {},
      business_hours: supplier.businessHours,
      ratings: supplier.ratings || {},
      verifications: supplier.verifications || {},
      confidence: parseFloat(supplier.confidence.toString()),
      notes: supplier.notes,
      source_url: supplier.sourceUrl,
      source_platform: supplier.sourcePlatform,
      last_seen_at: supplier.lastSeenAt.toISOString(),
      created_at: supplier.createdAt.toISOString(),
      updated_at: supplier.updatedAt.toISOString(),
    };

    // Find similar suppliers (same state and overlapping categories)
    const categories = supplier.categories as string[];
    const similarSuppliers = await prisma.wholesaleSupplier.findMany({
      where: {
        id: { not: supplier.id },
        state: supplier.state,
        approvalStatus: "approved",
        isBlacklisted: false,
        // Note: Prisma doesn't support easy JSON array overlap,
        // so we'll fetch nearby suppliers and filter in memory
      },
      take: 10,
      orderBy: { confidence: "desc" },
    });

    // Filter for overlapping categories
    const filteredSimilar = similarSuppliers
      .filter((s) => {
        const sCats = s.categories as string[];
        return sCats.some((cat) => categories.includes(cat));
      })
      .slice(0, 5)
      .map((s) => {
        const sCats = s.categories as string[];
        const overlap = sCats.filter((cat) => categories.includes(cat));
        return {
          id: s.id,
          company_name: s.companyName,
          categories: sCats,
          state: s.state,
          confidence: parseFloat(s.confidence.toString()),
          similarity_reason: `Same categories (${overlap.join(", ")}) and nearby location`,
        };
      });

    // Find related suppliers by category (different state)
    const relatedByCategory = await prisma.wholesaleSupplier.findMany({
      where: {
        id: { not: supplier.id },
        state: { not: supplier.state },
        approvalStatus: "approved",
        isBlacklisted: false,
        // Filter by categories in memory
      },
      take: 20,
      orderBy: { confidence: "desc" },
    });

    const filteredRelated = relatedByCategory
      .filter((s) => {
        const sCats = s.categories as string[];
        return sCats.some((cat) => categories.includes(cat));
      })
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        company_name: s.companyName,
        categories: s.categories as string[],
        state: s.state,
        confidence: parseFloat(s.confidence.toString()),
      }));

    return NextResponse.json({
      supplier: formattedSupplier,
      similar_suppliers: filteredSimilar,
      related_by_category: filteredRelated,
    });
  } catch (error) {
    console.error("Error fetching supplier details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
