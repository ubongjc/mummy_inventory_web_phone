/**
 * Export Utilities
 *
 * Export supplier data to JSONL and CSV formats
 */

import * as fs from "fs/promises";
import * as path from "path";
import { sanitizeForCsv } from "./utils";

/**
 * Export suppliers to JSONL (JSON Lines) format
 * One JSON object per line
 */
export async function exportToJsonl(suppliers: any[]): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "_");
  const filename = `suppliers_${timestamp}.jsonl`;
  const filepath = path.join(
    process.cwd(),
    "data",
    "wholesale_suppliers",
    filename
  );

  // Ensure directory exists
  await fs.mkdir(path.dirname(filepath), { recursive: true });

  // Convert to JSONL format (one JSON object per line)
  const jsonlLines = suppliers.map((supplier) => {
    const normalized = {
      supplier_id: supplier.supplierId,
      company_name: supplier.companyName,
      aka_names: supplier.akaNames,
      categories: supplier.categories,
      product_examples: supplier.productExamples,
      wholesale_terms: supplier.wholesaleTerms,
      coverage_regions: supplier.coverageRegions,
      address_text: supplier.addressText,
      state: supplier.state,
      lga_or_city: supplier.lgaOrCity,
      lat: supplier.lat ? parseFloat(supplier.lat.toString()) : null,
      lon: supplier.lon ? parseFloat(supplier.lon.toString()) : null,
      phones: supplier.phones,
      whatsapp: supplier.whatsapp,
      emails: supplier.emails,
      websites: supplier.websites,
      socials: supplier.socials,
      business_hours: supplier.businessHours,
      ratings: supplier.ratings,
      verifications: supplier.verifications,
      confidence: parseFloat(supplier.confidence.toString()),
      notes: supplier.notes,
      source_url: supplier.sourceUrl,
      source_platform: supplier.sourcePlatform,
      last_seen_at: supplier.lastSeenAt.toISOString(),
      created_at: supplier.createdAt.toISOString(),
      updated_at: supplier.updatedAt.toISOString(),
    };

    return JSON.stringify(normalized);
  });

  await fs.writeFile(filepath, jsonlLines.join("\n"), "utf-8");

  console.log(`[Export] Exported ${suppliers.length} suppliers to ${filepath}`);

  return filepath;
}

/**
 * Export suppliers to CSV format
 */
export async function exportToCsv(suppliers: any[]): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "_");
  const filename = `suppliers_${timestamp}.csv`;
  const filepath = path.join(
    process.cwd(),
    "data",
    "wholesale_suppliers",
    filename
  );

  // Ensure directory exists
  await fs.mkdir(path.dirname(filepath), { recursive: true });

  // CSV header
  const headers = [
    "supplier_id",
    "company_name",
    "aka_names",
    "categories",
    "product_examples",
    "state",
    "lga_or_city",
    "address_text",
    "phones",
    "whatsapp",
    "emails",
    "websites",
    "moq_units",
    "lead_time_days",
    "delivery_options",
    "price_range_hint",
    "business_hours",
    "google_rating",
    "facebook_rating",
    "confidence",
    "explicit_wholesale",
    "cac_number",
    "source_platform",
    "last_seen_at",
    "created_at",
  ];

  const csvRows = [headers.join(",")];

  // Add data rows
  for (const supplier of suppliers) {
    const wholesaleTerms = supplier.wholesaleTerms || {};
    const ratings = supplier.ratings || {};
    const verifications = supplier.verifications || {};

    const row = [
      supplier.supplierId,
      sanitizeForCsv(supplier.companyName),
      sanitizeForCsv(JSON.stringify(supplier.akaNames || [])),
      sanitizeForCsv(JSON.stringify(supplier.categories || [])),
      sanitizeForCsv(JSON.stringify(supplier.productExamples || [])),
      supplier.state || "",
      supplier.lgaOrCity || "",
      sanitizeForCsv(supplier.addressText || ""),
      sanitizeForCsv(JSON.stringify(supplier.phones || [])),
      sanitizeForCsv(JSON.stringify(supplier.whatsapp || [])),
      sanitizeForCsv(JSON.stringify(supplier.emails || [])),
      sanitizeForCsv(JSON.stringify(supplier.websites || [])),
      wholesaleTerms.moq_units || "",
      wholesaleTerms.lead_time_days || "",
      sanitizeForCsv(JSON.stringify(wholesaleTerms.delivery_options || [])),
      sanitizeForCsv(wholesaleTerms.price_range_hint || ""),
      sanitizeForCsv(supplier.businessHours || ""),
      ratings.google?.stars || "",
      ratings.facebook?.stars || "",
      parseFloat(supplier.confidence.toString()).toFixed(2),
      verifications.explicit_wholesale_language ? "true" : "false",
      verifications.cac_number || "",
      supplier.sourcePlatform,
      supplier.lastSeenAt.toISOString(),
      supplier.createdAt.toISOString(),
    ];

    csvRows.push(row.map((v) => `"${v}"`).join(","));
  }

  await fs.writeFile(filepath, csvRows.join("\n"), "utf-8");

  console.log(`[Export] Exported ${suppliers.length} suppliers to ${filepath}`);

  return filepath;
}

