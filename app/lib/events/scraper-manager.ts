// Scraper manager to orchestrate all event scrapers

import { PrismaClient } from '@prisma/client';
import { EventScraper } from './scrapers/base';
import { HFCCFestacScraper, StJudeYabaScraper, ParishBulletinScraper } from './scrapers/church-websites';
import { EventbriteScraper, AllEventsScraper, TixAfricaScraper } from './scrapers/event-platforms';
import { PunchNewspaperScraper, GuardianNewspaperScraper } from './scrapers/newspapers';
import { normalizeEvent, deduplicateEvents, isEventInWindow } from './normalizer';
import { NormalizedEvent, SourceLogEntry } from './types';

const prisma = new PrismaClient();

/**
 * Main scraper manager that coordinates all scrapers
 */
export class EventScraperManager {
  private scrapers: EventScraper[];

  constructor() {
    // Initialize all scrapers
    this.scrapers = [
      // Church websites
      new HFCCFestacScraper(),
      new StJudeYabaScraper(),
      new ParishBulletinScraper(),

      // Event platforms
      new EventbriteScraper(),
      new AllEventsScraper(),
      new TixAfricaScraper(),

      // Newspapers
      new PunchNewspaperScraper(),
      new GuardianNewspaperScraper(),
    ];
  }

  /**
   * Run all scrapers and update the database
   */
  async runAll(): Promise<{
    totalAdded: number;
    totalUpdated: number;
    totalRemoved: number;
    sourceLogs: SourceLogEntry[];
    errors: string[];
  }> {
    console.log('Starting event scraping run...');

    let totalAdded = 0;
    let totalUpdated = 0;
    const sourceLogs: SourceLogEntry[] = [];
    const allErrors: string[] = [];
    const allEvents: NormalizedEvent[] = [];

    // Run all scrapers in parallel for efficiency
    const scraperResults = await Promise.allSettled(
      this.scrapers.map(async (scraper) => {
        try {
          console.log(`Running scraper: ${scraper.sourcePlatform}`);
          const result = await scraper.scrape();

          // Normalize raw events
          const normalizedEvents = result.events.map(normalizeEvent);

          return {
            ...result,
            normalizedEvents,
          };
        } catch (error) {
          console.error(`Scraper ${scraper.sourcePlatform} failed:`, error);
          return {
            events: [],
            normalizedEvents: [],
            errors: [`Scraper failed: ${error}`],
            executionTimeMs: 0,
            sourcePlatform: scraper.sourcePlatform,
          };
        }
      })
    );

    // Collect all events and process results
    for (const result of scraperResults) {
      if (result.status === 'fulfilled') {
        const scraperResult = result.value;
        allEvents.push(...scraperResult.normalizedEvents);
        allErrors.push(...scraperResult.errors);
      }
    }

    console.log(`Collected ${allEvents.length} events from all sources`);

    // Deduplicate events
    const uniqueEvents = deduplicateEvents(allEvents);
    console.log(`After deduplication: ${uniqueEvents.length} unique events`);

    // Filter events within the rolling window (7 days before yesterday to future)
    const eventsInWindow = uniqueEvents.filter(isEventInWindow);
    console.log(`Events in rolling window: ${eventsInWindow.length}`);

    // Update database
    const { added, updated, removed } = await this.updateDatabase(eventsInWindow);
    totalAdded = added;
    totalUpdated = updated;
    const totalRemoved = removed;

    // Create source logs
    for (const result of scraperResults) {
      if (result.status === 'fulfilled') {
        const scraperResult = result.value;

        const logEntry: SourceLogEntry = {
          runAtUtc: new Date(),
          sourcePlatform: scraperResult.sourcePlatform,
          sourceUrl: scraperResult.sourceUrl,
          eventsAdded: scraperResult.normalizedEvents.length,
          eventsUpdated: 0, // Will be calculated per-source if needed
          eventsRemoved: 0,
          errors: scraperResult.errors.length > 0 ? JSON.stringify(scraperResult.errors) : null,
          totalActive: eventsInWindow.length,
          executionTimeMs: scraperResult.executionTimeMs,
        };

        sourceLogs.push(logEntry);

        // Save to database
        await prisma.eventSourceLog.create({
          data: {
            runAtUtc: logEntry.runAtUtc,
            sourcePlatform: logEntry.sourcePlatform,
            sourceUrl: logEntry.sourceUrl,
            eventsAdded: logEntry.eventsAdded,
            eventsUpdated: logEntry.eventsUpdated,
            eventsRemoved: logEntry.eventsRemoved,
            errors: logEntry.errors,
            totalActive: logEntry.totalActive,
            executionTimeMs: logEntry.executionTimeMs,
          },
        });
      }
    }

    console.log('Event scraping run complete');
    console.log(`Added: ${totalAdded}, Updated: ${totalUpdated}, Removed: ${totalRemoved}`);

    return {
      totalAdded,
      totalUpdated,
      totalRemoved,
      sourceLogs,
      errors: allErrors,
    };
  }

