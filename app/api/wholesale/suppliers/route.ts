import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * GET /api/wholesale/suppliers
 *
 * Search and filter wholesale suppliers with pagination.
 *
 * Query Parameters:
 * - query: Search in company name, products, notes
 * - states: Filter by states (comma-separated)
 * - categories: Filter by categories (comma-separated)
 * - delivery_options: Filter by delivery options
 * - moq_min: Minimum MOQ units
 * - moq_max: Maximum MOQ units
 * - lead_time_max: Maximum lead time in days
 * - min_rating: Minimum Google rating
 * - explicit_wholesale_only: Only verified wholesale suppliers
 * - min_confidence: Minimum confidence score
 * - page: Page number (1-indexed)
 * - limit: Results per page (max 100)
 * - sort: Sort field (confidence, company_name, updated_at)
 * - order: Sort order (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || undefined;
    const statesParam = searchParams.get("states");
    const categoriesParam = searchParams.get("categories");
    const deliveryOptionsParam = searchParams.get("delivery_options");
    const moqMin = searchParams.get("moq_min")
      ? parseInt(searchParams.get("moq_min")!)
      : undefined;
    const moqMax = searchParams.get("moq_max")
      ? parseInt(searchParams.get("moq_max")!)
      : undefined;
    const leadTimeMax = searchParams.get("lead_time_max")
      ? parseInt(searchParams.get("lead_time_max")!)
      : undefined;
    const minRating = searchParams.get("min_rating")
      ? parseFloat(searchParams.get("min_rating")!)
      : undefined;
    const explicitWholesaleOnly =
      searchParams.get("explicit_wholesale_only") === "true";
    const minConfidence = searchParams.get("min_confidence")
      ? parseFloat(searchParams.get("min_confidence")!)
      : undefined;

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );
    const sort = searchParams.get("sort") || "confidence";
    const order = searchParams.get("order") || "desc";

    // Parse array parameters
    const states = statesParam ? statesParam.split(",").map((s) => s.trim()) : undefined;
    const categories = categoriesParam
      ? categoriesParam.split(",").map((c) => c.trim())
      : undefined;
    const deliveryOptions = deliveryOptionsParam
      ? deliveryOptionsParam.split(",").map((d) => d.trim())
      : undefined;

    // Build WHERE clause
    const where: Prisma.WholesaleSupplierWhereInput = {
      // Only show approved suppliers to customers
      approvalStatus: "approved",
      isBlacklisted: false,
    };

    // Text search
    if (query) {
      where.OR = [
        { companyName: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
      ];
    }

    // State filter
    if (states && states.length > 0) {
      where.state = { in: states };
    }

    // Categories filter - check if JSON array contains any of the specified categories
    if (categories && categories.length > 0) {
      where.categories = {
        path: "$",
        array_contains: categories,
      };
    }

    // Confidence filter
    if (minConfidence !== undefined) {
      where.confidence = { gte: minConfidence };
    }

    // Explicit wholesale language filter
    if (explicitWholesaleOnly) {
      where.verifications = {
        path: "$.explicit_wholesale_language",
        equals: true,
      };
    }

    // MOQ filter
    if (moqMin !== undefined || moqMax !== undefined) {
      const moqConditions: any = {};
      if (moqMin !== undefined) {
        moqConditions.gte = moqMin;
      }
      if (moqMax !== undefined) {
        moqConditions.lte = moqMax;
      }
      where.wholesaleTerms = {
        path: "$.moq_units",
        ...moqConditions,
      };
    }

    // Lead time filter
    if (leadTimeMax !== undefined) {
      where.wholesaleTerms = {
        ...where.wholesaleTerms,
        path: "$.lead_time_days",
        lte: leadTimeMax,
      };
    }

    // Delivery options filter
    if (deliveryOptions && deliveryOptions.length > 0) {
      where.wholesaleTerms = {
        ...where.wholesaleTerms,
        path: "$.delivery_options",
        array_contains: deliveryOptions,
      };
    }

    // Rating filter - this is complex as ratings are nested JSON
    // For now, we'll fetch all and filter in memory (TODO: optimize)

    // Build ORDER BY
    let orderBy: Prisma.WholesaleSupplierOrderByWithRelationInput = {};
    if (sort === "company_name") {
      orderBy.companyName = order as "asc" | "desc";
    } else if (sort === "updated_at") {
      orderBy.updatedAt = order as "asc" | "desc";
    } else {
      // Default: confidence
      orderBy.confidence = order as "asc" | "desc";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [suppliers, totalCount] = await Promise.all([
      prisma.wholesaleSupplier.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.wholesaleSupplier.count({ where }),
    ]);

    // Filter by rating if needed (in-memory filter)
    let filteredSuppliers = suppliers;
    if (minRating !== undefined) {
      filteredSuppliers = suppliers.filter((s) => {
        const ratings = s.ratings as any;
        if (ratings?.google?.stars) {
          return ratings.google.stars >= minRating;
        }
        return false;
      });
    }

    // Format response
    const formattedSuppliers = filteredSuppliers.map((s) => ({
      id: s.id,
      supplier_id: s.supplierId,
      company_name: s.companyName,
      aka_names: (s.akaNames as string[]) || [],
      categories: (s.categories as string[]) || [],
      product_examples: (s.productExamples as string[]) || [],
      wholesale_terms: s.wholesaleTerms || {},
      coverage_regions: (s.coverageRegions as string[]) || [],
      address_text: s.addressText,
      state: s.state,
      lga_or_city: s.lgaOrCity,
      lat: s.lat ? parseFloat(s.lat.toString()) : null,
      lon: s.lon ? parseFloat(s.lon.toString()) : null,
      phones: (s.phones as string[]) || [],
      whatsapp: (s.whatsapp as string[]) || [],
      emails: (s.emails as string[]) || [],
      websites: (s.websites as string[]) || [],
      socials: s.socials || {},
      business_hours: s.businessHours,
      ratings: s.ratings || {},
      verifications: s.verifications || {},
      confidence: parseFloat(s.confidence.toString()),
      notes: s.notes,
      source_url: s.sourceUrl,
      source_platform: s.sourcePlatform,
      last_seen_at: s.lastSeenAt.toISOString(),
      created_at: s.createdAt.toISOString(),
      updated_at: s.updatedAt.toISOString(),
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    // Build filters_applied object
    const filtersApplied: any = {};
    if (query) filtersApplied.query = query;
    if (states) filtersApplied.states = states;
    if (categories) filtersApplied.categories = categories;
    if (deliveryOptions) filtersApplied.delivery_options = deliveryOptions;
    if (moqMin !== undefined) filtersApplied.moq_min = moqMin;
    if (moqMax !== undefined) filtersApplied.moq_max = moqMax;
    if (leadTimeMax !== undefined) filtersApplied.lead_time_max = leadTimeMax;
    if (minRating !== undefined) filtersApplied.min_rating = minRating;
    if (explicitWholesaleOnly) filtersApplied.explicit_wholesale_only = true;
    if (minConfidence !== undefined) filtersApplied.min_confidence = minConfidence;

    return NextResponse.json({
      suppliers: formattedSuppliers,
      pagination: {
        page,
        limit,
        total_results: totalCount,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      filters_applied: filtersApplied,
    });
  } catch (error) {
    console.error("Error fetching wholesale suppliers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
