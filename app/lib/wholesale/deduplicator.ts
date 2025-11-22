// Deduplication engine for wholesale suppliers

import { WholesaleSupplier, NormalizedSupplier } from './types';
import { generateSupplierId, dedupeArray } from './normalize';

interface DuplicateMatch {
  supplier1: NormalizedSupplier;
  supplier2: NormalizedSupplier;
  similarity: number;
  reason: string;
}

/**
 * Find potential duplicates in a list of suppliers
 */
export function findDuplicates(suppliers: NormalizedSupplier[]): DuplicateMatch[] {
  const duplicates: DuplicateMatch[] = [];

  for (let i = 0; i < suppliers.length; i++) {
    for (let j = i + 1; j < suppliers.length; j++) {
      const similarity = calculateSimilarity(suppliers[i], suppliers[j]);

      if (similarity >= 0.7) {
        duplicates.push({
          supplier1: suppliers[i],
          supplier2: suppliers[j],
          similarity,
          reason: getSimilarityReason(suppliers[i], suppliers[j]),
        });
      }
    }
  }

  return duplicates.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Calculate similarity score between two suppliers (0-1)
 */
function calculateSimilarity(s1: NormalizedSupplier, s2: NormalizedSupplier): number {
  let score = 0;
  let factors = 0;

  // 1. Supplier ID match (exact)
  if (s1.supplier_id === s2.supplier_id) {
    return 1.0; // Exact match
  }

  // 2. Company name similarity
  const nameSim = stringSimilarity(
    s1.company_name.toLowerCase(),
    s2.company_name.toLowerCase()
  );
  score += nameSim * 0.4;
  factors += 0.4;

  // 3. Phone number overlap
  const phoneOverlap = arrayOverlap(s1.phones, s2.phones);
  if (phoneOverlap > 0) {
    score += 0.3;
    factors += 0.3;
  }

  // 4. State match
  if (s1.state && s2.state && s1.state === s2.state) {
    score += 0.1;
    factors += 0.1;
  }

  // 5. Website/Email overlap
  const websiteOverlap = arrayOverlap(s1.websites, s2.websites);
  const emailOverlap = arrayOverlap(s1.emails, s2.emails);
  if (websiteOverlap > 0 || emailOverlap > 0) {
    score += 0.2;
    factors += 0.2;
  }

  return factors > 0 ? score / factors : 0;
}

/**
 * Get reason for similarity
 */
function getSimilarityReason(s1: NormalizedSupplier, s2: NormalizedSupplier): string {
  const reasons: string[] = [];

  if (s1.supplier_id === s2.supplier_id) {
    reasons.push('Identical supplier ID');
  }

  const nameSim = stringSimilarity(
    s1.company_name.toLowerCase(),
    s2.company_name.toLowerCase()
  );
  if (nameSim > 0.8) {
    reasons.push(`Similar names (${(nameSim * 100).toFixed(0)}% match)`);
  }

  const phoneOverlap = arrayOverlap(s1.phones, s2.phones);
  if (phoneOverlap > 0) {
    reasons.push(`${phoneOverlap} matching phone number(s)`);
  }

  const emailOverlap = arrayOverlap(s1.emails, s2.emails);
  if (emailOverlap > 0) {
    reasons.push(`${emailOverlap} matching email(s)`);
  }

  const websiteOverlap = arrayOverlap(s1.websites, s2.websites);
  if (websiteOverlap > 0) {
    reasons.push(`${websiteOverlap} matching website(s)`);
  }

  if (s1.state === s2.state && s1.state) {
    reasons.push(`Same state (${s1.state})`);
  }

  return reasons.join(', ');
}

/**
 * Merge two supplier records
 * Strategy: Union most fields, prefer most recent/complete data
 */
export function mergeSuppliers(
  primary: NormalizedSupplier,
  secondary: NormalizedSupplier
): NormalizedSupplier {
  return {
    ...primary,

    // Use primary's ID
    supplier_id: primary.supplier_id,
    db_id: primary.db_id,

    // Merge names
    company_name: primary.company_name, // Keep primary name
    aka_names: dedupeArray([
      ...primary.aka_names,
      ...secondary.aka_names,
      secondary.company_name, // Add secondary name as AKA
    ]),

    // Union categories and products
    categories: dedupeArray([...primary.categories, ...secondary.categories]),
    product_examples: dedupeArray([...primary.product_examples, ...secondary.product_examples]),

    // Merge wholesale terms (prefer primary, but union delivery options)
    wholesale_terms: {
      ...primary.wholesale_terms,
      delivery_options: dedupeArray([
        ...(primary.wholesale_terms?.delivery_options || []),
        ...(secondary.wholesale_terms?.delivery_options || []),
      ]),
      // Use primary's MOQ/price/lead time, fallback to secondary
      moq_units: primary.wholesale_terms?.moq_units || secondary.wholesale_terms?.moq_units,
      price_range_hint: primary.wholesale_terms?.price_range_hint || secondary.wholesale_terms?.price_range_hint,
      lead_time_days: primary.wholesale_terms?.lead_time_days || secondary.wholesale_terms?.lead_time_days,
      returns_warranty: primary.wholesale_terms?.returns_warranty || secondary.wholesale_terms?.returns_warranty,
    },

    // Union coverage regions
    coverage_regions: dedupeArray([...primary.coverage_regions, ...secondary.coverage_regions]),

    // Use primary location, fallback to secondary
    address_text: primary.address_text || secondary.address_text,
    state: primary.state || secondary.state,
    lga_or_city: primary.lga_or_city || secondary.lga_or_city,
    lat: primary.lat || secondary.lat,
    lon: primary.lon || secondary.lon,

    // Union all contact info
    phones: dedupeArray([...primary.phones, ...secondary.phones]),
    whatsapp: dedupeArray([...primary.whatsapp, ...secondary.whatsapp]),
    emails: dedupeArray([...primary.emails, ...secondary.emails]),
    websites: dedupeArray([...primary.websites, ...secondary.websites]),

    // Merge socials
    socials: {
      instagram: primary.socials?.instagram || secondary.socials?.instagram,
      facebook: primary.socials?.facebook || secondary.socials?.facebook,
      tiktok: primary.socials?.tiktok || secondary.socials?.tiktok,
      others: dedupeArray([
        ...(primary.socials?.others || []),
        ...(secondary.socials?.others || []),
      ]),
    },

    business_hours: primary.business_hours || secondary.business_hours,

    // Merge ratings (prefer higher count)
    ratings: {
      google: selectBetterRating(primary.ratings?.google, secondary.ratings?.google),
      facebook: selectBetterRating(primary.ratings?.facebook, secondary.ratings?.facebook),
    },

    // Merge verifications
    verifications: {
      explicit_wholesale_language:
        primary.verifications?.explicit_wholesale_language ||
        secondary.verifications?.explicit_wholesale_language,
      evidence_snippets: dedupeArray([
        ...(primary.verifications?.evidence_snippets || []),
        ...(secondary.verifications?.evidence_snippets || []),
      ]),
      cac_number: primary.verifications?.cac_number || secondary.verifications?.cac_number,
    },

    // Combine notes
    notes: [primary.notes, secondary.notes].filter(Boolean).join(' | '),

    // Keep primary source, but note merger
    source_url: primary.source_url + ` | merged: ${secondary.source_url}`,
    source_platform: primary.source_platform,

    // Use most recent extraction time
    extracted_at: new Date(primary.extracted_at) > new Date(secondary.extracted_at)
      ? primary.extracted_at
      : secondary.extracted_at,

    // Use higher confidence
    confidence: Math.max(primary.confidence, secondary.confidence),

    // Metadata
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Select better rating based on review count
 */
function selectBetterRating(
  r1: { stars: number | null; count: number | null } | undefined,
  r2: { stars: number | null; count: number | null } | undefined
): { stars: number | null; count: number | null } | undefined {
  if (!r1 && !r2) return undefined;
  if (!r1) return r2;
  if (!r2) return r1;

  const count1 = r1.count || 0;
  const count2 = r2.count || 0;

  return count1 >= count2 ? r1 : r2;
}

/**
 * Levenshtein distance-based string similarity (0-1)
 */
function stringSimilarity(s1: string, s2: string): number {
  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Count overlap between two arrays
 */
function arrayOverlap<T>(arr1: T[], arr2: T[]): number {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  let overlap = 0;

  for (const item of set1) {
    if (set2.has(item)) overlap++;
  }

  return overlap;
}

/**
 * Group suppliers by dedup key for batch processing
 */
export function groupByDedupKey(suppliers: NormalizedSupplier[]): Map<string, NormalizedSupplier[]> {
  const groups = new Map<string, NormalizedSupplier[]>();

  for (const supplier of suppliers) {
    const key = supplier.supplier_id;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(supplier);
  }

  return groups;
}

/**
 * Merge all suppliers in a group into one
 */
export function mergeGroup(suppliers: NormalizedSupplier[]): NormalizedSupplier {
  if (suppliers.length === 1) return suppliers[0];

  // Sort by confidence (highest first) and use as primary
  const sorted = suppliers.sort((a, b) => b.confidence - a.confidence);
  let merged = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    merged = mergeSuppliers(merged, sorted[i]);
  }

  return merged;
}
