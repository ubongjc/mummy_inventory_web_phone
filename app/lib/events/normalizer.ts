// Data normalization utilities for Nigerian Events

import crypto from 'crypto';
import { RawEventData, NormalizedEvent, NIGERIA_STATES, NigeriaState } from './types';

/**
 * Normalize a raw event into the standard format
 */
export function normalizeEvent(raw: RawEventData): NormalizedEvent {
  const dateStart = parseDate(raw.date_start);
  const dateEnd = raw.date_end ? parseDate(raw.date_end) : null;

  const normalizedState = normalizeState(raw.location_state, raw.location_raw);
  const contactPhone = normalizePhone(raw.contact_phone);

  // Generate stable event ID
  const eventId = generateEventId(
    raw.title,
    dateStart,
    normalizedState || '',
    raw.source_url
  );

  // Calculate confidence score
  const confidence = calculateConfidence(raw, dateStart, dateEnd);

  return {
    event_id: eventId,
    event_type: raw.event_type,
    title: raw.title.trim().substring(0, 200),
    date_start: dateStart,
    date_end: dateEnd,
    location_raw: raw.location_raw?.trim().substring(0, 300) || null,
    location_state: normalizedState,
    location_city_lga: raw.location_city_lga?.trim().substring(0, 100) || null,
    venue_name: raw.venue_name?.trim().substring(0, 200) || null,
    contact_name: raw.contact_name?.trim().substring(0, 100) || null,
    contact_role: raw.contact_role?.trim().substring(0, 100) || null,
    contact_phone: contactPhone,
    contact_email: raw.contact_email?.trim().toLowerCase().substring(0, 254) || null,
    organizer_org: raw.organizer_org?.trim().substring(0, 200) || null,
    organizer_social: raw.organizer_social?.trim().substring(0, 500) || null,
    source_platform: raw.source_platform.trim().substring(0, 100),
    source_url: raw.source_url.trim(),
    source_published_at: raw.source_published_at ? parseDate(raw.source_published_at) : null,
    extracted_at: new Date(),
    confidence,
    notes: raw.notes?.trim().substring(0, 500) || null,
  };
}

/**
 * Parse various date formats into ISO Date
 */
export function parseDate(dateStr: string): Date {
  // Try ISO format first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try common Nigerian date formats
  // "Saturday, 7th December 2025"
  // "7th Dec 2025"
  // "December 7, 2025"
  // "07/12/2025" (DD/MM/YYYY)
  // "next Sunday"
  // "Sat 3pm"

  const lowerStr = dateStr.toLowerCase().trim();

  // Handle relative dates
  if (lowerStr.includes('next') || lowerStr.includes('this')) {
    // Simplified: just use current date + some days
    // In production, use a proper date parsing library like chrono-node
    date = new Date();
    if (lowerStr.includes('next week')) date.setDate(date.getDate() + 7);
    else if (lowerStr.includes('next month')) date.setMonth(date.getMonth() + 1);
    else date.setDate(date.getDate() + 7); // Default to next week
    return date;
  }

  // Try DD/MM/YYYY format (common in Nigeria)
  const ddmmyyyyMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Fallback: return current date (should log warning in production)
  console.warn(`Unable to parse date: ${dateStr}`);
  return new Date();
}

/**
 * Normalize state names to official Nigeria state list
 */
export function normalizeState(
  stateStr: string | null | undefined,
  locationRaw: string | null | undefined
): string | null {
  if (!stateStr && !locationRaw) return null;

  const searchText = `${stateStr || ''} ${locationRaw || ''}`.toLowerCase();

  // Direct match
  for (const state of NIGERIA_STATES) {
    if (searchText.includes(state.toLowerCase())) {
      return state;
    }
  }

  // Common city to state mappings
  const cityToState: Record<string, NigeriaState> = {
    'lagos': 'Lagos',
    'festac': 'Lagos',
    'ikeja': 'Lagos',
    'lekki': 'Lagos',
    'yaba': 'Lagos',
    'surulere': 'Lagos',
    'abuja': 'FCT',
    'wuse': 'FCT',
    'garki': 'FCT',
    'maitama': 'FCT',
    'port harcourt': 'Rivers',
    'calabar': 'Cross River',
    'ibadan': 'Oyo',
    'kano': 'Kano',
    'kaduna': 'Kaduna',
    'enugu': 'Enugu',
    'aba': 'Abia',
    'onitsha': 'Anambra',
    'warri': 'Delta',
    'benin': 'Edo',
    'jos': 'Plateau',
    'maiduguri': 'Borno',
  };

  for (const [city, state] of Object.entries(cityToState)) {
    if (searchText.includes(city)) {
      return state;
    }
  }

  return null;
}

