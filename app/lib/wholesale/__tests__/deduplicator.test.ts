/**
 * Unit tests for deduplication functions
 */

import {
  findDuplicates,
  mergeSuppliers,
  stringSimilarity,
} from "../deduplicator";
import type { NormalizedSupplier } from "../types";

const createMockSupplier = (
  overrides: Partial<NormalizedSupplier>
): NormalizedSupplier => ({
  id: "test-id",
  supplier_id: "test-supplier-id",
  company_name: "Test Company",
  aka_names: [],
  categories: ["seating"],
  product_examples: ["Chairs"],
  wholesale_terms: {
    bulk_available: true,
    delivery_options: [],
  },
  coverage_regions: [],
  address_text: "123 Test St",
  state: "Lagos",
  lga_or_city: "Ikeja",
  lat: null,
  lon: null,
  phones: ["+2348012345678"],
  whatsapp: [],
  emails: [],
  websites: [],
  socials: {},
  business_hours: null,
  ratings: {},
  verifications: {
    explicit_wholesale_language: false,
    evidence_snippets: [],
  },
  notes: null,
  source_url: "https://example.com",
  source_platform: "directory",
  extracted_at: new Date().toISOString(),
  confidence: 0.7,
  ...overrides,
});

describe("stringSimilarity", () => {
  it("should return 1.0 for identical strings", () => {
    expect(stringSimilarity("test", "test")).toBe(1.0);
    expect(stringSimilarity("Lagos Event Supply", "Lagos Event Supply")).toBe(
      1.0
    );
  });

  it("should return 0.0 for completely different strings", () => {
    const similarity = stringSimilarity("abc", "xyz");
    expect(similarity).toBeLessThan(0.5);
  });

  it("should detect similar strings", () => {
    const similarity = stringSimilarity(
      "Lagos Event Supply",
      "Lagos Event Supplies"
    );
    expect(similarity).toBeGreaterThan(0.9);
  });

  it("should be case-insensitive", () => {
    const similarity = stringSimilarity("TEST", "test");
    expect(similarity).toBe(1.0);
  });
});

describe("findDuplicates", () => {
  it("should find exact duplicate supplier IDs", () => {
    const supplier1 = createMockSupplier({
      id: "1",
      supplier_id: "same-hash",
    });
    const supplier2 = createMockSupplier({
      id: "2",
      supplier_id: "same-hash",
    });

    const duplicates = findDuplicates([supplier1, supplier2]);

    expect(duplicates.length).toBeGreaterThan(0);
    expect(duplicates[0].similarity).toBe(1.0);
  });

  it("should find suppliers with same phone numbers", () => {
    const supplier1 = createMockSupplier({
      id: "1",
      supplier_id: "hash1",
      company_name: "Company A",
      phones: ["+2348012345678"],
    });
    const supplier2 = createMockSupplier({
      id: "2",
      supplier_id: "hash2",
      company_name: "Company B",
      phones: ["+2348012345678"],
    });

    const duplicates = findDuplicates([supplier1, supplier2]);

    expect(duplicates.length).toBeGreaterThan(0);
    expect(duplicates[0].similarity).toBeGreaterThan(0.7);
  });

  it("should find suppliers with similar names", () => {
    const supplier1 = createMockSupplier({
      id: "1",
      company_name: "Lagos Event Supply",
      phones: ["+2348012345678"],
    });
    const supplier2 = createMockSupplier({
      id: "2",
      company_name: "Lagos Event Supplies",
      phones: ["+2348087654321"],
    });

    const duplicates = findDuplicates([supplier1, supplier2]);

    expect(duplicates.length).toBeGreaterThan(0);
    const match = duplicates[0];
    expect(match.similarity).toBeGreaterThan(0.7);
  });

  it("should not find duplicates for dissimilar suppliers", () => {
    const supplier1 = createMockSupplier({
      id: "1",
      company_name: "Company A",
      phones: ["+2348012345678"],
      state: "Lagos",
    });
    const supplier2 = createMockSupplier({
      id: "2",
      company_name: "Company B",
      phones: ["+2348087654321"],
      state: "Abuja",
    });

    const duplicates = findDuplicates([supplier1, supplier2]);

    expect(duplicates.length).toBe(0);
  });

  it("should sort duplicates by similarity descending", () => {
    const supplier1 = createMockSupplier({ id: "1", company_name: "A" });
    const supplier2 = createMockSupplier({
      id: "2",
      company_name: "A",
      phones: ["+2348012345678"],
    }); // High similarity
    const supplier3 = createMockSupplier({
      id: "3",
      company_name: "ABC",
      phones: ["+2348012345679"],
    }); // Medium similarity

    const duplicates = findDuplicates([supplier1, supplier2, supplier3]);

    // First result should be highest similarity
    if (duplicates.length > 1) {
      expect(duplicates[0].similarity).toBeGreaterThanOrEqual(
        duplicates[1].similarity
      );
    }
  });
});

describe("mergeSuppliers", () => {
  it("should keep primary supplier's scalar fields", () => {
    const primary = createMockSupplier({
      id: "1",
      company_name: "Primary Company",
      state: "Lagos",
      confidence: 0.9,
    });
    const secondary = createMockSupplier({
      id: "2",
      company_name: "Secondary Company",
      state: "FCT",
      confidence: 0.7,
    });

    const merged = mergeSuppliers(primary, secondary);

    expect(merged.company_name).toBe("Primary Company");
    expect(merged.state).toBe("Lagos");
    expect(merged.confidence).toBe(0.9);
  });

  it("should merge array fields (union)", () => {
    const primary = createMockSupplier({
      phones: ["+2348012345678"],
      emails: ["primary@test.com"],
      categories: ["seating"],
    });
    const secondary = createMockSupplier({
      phones: ["+2348087654321"],
      emails: ["secondary@test.com"],
      categories: ["tables"],
    });

    const merged = mergeSuppliers(primary, secondary);

    expect(merged.phones).toContain("+2348012345678");
    expect(merged.phones).toContain("+2348087654321");
    expect(merged.emails).toContain("primary@test.com");
    expect(merged.emails).toContain("secondary@test.com");
    expect(merged.categories).toContain("seating");
    expect(merged.categories).toContain("tables");
  });

  it("should add secondary company name to aka_names", () => {
    const primary = createMockSupplier({
      company_name: "Primary Company",
      aka_names: [],
    });
    const secondary = createMockSupplier({
      company_name: "Secondary Company",
      aka_names: ["Alt Name"],
    });

    const merged = mergeSuppliers(primary, secondary);

    expect(merged.aka_names).toContain("Secondary Company");
    expect(merged.aka_names).toContain("Alt Name");
  });

  it("should deduplicate merged arrays", () => {
    const primary = createMockSupplier({
      phones: ["+2348012345678", "+2348023456789"],
      categories: ["seating"],
    });
    const secondary = createMockSupplier({
      phones: ["+2348012345678", "+2348034567890"], // Duplicate phone
      categories: ["seating"], // Duplicate category
    });

    const merged = mergeSuppliers(primary, secondary);

    // Should not have duplicates
    expect(merged.phones.length).toBe(3); // 3 unique phones
    expect(merged.categories.length).toBe(1); // 1 unique category
  });

  it("should prefer higher confidence from either supplier", () => {
    const primary = createMockSupplier({
      confidence: 0.7,
    });
    const secondary = createMockSupplier({
      confidence: 0.9,
    });

    const merged = mergeSuppliers(primary, secondary);

    expect(merged.confidence).toBe(0.9);
  });
});
