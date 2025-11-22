// Event platform scrapers (Eventbrite, AllEvents, Tix Africa)

import * as cheerio from 'cheerio';
import { EventScraper, fetchHtml, retryWithBackoff } from './base';
import { RawEventData, ScraperResult } from '../types';

/**
 * Scraper for Eventbrite Nigeria events
 */
export class EventbriteScraper implements EventScraper {
  sourcePlatform = 'Eventbrite';
  private searchQueries = [
    'wedding nigeria',
    'traditional marriage nigeria',
    'burial ceremony nigeria',
    'child dedication nigeria',
    'thanksgiving service nigeria',
  ];

  async scrape(): Promise<ScraperResult> {
    const startTime = Date.now();
    const events: RawEventData[] = [];
    const errors: string[] = [];

    try {
      for (const query of this.searchQueries) {
        try {
          const encodedQuery = encodeURIComponent(query);
          const url = `https://www.eventbrite.com/d/nigeria--nigeria/${encodedQuery}/`;

          const html = await retryWithBackoff(() => fetchHtml(url));

          if (!html) {
            errors.push(`Failed to fetch Eventbrite for query: ${query}`);
            continue;
          }

          const $ = cheerio.load(html);

          // Parse event listings
          // Note: Eventbrite structure may vary, update selectors as needed
          $('[data-testid="search-result-item"], .event-card').each((_, element) => {
            try {
              const title = $(element).find('.event-title, h3, h2').first().text().trim();
              const date = $(element)
                .find('.event-date, [data-testid="event-date"]')
                .first()
                .text()
                .trim();
              const location = $(element)
                .find('.event-location, [data-testid="event-location"]')
                .first()
                .text()
                .trim();
              const eventUrl = $(element).find('a').first().attr('href') || '';

              // Determine event type from title/description
              let eventType: RawEventData['event_type'] = 'other_ceremony';
              const lowerTitle = title.toLowerCase();

              if (lowerTitle.includes('wedding')) {
                eventType = 'wedding';
              } else if (lowerTitle.includes('traditional marriage')) {
                eventType = 'traditional_marriage';
              } else if (lowerTitle.includes('burial') || lowerTitle.includes('funeral')) {
                eventType = 'burial';
              } else if (lowerTitle.includes('dedication')) {
                eventType = 'child_dedication';
              } else if (lowerTitle.includes('thanksgiving')) {
                eventType = 'thanksgiving';
              }

              if (title && date) {
                events.push({
                  event_type: eventType,
                  title,
                  date_start: date,
                  location_raw: location,
                  source_platform: this.sourcePlatform,
                  source_url: eventUrl.startsWith('http')
                    ? eventUrl
                    : `https://www.eventbrite.com${eventUrl}`,
                  notes: `Found via search: ${query}`,
                });
              }
            } catch (err) {
              errors.push(`Error parsing Eventbrite event: ${err}`);
            }
          });
        } catch (err) {
          errors.push(`Error scraping Eventbrite for "${query}": ${err}`);
        }
      }
    } catch (error) {
      errors.push(`Eventbrite scraper error: ${error}`);
    }

    return {
      events,
      errors,
      executionTimeMs: Date.now() - startTime,
      sourcePlatform: this.sourcePlatform,
    };
  }
}

/**
 * Scraper for AllEvents.in Nigeria section
 */
export class AllEventsScraper implements EventScraper {
  sourcePlatform = 'AllEvents.in';
  private baseUrl = 'https://allevents.in';

  async scrape(): Promise<ScraperResult> {
    const startTime = Date.now();
    const events: RawEventData[] = [];
    const errors: string[] = [];

    try {
      // Search for Nigerian wedding/ceremony events
      const categories = [
        'weddings',
        'religious',
        'family',
      ];

      for (const category of categories) {
        try {
          const url = `${this.baseUrl}/nigeria/${category}`;
          const html = await retryWithBackoff(() => fetchHtml(url));

          if (!html) {
            errors.push(`Failed to fetch AllEvents category: ${category}`);
            continue;
          }

          const $ = cheerio.load(html);

          // Parse event cards
          $('.event-card, .event-item').each((_, element) => {
            try {
              const title = $(element).find('.event-title, h3').first().text().trim();
              const date = $(element).find('.event-date').first().text().trim();
              const location = $(element).find('.event-location').first().text().trim();
              const link = $(element).find('a').first().attr('href') || '';

              let eventType: RawEventData['event_type'] = 'other_ceremony';
              const lowerTitle = title.toLowerCase();

              if (lowerTitle.includes('wedding')) eventType = 'wedding';
              else if (lowerTitle.includes('burial') || lowerTitle.includes('memorial'))
                eventType = 'burial';
              else if (lowerTitle.includes('thanksgiving')) eventType = 'thanksgiving';

              if (title && date) {
                events.push({
                  event_type: eventType,
                  title,
                  date_start: date,
                  location_raw: location,
                  source_platform: this.sourcePlatform,
                  source_url: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
                  notes: `Category: ${category}`,
                });
              }
            } catch (err) {
              errors.push(`Error parsing AllEvents event: ${err}`);
            }
          });
        } catch (err) {
          errors.push(`Error scraping AllEvents category "${category}": ${err}`);
        }
      }
    } catch (error) {
      errors.push(`AllEvents scraper error: ${error}`);
    }

    return {
      events,
      errors,
      executionTimeMs: Date.now() - startTime,
      sourcePlatform: this.sourcePlatform,
    };
  }
}

/**
 * Scraper for Tix Africa events
 */
export class TixAfricaScraper implements EventScraper {
  sourcePlatform = 'Tix Africa';
  private baseUrl = 'https://tix.africa';

  async scrape(): Promise<ScraperResult> {
    const startTime = Date.now();
    const events: RawEventData[] = [];
    const errors: string[] = [];

    try {
      const url = `${this.baseUrl}/discover/ng`; // Nigeria events

      const html = await retryWithBackoff(() => fetchHtml(url));

      if (!html) {
        errors.push('Failed to fetch Tix Africa events');
        return {
          events,
          errors,
          executionTimeMs: Date.now() - startTime,
          sourcePlatform: this.sourcePlatform,
          sourceUrl: url,
        };
      }

      const $ = cheerio.load(html);

      // Parse event listings
      $('.event-card, .event-item, [class*="event"]').each((_, element) => {
        try {
          const title = $(element).find('h2, h3, .title').first().text().trim();
          const date = $(element).find('.date, [class*="date"]').first().text().trim();
          const location = $(element).find('.location, [class*="location"]').first().text().trim();
          const link = $(element).find('a').first().attr('href') || '';

          let eventType: RawEventData['event_type'] = 'other_ceremony';
          const lowerTitle = title.toLowerCase();

          if (lowerTitle.includes('wedding')) eventType = 'wedding';
          else if (lowerTitle.includes('thanksgiving')) eventType = 'thanksgiving';

          if (title && date) {
            events.push({
              event_type: eventType,
              title,
              date_start: date,
              location_raw: location,
              source_platform: this.sourcePlatform,
              source_url: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
            });
          }
        } catch (err) {
          errors.push(`Error parsing Tix Africa event: ${err}`);
        }
      });
    } catch (error) {
      errors.push(`Tix Africa scraper error: ${error}`);
    }

    return {
      events,
      errors,
      executionTimeMs: Date.now() - startTime,
      sourcePlatform: this.sourcePlatform,
    };
  }
}
