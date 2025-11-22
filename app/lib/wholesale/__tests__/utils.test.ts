/**
 * Unit tests for utility functions
 */

import {
  generateSupplierId,
  dedupeArray,
  arrayOverlap,
  sanitizeForCsv,
  extractDomain,
  cleanCompanyName,
} from "../utils";

describe("generateSupplierId", () => {
  it("should generate consistent hash for same inputs", () => {
    const id1 = generateSupplierId("Test Company", "+2348012345678", "Lagos");
    const id2 = generateSupplierId("Test Company", "+2348012345678", "Lagos");

    expect(id1).toBe(id2);
    expect(id1).toHaveLength(64); // SHA-256 produces 64 hex characters
  });

  it("should generate different hash for different inputs", () => {
    const id1 = generateSupplierId("Company A", "+2348012345678", "Lagos");
    const id2 = generateSupplierId("Company B", "+2348012345678", "Lagos");

    expect(id1).not.toBe(id2);
  });

  it("should be case-sensitive normalized (lowercase)", () => {
    const id1 = generateSupplierId("TEST COMPANY", "+2348012345678", "Lagos");
    const id2 = generateSupplierId("test company", "+2348012345678", "Lagos");

    expect(id1).toBe(id2); // Should be same after normalization
  });
});

describe("dedupeArray", () => {
  it("should remove duplicates from array", () => {
    const arr = ["a", "b", "c", "a", "b"];
    const deduped = dedupeArray(arr);

    expect(deduped).toEqual(["a", "b", "c"]);
  });

  it("should handle empty array", () => {
    const arr: string[] = [];
    const deduped = dedupeArray(arr);

    expect(deduped).toEqual([]);
  });

  it("should handle array with no duplicates", () => {
    const arr = ["a", "b", "c"];
    const deduped = dedupeArray(arr);

    expect(deduped).toEqual(["a", "b", "c"]);
  });

  it("should work with numbers", () => {
    const arr = [1, 2, 3, 1, 2];
    const deduped = dedupeArray(arr);

    expect(deduped).toEqual([1, 2, 3]);
  });
});

describe("arrayOverlap", () => {
  it("should calculate overlap percentage correctly", () => {
    const arr1 = ["a", "b", "c"];
    const arr2 = ["b", "c", "d"];

    const overlap = arrayOverlap(arr1, arr2);

    expect(overlap).toBeCloseTo(0.667, 2); // 2/3 overlap
  });

  it("should return 0 for no overlap", () => {
    const arr1 = ["a", "b", "c"];
    const arr2 = ["x", "y", "z"];

    const overlap = arrayOverlap(arr1, arr2);

    expect(overlap).toBe(0);
  });

  it("should return 1 for complete overlap", () => {
    const arr1 = ["a", "b", "c"];
    const arr2 = ["a", "b", "c"];

    const overlap = arrayOverlap(arr1, arr2);

    expect(overlap).toBe(1);
  });

  it("should return 0 if either array is empty", () => {
    const arr1: string[] = [];
    const arr2 = ["a", "b"];

    expect(arrayOverlap(arr1, arr2)).toBe(0);
    expect(arrayOverlap(arr2, arr1)).toBe(0);
  });
});

describe("sanitizeForCsv", () => {
  it("should escape double quotes", () => {
    const text = 'He said "hello"';
    const sanitized = sanitizeForCsv(text);

    expect(sanitized).toBe('He said ""hello""');
  });

  it("should remove newlines", () => {
    const text = "Line 1\nLine 2";
    const sanitized = sanitizeForCsv(text);

    expect(sanitized).toBe("Line 1 Line 2");
  });

  it("should remove carriage returns", () => {
    const text = "Line 1\r\nLine 2";
    const sanitized = sanitizeForCsv(text);

    expect(sanitized).toBe("Line 1 Line 2");
  });

  it("should handle combined special characters", () => {
    const text = 'Text with "quotes"\nand\rnewlines';
    const sanitized = sanitizeForCsv(text);

    expect(sanitized).toBe('Text with ""quotes"" and newlines');
  });
});

describe("extractDomain", () => {
  it("should extract domain from URL", () => {
    expect(extractDomain("https://www.example.com/path")).toBe(
      "www.example.com"
    );
    expect(extractDomain("http://example.com")).toBe("example.com");
    expect(extractDomain("https://subdomain.example.com/page?query=1")).toBe(
      "subdomain.example.com"
    );
  });

  it("should return null for invalid URLs", () => {
    expect(extractDomain("not-a-url")).toBeNull();
    expect(extractDomain("")).toBeNull();
  });
});

describe("cleanCompanyName", () => {
  it("should remove common company suffixes", () => {
    expect(cleanCompanyName("Test Company Ltd")).toBe("Test Company");
    expect(cleanCompanyName("Test Company Limited")).toBe("Test Company");
    expect(cleanCompanyName("Test Company Inc.")).toBe("Test Company");
    expect(cleanCompanyName("Test Company LLC")).toBe("Test Company");
  });

  it("should handle multiple spaces", () => {
    expect(cleanCompanyName("Test   Company   Ltd")).toBe("Test Company");
  });

  it("should be case-insensitive for suffixes", () => {
    expect(cleanCompanyName("Test Company ltd")).toBe("Test Company");
    expect(cleanCompanyName("Test Company LTD")).toBe("Test Company");
  });

  it("should trim whitespace", () => {
    expect(cleanCompanyName("  Test Company Ltd  ")).toBe("Test Company");
  });

  it("should handle company name without suffix", () => {
    expect(cleanCompanyName("Test Company")).toBe("Test Company");
  });
});
