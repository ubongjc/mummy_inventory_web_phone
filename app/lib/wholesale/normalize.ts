// Normalization and validation utilities for wholesale suppliers

import crypto from 'crypto';
import {
  WholesaleSupplier,
  NigerianState,
  NIGERIAN_STATES,
  SupplierCategory,
} from './types';

/**
 * Normalize phone number to E.164 format (+234...)
 */
export function normalizePhone(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle various Nigerian number formats
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  } else if (cleaned.startsWith('234')) {
    // Already in correct format
  } else if (cleaned.length === 10) {
    // Assume it's missing country code
    cleaned = '234' + cleaned;
  } else {
    return null; // Invalid format
  }

  // Validate length (Nigeria numbers are 13 digits with country code)
  if (cleaned.length !== 13) {
    return null;
  }

  return '+' + cleaned;
}

/**
 * Normalize state name to official Nigerian state
 */
export function normalizeState(stateText: string): NigerianState | null {
  if (!stateText) return null;

  const cleaned = stateText.trim();

  // Direct match
  const directMatch = NIGERIAN_STATES.find(
    (s) => s.toLowerCase() === cleaned.toLowerCase()
  );
  if (directMatch) return directMatch;

  // Handle common variations
  const variations: Record<string, NigerianState> = {
    'fct abuja': 'FCT',
    abuja: 'FCT',
    'federal capital territory': 'FCT',
    'cross-river': 'Cross River',
    'akwa-ibom': 'Akwa Ibom',
  };

  const normalizedKey = cleaned.toLowerCase();
  if (variations[normalizedKey]) {
    return variations[normalizedKey];
  }

  // Fuzzy match (contains)
  const fuzzyMatch = NIGERIAN_STATES.find((s) =>
    cleaned.toLowerCase().includes(s.toLowerCase()) ||
    s.toLowerCase().includes(cleaned.toLowerCase())
  );

  return fuzzyMatch || null;
}

/**
 * Extract state from address text
 */
export function extractStateFromAddress(addressText: string): NigerianState | null {
  if (!addressText) return null;

  // Try to find state mention in address
  for (const state of NIGERIAN_STATES) {
    const regex = new RegExp(`\\b${state}\\b`, 'i');
    if (regex.test(addressText)) {
      return state;
    }
  }

  // Check for common area/LGA mentions
  const areaToState: Record<string, NigerianState> = {
    'ikeja': 'Lagos',
    'lekki': 'Lagos',
    'victoria island': 'Lagos',
    'vi': 'Lagos',
    'ikoyi': 'Lagos',
    'surulere': 'Lagos',
    'yaba': 'Lagos',
    'festac': 'Lagos',
    'ojo': 'Lagos',
    'alaba': 'Lagos',
    'trade fair': 'Lagos',
    'port harcourt': 'Rivers',
    'ph': 'Rivers',
    'aba': 'Abia',
    'onitsha': 'Anambra',
    'enugu': 'Enugu',
    'kano': 'Kano',
    'kaduna': 'Kaduna',
    'ibadan': 'Oyo',
    'abeokuta': 'Ogun',
  };

  const lowerAddress = addressText.toLowerCase();
  for (const [area, state] of Object.entries(areaToState)) {
    if (lowerAddress.includes(area)) {
      return state;
    }
  }

  return null;
}

/**
 * Normalize company name (trim, title case)
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';

  return name
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generate stable supplier ID from key fields
 */
export function generateSupplierId(
  companyName: string,
  primaryPhone: string | null,
  state: NigerianState | null
): string {
  const key = `${companyName.toLowerCase()}|${primaryPhone || 'no-phone'}|${state || 'no-state'}`;
  return crypto.createHash('sha256').update(key).digest('hex').substring(0, 64);
}

/**
 * Map product keywords to categories
 */
