/**
 * Unit tests for normalization functions
 */

import {
  normalizePhone,
  normalizeEmail,
  normalizeState,
  extractStateFromAddress,
  categorizeProducts,
  detectWholesaleLanguage,
  calculateConfidence,
} from "../normalize";

describe("normalizePhone", () => {
  it("should normalize Nigerian phone numbers to E.164 format", () => {
    expect(normalizePhone("08012345678")).toBe("+2348012345678");
    expect(normalizePhone("0802 345 6789")).toBe("+2348023456789");
    expect(normalizePhone("234-801-234-5678")).toBe("+2348012345678");
    expect(normalizePhone("+234 (0) 803 456 7890")).toBe("+2348034567890");
  });

  it("should return null for invalid phone numbers", () => {
    expect(normalizePhone("08012345")).toBeNull(); // Too short
    expect(normalizePhone("invalid")).toBeNull();
    expect(normalizePhone("123")).toBeNull();
  });

  it("should handle phones without leading zero", () => {
    expect(normalizePhone("8012345678")).toBe("+2348012345678");
  });
});

describe("normalizeEmail", () => {
  it("should normalize email addresses", () => {
    expect(normalizeEmail("SALES@COMPANY.COM")).toBe("sales@company.com");
    expect(normalizeEmail(" info@company.com ")).toBe("info@company.com");
  });

  it("should return null for invalid emails", () => {
    expect(normalizeEmail("invalid-email")).toBeNull();
    expect(normalizeEmail("no-at-sign")).toBeNull();
    expect(normalizeEmail("@nodomain.com")).toBeNull();
  });
});

describe("normalizeState", () => {
  it("should normalize state names", () => {
    expect(normalizeState("lagos")).toBe("Lagos");
    expect(normalizeState("FCT Abuja")).toBe("FCT");
    expect(normalizeState("federal capital territory")).toBe("FCT");
    expect(normalizeState("Akwa-Ibom")).toBe("Akwa Ibom");
    expect(normalizeState("Cross-River")).toBe("Cross River");
  });

  it("should return null for invalid states", () => {
    expect(normalizeState("Invalid State")).toBeNull();
    expect(normalizeState("")).toBeNull();
  });
});

describe("extractStateFromAddress", () => {
  it("should extract state from address text", () => {
    expect(extractStateFromAddress("123 Ikeja Road, Lagos")).toBe("Lagos");
    expect(
      extractStateFromAddress("Trade Fair Complex, Ojo, Lagos State")
    ).toBe("Lagos");
    expect(
      extractStateFromAddress("Plot 45, Victoria Island, VI, Lagos")
    ).toBe("Lagos");
    expect(extractStateFromAddress("No. 12, Port Harcourt")).toBe("Rivers");
  });

  it("should return null if no state found", () => {
    expect(extractStateFromAddress("123 Main Street")).toBeNull();
    expect(extractStateFromAddress("")).toBeNull();
  });
});

describe("categorizeProducts", () => {
  it("should categorize products based on keywords", () => {
    const text = "We sell chiavari chairs, round tables, and white tents";
    const categories = categorizeProducts(text);

    expect(categories).toContain("seating");
    expect(categories).toContain("tables");
    expect(categories).toContain("tents");
  });

  it("should handle multiple keywords for same category", () => {
    const text = "Napoleon chairs and ghost chairs available";
    const categories = categorizeProducts(text);

    expect(categories).toContain("seating");
    expect(categories.filter((c) => c === "seating").length).toBe(1); // No duplicates
  });

  it("should return empty array if no categories match", () => {
    const text = "Random unrelated text";
    const categories = categorizeProducts(text);

    expect(categories).toHaveLength(0);
  });
});

describe("detectWholesaleLanguage", () => {
  it("should detect explicit wholesale language", () => {
    const text = "We sell wholesale and retail. Bulk orders available.";
    const result = detectWholesaleLanguage(text);

    expect(result.isWholesale).toBe(true);
    expect(result.evidenceSnippets.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("should detect MOQ mentions", () => {
    const text = "Minimum order quantity 50 pieces";
    const result = detectWholesaleLanguage(text);

    expect(result.isWholesale).toBe(true);
    expect(result.evidenceSnippets.some((s) => s.includes("minimum"))).toBe(
      true
    );
  });

  it("should return false for non-wholesale text", () => {
    const text = "We are a small retail shop selling individual items";
    const result = detectWholesaleLanguage(text);

    expect(result.isWholesale).toBe(false);
    expect(result.confidence).toBeLessThan(0.5);
  });
});

describe("calculateConfidence", () => {
  it("should calculate high confidence for verified wholesale suppliers", () => {
    const supplier = {
      verifications: {
        explicit_wholesale_language: true,
        evidence_snippets: ["wholesale", "bulk"],
        cac_number: "RC123456",
      },
      wholesale_terms: {
        bulk_available: true,
        moq_units: 50,
      },
      phones: ["+2348012345678"],
      whatsapp: ["+2348012345678"],
      emails: ["sales@company.com"],
      state: "Lagos",
      categories: ["seating", "tables"],
    };

    const confidence = calculateConfidence(supplier as any);

    expect(confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("should calculate low confidence for unverified suppliers", () => {
    const supplier = {
      verifications: {
        explicit_wholesale_language: false,
        evidence_snippets: [],
      },
      wholesale_terms: {
        bulk_available: false,
      },
      phones: [],
      whatsapp: [],
      emails: [],
      state: null,
      categories: [],
    };

    const confidence = calculateConfidence(supplier as any);

    expect(confidence).toBeLessThan(0.6);
  });

  it("should clamp confidence between 0 and 1", () => {
    const supplier = {
      verifications: {
        explicit_wholesale_language: true,
        evidence_snippets: ["test"],
        cac_number: "RC123456",
      },
      wholesale_terms: {
        bulk_available: true,
        moq_units: 100,
      },
      phones: ["+2348012345678"],
      whatsapp: ["+2348012345678"],
      emails: ["test@test.com"],
      state: "Lagos",
      categories: ["seating", "tables", "tents"],
    };

    const confidence = calculateConfidence(supplier as any);

    expect(confidence).toBeGreaterThanOrEqual(0);
    expect(confidence).toBeLessThanOrEqual(1);
  });
});
