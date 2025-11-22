// Types for Wholesale Supplier Discovery System

export type SupplierCategory =
  | 'seating'
  | 'tables'
  | 'tents'
  | 'flooring_grass'
  | 'linens'
  | 'decor'
  | 'lighting'
  | 'sound'
  | 'staging_truss'
  | 'catering'
  | 'power_generators'
  | 'mobile_toilet'
  | 'bridal_wear';

export type DeliveryOption =
  | 'nationwide'
  | 'regional'
  | 'pickup_only';

export type NigerianState =
  | 'Abia' | 'Adamawa' | 'Akwa Ibom' | 'Anambra' | 'Bauchi' | 'Bayelsa'
  | 'Benue' | 'Borno' | 'Cross River' | 'Delta' | 'Ebonyi' | 'Edo'
  | 'Ekiti' | 'Enugu' | 'Gombe' | 'Imo' | 'Jigawa' | 'Kaduna'
  | 'Kano' | 'Katsina' | 'Kebbi' | 'Kogi' | 'Kwara' | 'Lagos'
  | 'Nasarawa' | 'Niger' | 'Ogun' | 'Ondo' | 'Osun' | 'Oyo'
  | 'Plateau' | 'Rivers' | 'Sokoto' | 'Taraba' | 'Yobe' | 'Zamfara'
  | 'FCT'; // Federal Capital Territory (Abuja)

export type SourcePlatform =
  | 'maps'
  | 'directory'
  | 'marketplace'
  | 'social'
  | 'official_site';

export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export interface WholesaleTerms {
  bulk_available: boolean;
  moq_units?: number | null;
  price_range_hint?: string | null;
  lead_time_days?: number | null;
  delivery_options: DeliveryOption[];
  returns_warranty?: string | null;
}

export interface Ratings {
  google?: {
    stars: number | null;
    count: number | null;
  };
  facebook?: {
    stars: number | null;
    count: number | null;
  };
}

export interface Socials {
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  others?: string[];
}

export interface Verifications {
  explicit_wholesale_language: boolean;
  evidence_snippets: string[];
  cac_number?: string | null;
}

export interface WholesaleSupplier {
  supplier_id: string; // stable hash
  company_name: string;
  aka_names: string[];
  categories: SupplierCategory[];
  product_examples: string[];

  wholesale_terms: WholesaleTerms;

  coverage_regions: string[];
  address_text: string | null;
  state: NigerianState | null;
  lga_or_city: string | null;
  lat: number | null;
  lon: number | null;

  phones: string[];
  whatsapp: string[];
  emails: string[];
  websites: string[];
  socials: Socials;
  business_hours: string | null;

  ratings: Ratings;
  verifications: Verifications;

  notes: string | null;
  source_url: string;
  source_platform: SourcePlatform;
  extracted_at: string; // ISO datetime
  confidence: number; // 0.0-1.0
}

export interface SourceLogEntry {
  run_id: string;
  run_at_utc: string;
  source_platform: SourcePlatform;
  source_url: string;
  http_status: number | null;
  parse_success: boolean;
  records_found: number;
  records_new: number;
  records_updated: number;
  records_merged: number;
  error_message: string | null;
  duration_ms: number | null;
  manual: boolean;
}

export interface SearchFilters {
  query?: string;
  states?: NigerianState[];
  categories?: SupplierCategory[];
  delivery_options?: DeliveryOption[];
  moq_min?: number;
  moq_max?: number;
  lead_time_max?: number;
  min_rating?: number;
  explicit_wholesale_only?: boolean;
  min_confidence?: number;
}

export interface SupplierCardData {
  id: string;
  supplier_id: string;
  company_name: string;
  categories: SupplierCategory[];
  key_products: string[];
  state: string | null;
  lga_or_city: string | null;
  primary_phone: string | null;
  primary_whatsapp: string | null;
  has_wholesale_verified: boolean;
  has_nationwide_delivery: boolean;
  price_hint: string | null;
  lead_time_days: number | null;
  last_updated: string;
  confidence: number;
}

// Normalized data structures for export
export interface NormalizedSupplier extends WholesaleSupplier {
  // Database metadata
  id: string; // Prisma CUID
  db_id?: string;
  approval_status?: ApprovalStatus;
  is_blacklisted?: boolean;
  last_seen_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const CATEGORY_LABELS: Record<SupplierCategory, string> = {
  seating: 'Seating',
  tables: 'Tables',
  tents: 'Tents & Canopies',
  flooring_grass: 'Flooring & Grass',
  linens: 'Linens',
  decor: 'Decor',
  lighting: 'Lighting',
  sound: 'Sound Equipment',
  staging_truss: 'Staging & Truss',
  catering: 'Catering Ware',
  power_generators: 'Generators',
  mobile_toilet: 'Mobile Toilets',
  bridal_wear: 'Bridal Wear',
};

export const NIGERIAN_STATES: NigerianState[] = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  'FCT',
];

export const GEOPOLITICAL_ZONES: Record<string, NigerianState[]> = {
  'South-West': ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'],
  'South-East': ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'],
  'South-South': ['Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Edo', 'Rivers'],
  'North-Central': ['Benue', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau', 'FCT'],
  'North-East': ['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'],
  'North-West': ['Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara'],
};