/**
 * Normalize phone to E.164 format (if possible)
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Nigerian numbers typically start with 0 or +234
  if (digits.startsWith('0') && digits.length === 11) {
    return `+234${digits.substring(1)}`;
  }

  if (digits.startsWith('234') && digits.length === 13) {
    return `+${digits}`;
  }

  // Return as-is if can't normalize
  return phone.trim().substring(0, 20);
}

/**
 * Generate a stable event ID from key fields
 */
export function generateEventId(
  title: string,
  dateStart: Date,
  locationState: string,
  sourceUrl: string
): string {
  const hashInput = [
    title.toLowerCase().trim(),
    dateStart.toISOString().split('T')[0], // Just the date part
    locationState.toLowerCase(),
    sourceUrl.toLowerCase().trim(),
  ].join('|');

  const hash = crypto
    .createHash('sha256')
    .update(hashInput)
    .digest('hex')
    .substring(0, 32);

  return `evt_${hash}`;
}

/**
 * Calculate confidence score based on data completeness
 */
function calculateConfidence(
  raw: RawEventData,
  dateStart: Date,
  dateEnd: Date | null
): number {
  let confidence = 0.6; // Base confidence

  // Exact date present
  if (raw.date_start && !raw.date_start.toLowerCase().includes('next')) {
    confidence += 0.1;
  }

  // Venue present
  if (raw.venue_name) {
    confidence += 0.05;
  }

  // Direct organizer contact present
  if (raw.contact_name && (raw.contact_phone || raw.contact_email)) {
    confidence += 0.15;
  }

  // State identified
  if (raw.location_state) {
    confidence += 0.05;
  }

  // Cap at 0.95
  return Math.min(confidence, 0.95);
}

/**
 * Check if two events are duplicates (fuzzy matching)
 */
export function areEventsDuplicate(event1: NormalizedEvent, event2: NormalizedEvent): boolean {
  // Same event_id = exact duplicate
  if (event1.event_id === event2.event_id) {
    return true;
  }

  // Fuzzy matching: same title (case-insensitive), similar date, same state
  const sameTitle = event1.title.toLowerCase() === event2.title.toLowerCase();
  const sameDateStart = Math.abs(event1.date_start.getTime() - event2.date_start.getTime()) < 86400000; // Within 1 day
  const sameState = event1.location_state === event2.location_state;

  return sameTitle && sameDateStart && sameState;
}

/**
 * Deduplicate array of events, keeping the most complete record
 */
export function deduplicateEvents(events: NormalizedEvent[]): NormalizedEvent[] {
  const uniqueEvents: NormalizedEvent[] = [];

  for (const event of events) {
    const existingIndex = uniqueEvents.findIndex((e) => areEventsDuplicate(e, event));

    if (existingIndex === -1) {
      uniqueEvents.push(event);
    } else {
      // Keep the one with higher confidence
      if (event.confidence > uniqueEvents[existingIndex].confidence) {
        uniqueEvents[existingIndex] = event;
      }
    }
  }

  return uniqueEvents;
}

/**
 * Check if an event falls within the rolling window
 * (7 days before yesterday to any future date)
 */
export function isEventInWindow(event: NormalizedEvent): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const windowStart = new Date(yesterday);
  windowStart.setDate(windowStart.getDate() - 7);

  // Use end date if present, otherwise start date
  const eventDate = event.date_end || event.date_start;

  return eventDate >= windowStart;
}
