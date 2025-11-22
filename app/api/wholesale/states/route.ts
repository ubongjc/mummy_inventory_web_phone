import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { GEOPOLITICAL_ZONES } from "@/app/lib/wholesale/types";

/**
 * GET /api/wholesale/states
 *
 * Get list of all Nigerian states with supplier counts and metadata.
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all approved suppliers grouped by state
    const suppliersByState = await prisma.wholesaleSupplier.groupBy({
      by: ["state"],
      where: {
        approvalStatus: "approved",
        isBlacklisted: false,
      },
      _count: {
        id: true,
      },
      _avg: {
        confidence: true,
      },
    });

    // Get top categories per state
    const statesData = await Promise.all(
      suppliersByState.map(async (stateGroup) => {
        if (!stateGroup.state) return null;

        // Get all suppliers for this state to analyze categories
        const suppliers = await prisma.wholesaleSupplier.findMany({
          where: {
            state: stateGroup.state,
            approvalStatus: "approved",
            isBlacklisted: false,
          },
          select: {
            categories: true,
          },
        });

        // Count category occurrences
        const categoryCount: { [key: string]: number } = {};
        suppliers.forEach((s) => {
          const cats = s.categories as string[];
          cats.forEach((cat) => {
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
          });
        });

        // Get top 3 categories
        const topCategories = Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat]) => cat);

        return {
          name: stateGroup.state,
          supplier_count: stateGroup._count.id,
          avg_confidence: stateGroup._avg.confidence
            ? parseFloat(stateGroup._avg.confidence.toString())
            : 0,
          top_categories: topCategories,
        };
      })
    );

    // Filter out null entries and sort by supplier count
    const states = statesData
      .filter((s) => s !== null)
      .sort((a, b) => b!.supplier_count - a!.supplier_count);

    // Calculate geopolitical zone statistics
    const geopoliticalZones: any = {};
    for (const [zone, zoneStates] of Object.entries(GEOPOLITICAL_ZONES)) {
      const zoneSuppliers = states.filter((s) =>
        zoneStates.includes(s!.name!)
      );
      const totalCount = zoneSuppliers.reduce(
        (sum, s) => sum + s!.supplier_count,
        0
      );

      geopoliticalZones[zone] = {
        states: zoneStates,
        supplier_count: totalCount,
      };
    }

    // Calculate total stats
    const totalSuppliers = states.reduce(
      (sum, s) => sum + s!.supplier_count,
      0
    );
    const statesWithCoverage = states.length;

    // Determine states without coverage
    const allStates = Object.values(GEOPOLITICAL_ZONES).flat();
    const coveredStates = new Set(states.map((s) => s!.name));
    const statesWithoutCoverage = allStates.filter(
      (state) => !coveredStates.has(state)
    );

    return NextResponse.json({
      states,
      geopolitical_zones: geopoliticalZones,
      total_suppliers: totalSuppliers,
      states_with_coverage: statesWithCoverage,
      states_without_coverage: statesWithoutCoverage,
    });
  } catch (error) {
    console.error("Error fetching states data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