export function categorizeProducts(productText: string): SupplierCategory[] {
  const categories = new Set<SupplierCategory>();
  const lower = productText.toLowerCase();

  const categoryKeywords: Record<SupplierCategory, string[]> = {
    seating: ['chair', 'chiavari', 'napoleon', 'ghost', 'folding', 'banquet chair', 'tiffany', 'resin'],
    tables: ['table', 'banquet table', 'round table', 'cocktail', 'serpentine'],
    tents: ['tent', 'canopy', 'marquee', 'pagoda', 'stretch', 'gazebo'],
    flooring_grass: ['grass', 'artificial turf', 'carpet grass', 'astro turf', 'floor', 'mat'],
    linens: ['linen', 'tablecloth', 'napkin', 'table runner', 'chair cover', 'sash'],
    decor: ['decor', 'decoration', 'centerpiece', 'backdrop', 'flower', 'balloon'],
    lighting: ['light', 'led', 'par', 'wash', 'spot', 'uplighting', 'fairy lights'],
    sound: ['sound', 'speaker', 'mixer', 'microphone', 'pa system', 'line array', 'subwoofer'],
    staging_truss: ['stage', 'truss', 'platform', 'riser', 'runway'],
    catering: ['catering', 'chafing dish', 'buffet', 'warmer', 'serving'],
    power_generators: ['generator', 'power', 'kva', 'gen'],
    mobile_toilet: ['toilet', 'portable toilet', 'restroom', 'loo'],
    bridal_wear: ['wedding gown', 'bridal', 'bride', 'gown rental', 'dress'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords) as [SupplierCategory, string[]][]) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        categories.add(category);
        break;
      }
    }
  }

  return Array.from(categories);
}

/**
 * Detect wholesale language in text
 */
export function detectWholesaleLanguage(text: string): {
  isWholesale: boolean;
  evidenceSnippets: string[];
  confidence: number;
} {
  const lower = text.toLowerCase();
  const evidenceSnippets: string[] = [];
  let score = 0;

  const wholesaleKeywords = [
    { pattern: /\bwholesale\b/gi, weight: 0.3, label: 'wholesale' },
    { pattern: /\bbulk\s+(sale|order|purchase|buy)/gi, weight: 0.25, label: 'bulk' },
    { pattern: /\bdistributor\b/gi, weight: 0.2, label: 'distributor' },
    { pattern: /\bmanufacturer\b/gi, weight: 0.15, label: 'manufacturer' },
    { pattern: /\bimporter\b/gi, weight: 0.15, label: 'importer' },
    { pattern: /\bmoq\b|minimum\s+order/gi, weight: 0.2, label: 'MOQ' },
    { pattern: /\bcarton|pallet|container/gi, weight: 0.15, label: 'bulk units' },
    { pattern: /\bb2b\b|business\s+to\s+business/gi, weight: 0.2, label: 'B2B' },
    { pattern: /\btrade\s+price/gi, weight: 0.2, label: 'trade price' },
    { pattern: /\bwholesale\s+and\s+retail/gi, weight: 0.25, label: 'wholesale & retail' },
  ];

  for (const { pattern, weight, label } of wholesaleKeywords) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      score += weight;
      evidenceSnippets.push(`'${matches[0]}' (${label})`);
    }
  }

  return {
    isWholesale: score >= 0.3,
    evidenceSnippets,
    confidence: Math.min(score, 1.0),
  };
}

/**
 * Calculate confidence score for a supplier record
 */
export function calculateConfidence(supplier: Partial<WholesaleSupplier>): number {
  let confidence = 0.5; // Base confidence

  // Has explicit wholesale language
  if (supplier.verifications?.explicit_wholesale_language) {
    confidence += 0.2;
  }

  // Has wholesale terms with MOQ
  if (supplier.wholesale_terms?.moq_units) {
    confidence += 0.1;
  }

  // Has contact info
  if (supplier.phones && supplier.phones.length > 0) confidence += 0.05;
  if (supplier.whatsapp && supplier.whatsapp.length > 0) confidence += 0.05;
  if (supplier.emails && supplier.emails.length > 0) confidence += 0.05;

  // Has location
  if (supplier.state) confidence += 0.05;

  // Has verification (CAC number)
  if (supplier.verifications?.cac_number) {
    confidence += 0.1;
  }

  // Has multiple categories
  if (supplier.categories && supplier.categories.length >= 2) {
    confidence += 0.05;
  }

  // Penalize if no wholesale terms
  if (!supplier.wholesale_terms || !supplier.wholesale_terms.bulk_available) {
    confidence -= 0.1;
  }

  return Math.max(0, Math.min(1, confidence));
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch {
    return null;
  }
}

/**
 * Deduplicate array and clean values
 */
export function dedupeArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr.filter(Boolean)));
}