/**
 * Export source logs
 */
export async function exportSourceLogs(runId: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "_");
  const filename = `sources_log_${runId}_${timestamp}.jsonl`;
  const filepath = path.join(
    process.cwd(),
    "data",
    "wholesale_suppliers",
    filename
  );

  // Get all source logs for this run
  const { prisma } = await import("@/app/lib/prisma");
  const logs = await prisma.wholesaleSupplierSourceLog.findMany({
    where: { runId },
    orderBy: { crawledAt: "asc" },
  });

  const jsonlLines = logs.map((log) => {
    const normalized = {
      run_id: log.runId,
      source_platform: log.sourcePlatform,
      source_url: log.sourceUrl,
      status: log.status,
      http_status: log.httpStatus,
      parse_success: log.parseSuccess,
      records_found: log.recordsFound,
      records_new: log.recordsNew,
      records_updated: log.recordsUpdated,
      error_message: log.errorMessage,
      crawled_at: log.crawledAt.toISOString(),
    };

    return JSON.stringify(normalized);
  });

  await fs.writeFile(filepath, jsonlLines.join("\n"), "utf-8");

  console.log(`[Export] Exported ${logs.length} source logs to ${filepath}`);

  return filepath;
}

/**
 * Generate quality report
 */
export async function generateQualityReport(suppliers: any[]): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "_");
  const filename = `quality_report_${timestamp}.md`;
  const filepath = path.join(
    process.cwd(),
    "data",
    "wholesale_suppliers",
    filename
  );

  // Calculate statistics
  const total = suppliers.length;
  const byState: { [state: string]: number } = {};
  const byCategory: { [category: string]: number } = {};
  let highConfidence = 0;
  let mediumConfidence = 0;
  let lowConfidence = 0;
  let explicitWholesale = 0;
  let withPhone = 0;
  let withEmail = 0;

  suppliers.forEach((s) => {
    const conf = parseFloat(s.confidence.toString());
    if (conf >= 0.8) highConfidence++;
    else if (conf >= 0.6) mediumConfidence++;
    else lowConfidence++;

    if (s.state) byState[s.state] = (byState[s.state] || 0) + 1;

    (s.categories || []).forEach((cat: string) => {
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    if (s.verifications?.explicit_wholesale_language) explicitWholesale++;
    if ((s.phones || []).length > 0) withPhone++;
    if ((s.emails || []).length > 0) withEmail++;
  });

  const statesCovered = Object.keys(byState).length;
  const medianConfidence =
    suppliers.length > 0
      ? parseFloat(
          suppliers
            .map((s) => parseFloat(s.confidence.toString()))
            .sort((a, b) => a - b)[Math.floor(suppliers.length / 2)]
            .toFixed(2)
        )
      : 0;

  // Generate markdown report
  const report = `# Wholesale Suppliers Quality Report

**Generated**: ${new Date().toISOString()}
**Total Suppliers**: ${total}

---

## Executive Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Suppliers | ${total} | ≥500 | ${total >= 500 ? "✅" : "❌"} |
| States Covered | ${statesCovered}/37 | 37/37 | ${statesCovered === 37 ? "✅" : "❌"} |
| Median Confidence | ${(medianConfidence * 100).toFixed(0)}% | ≥70% | ${medianConfidence >= 0.7 ? "✅" : "❌"} |
| Contact Info Coverage | ${((withPhone / total) * 100).toFixed(0)}% | ≥95% | ${withPhone / total >= 0.95 ? "✅" : "❌"} |

---

## Confidence Distribution

| Level | Count | Percentage |
|-------|-------|------------|
| High (≥80%) | ${highConfidence} | ${((highConfidence / total) * 100).toFixed(1)}% |
| Medium (60-79%) | ${mediumConfidence} | ${((mediumConfidence / total) * 100).toFixed(1)}% |
| Low (<60%) | ${lowConfidence} | ${((lowConfidence / total) * 100).toFixed(1)}% |

---

## Geographic Coverage

**States Covered**: ${statesCovered}/37

Top 10 States:
${Object.entries(byState)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([state, count], i) => `${i + 1}. ${state}: ${count} suppliers`)
  .join("\n")}

---

## Category Distribution

${Object.entries(byCategory)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, count]) => `- ${cat}: ${count} suppliers`)
  .join("\n")}

---

## Data Quality

- **Explicit Wholesale Language**: ${explicitWholesale} (${((explicitWholesale / total) * 100).toFixed(1)}%)
- **Phone Coverage**: ${withPhone} (${((withPhone / total) * 100).toFixed(1)}%)
- **Email Coverage**: ${withEmail} (${((withEmail / total) * 100).toFixed(1)}%)

---

*Report generated by Wholesale Supplier Discovery System*
`;

  await fs.writeFile(filepath, report, "utf-8");

  console.log(`[Export] Generated quality report: ${filepath}`);

  return filepath;
}