  /**
   * Update database with new events, handling inserts, updates, and removals
   */
  private async updateDatabase(
    events: NormalizedEvent[]
  ): Promise<{ added: number; updated: number; removed: number }> {
    let added = 0;
    let updated = 0;

    // Upsert events
    for (const event of events) {
      try {
        const existing = await prisma.nigerianEvent.findUnique({
          where: { eventId: event.event_id },
        });

        if (existing) {
          // Update if data has changed
          await prisma.nigerianEvent.update({
            where: { eventId: event.event_id },
            data: {
              eventType: event.event_type,
              title: event.title,
              dateStart: event.date_start,
              dateEnd: event.date_end,
              locationRaw: event.location_raw,
              locationState: event.location_state,
              locationCityLga: event.location_city_lga,
              venueName: event.venue_name,
              contactName: event.contact_name,
              contactRole: event.contact_role,
              contactPhone: event.contact_phone,
              contactEmail: event.contact_email,
              organizerOrg: event.organizer_org,
              organizerSocial: event.organizer_social,
              sourcePlatform: event.source_platform,
              sourceUrl: event.source_url,
              sourcePublishedAt: event.source_published_at,
              extractedAt: event.extracted_at,
              confidence: event.confidence,
              notes: event.notes,
            },
          });
          updated++;
        } else {
          // Insert new event
          await prisma.nigerianEvent.create({
            data: {
              eventId: event.event_id,
              eventType: event.event_type,
              title: event.title,
              dateStart: event.date_start,
              dateEnd: event.date_end,
              locationRaw: event.location_raw,
              locationState: event.location_state,
              locationCityLga: event.location_city_lga,
              venueName: event.venue_name,
              contactName: event.contact_name,
              contactRole: event.contact_role,
              contactPhone: event.contact_phone,
              contactEmail: event.contact_email,
              organizerOrg: event.organizer_org,
              organizerSocial: event.organizer_social,
              sourcePlatform: event.source_platform,
              sourceUrl: event.source_url,
              sourcePublishedAt: event.source_published_at,
              extractedAt: event.extracted_at,
              confidence: event.confidence,
              notes: event.notes,
            },
          });
          added++;
        }
      } catch (error) {
        console.error(`Error upserting event ${event.event_id}:`, error);
      }
    }

    // Remove events outside the rolling window
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const windowStart = new Date(yesterday);
    windowStart.setDate(windowStart.getDate() - 7);

    const removeResult = await prisma.nigerianEvent.deleteMany({
      where: {
        dateStart: {
          lt: windowStart,
        },
        dateEnd: null, // If no end date, use start date
      },
    });

    const removed = removeResult.count;

    return { added, updated, removed };
  }

  /**
   * Run a specific scraper by platform name
   */
  async runSingle(platformName: string) {
    const scraper = this.scrapers.find((s) => s.sourcePlatform === platformName);

    if (!scraper) {
      throw new Error(`Scraper not found: ${platformName}`);
    }

    const result = await scraper.scrape();
    const normalizedEvents = result.events.map(normalizeEvent);
    const uniqueEvents = deduplicateEvents(normalizedEvents);
    const eventsInWindow = uniqueEvents.filter(isEventInWindow);

    const { added, updated, removed } = await this.updateDatabase(eventsInWindow);

    return {
      scraper: platformName,
      eventsFound: result.events.length,
      eventsUnique: uniqueEvents.length,
      eventsInWindow: eventsInWindow.length,
      added,
      updated,
      removed,
      errors: result.errors,
    };
  }
}
