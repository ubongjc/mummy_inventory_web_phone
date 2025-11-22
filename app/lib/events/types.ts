// Type definitions for Nigerian Events feature

export type EventType =
  | 'wedding'
  | 'traditional_marriage'
  | 'burial'
  | 'memorial'
  | 'child_dedication'
  | 'christening'
  | 'naming'
  | 'thanksgiving'
  | 'anniversary'
  | 'birthday'
  | 'other_ceremony';

export interface RawEventData {
  event_type: EventType;
  title: string;
  date_start: string; // ISO 8601 or parseable date string
  date_end?: string | null;
  location_raw?: string | null;
  location_state?: string | null;
  location_city_lga?: string | null;
  venue_name?: string | null;
  contact_name?: string | null;
  contact_role?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  organizer_org?: string | null;
  organizer_social?: string | null;
  source_platform: string;
  source_url: string;
  source_published_at?: string | null;
  notes?: string | null;
}

export interface NormalizedEvent {
  event_id: string;
  event_type: EventType;
  title: string;
  date_start: Date;
  date_end: Date | null;
  location_raw: string | null;
  location_state: string | null;
  location_city_lga: string | null;
  venue_name: string | null;
  contact_name: string | null;
  contact_role: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  organizer_org: string | null;
  organizer_social: string | null;
  source_platform: string;
  source_url: string;
  source_published_at: Date | null;
  extracted_at: Date;
  confidence: number;
  notes: string | null;
}

export interface ScraperResult {
  events: RawEventData[];
  errors: string[];
  executionTimeMs: number;
  sourcePlatform: string;
  sourceUrl?: string;
}

export interface SourceLogEntry {
  runAtUtc: Date;
  sourcePlatform: string;
  sourceUrl?: string;
  eventsAdded: number;
  eventsUpdated: number;
  eventsRemoved: number;
  errors: string | null;
  totalActive: number;
  executionTimeMs: number;
}

// Nigeria States
export const NIGERIA_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const;

export type NigeriaState = (typeof NIGERIA_STATES)[number];
