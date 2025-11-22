import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { CATEGORY_LABELS } from "@/app/lib/wholesale/types";

/**
 * GET /api/wholesale/categories
 *
 * Get all product categories with supplier counts and metadata.
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all approved suppliers
    const suppliers = await prisma.wholesaleSupplier.findMany({
      where: {
        approvalStatus: "approved",
        isBlacklisted: false,
      },
      select: {
        categories: true,
        productExamples: true,
        confidence: true,
      },
    });

    // Count suppliers per category and collect product examples
    const categoryData: {
      [key: string]: {
        count: number;
        products: { [product: string]: number };
        confidenceSum: number;
      };
    } = {};

    suppliers.forEach((supplier) => {
      const cats = supplier.categories as string[];
      const products = (supplier.productExamples as string[]) || [];
      const conf = parseFloat(supplier.confidence.toString());

      cats.forEach((cat) => {
        if (!categoryData[cat]) {
          categoryData[cat] = {
            count: 0,
            products: {},
            confidenceSum: 0,
          };
        }

        categoryData[cat].count += 1;
        categoryData[cat].confidenceSum += conf;

        // Count product examples
        products.forEach((product) => {
          categoryData[cat].products[product] =
            (categoryData[cat].products[product] || 0) + 1;
        });
      });
    });

    // Format response
    const categories = Object.entries(categoryData).map(([id, data]) => {
      // Get top 3 products
      const topProducts = Object.entries(data.products)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([product]) => product);

      return {
        id,
        label: CATEGORY_LABELS[id as keyof typeof CATEGORY_LABELS] || id,
        supplier_count: data.count,
        top_products: topProducts,
        avg_confidence: data.count > 0 ? data.confidenceSum / data.count : 0,
      };
    });

    // Sort by supplier count descending
    categories.sort((a, b) => b.supplier_count - a.supplier_count);

    return NextResponse.json({
      categories,
      total_categories: categories.length,
    });
  } catch (error) {
    console.error("Error fetching categories data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
