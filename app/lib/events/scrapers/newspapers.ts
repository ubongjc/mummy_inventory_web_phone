// Newspaper scrapers for obituaries and announcements

import * as cheerio from 'cheerio';
import { EventScraper, fetchHtml, retryWithBackoff } from './base';
import { RawEventData, ScraperResult } from '../types';

/**
 * Scraper for Punch Nigeria obituaries
 */
export class PunchNewspaperScraper implements EventScraper {
  sourcePlatform = 'Punch Nigeria';
  private baseUrl = 'https://punchng.com';

  async scrape(): Promise<ScraperResult> {
    const startTime = Date.now();
    const events: RawEventData[] = [];
    const errors: string[] = [];

    try {
      // Punch obituary section
      const url = `${this.baseUrl}/topics/obituary/`;

      const html = await retryWithBackoff(() => fetchHtml(url));

      if (!html) {
        errors.push('Failed to fetch Punch obituaries');
        return {
          events,
          errors,
          executionTimeMs: Date.now() - startTime,
          sourcePlatform: this.sourcePlatform,
          sourceUrl: url,
        };
      }

      const $ = cheerio.load(html);

      // Parse obituary articles
      $('article, .post, .article-item').each((_, element) => {
        try {
          const title = $(element).find('h2, h3, .title').first().text().trim();
          const link = $(element).find('a').first().attr('href') || '';
          const date = $(element)
            .find('.date, time, .published')
            .first()
            .text()
            .trim();
          const excerpt = $(element).find('.excerpt, p').first().text().trim();

          // Check if it's about burial/funeral/memorial
          const lowerText = (title + ' ' + excerpt).toLowerCase();
          const isRelevant =
            lowerText.includes('burial') ||
            lowerText.includes('funeral') ||
            lowerText.includes('memorial') ||
            lowerText.includes('celebration of life') ||
            lowerText.includes('interment');

          if (isRelevant && title) {
            // Try to extract location from excerpt
            const locationMatch = excerpt.match(
              /(Lagos|Abuja|Port Harcourt|Kano|Ibadan|Enugu|[A-Z][a-z]+ State)/i
            );

            events.push({
              event_type: lowerText.includes('memorial') ? 'memorial' : 'burial',
              title,
              date_start: date || 'TBD',
              location_raw: locationMatch ? locationMatch[0] : excerpt.substring(0, 100),
              source_platform: this.sourcePlatform,
              source_url: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
              notes: 'From Punch obituaries section',
            });
          }
        } catch (err) {
          errors.push(`Error parsing Punch article: ${err}`);
        }
      });
    } catch (error) {
      errors.push(`Punch scraper error: ${error}`);
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
 * Scraper for The Guardian Nigeria obituaries
 */
export class GuardianNewspaperScraper implements EventScraper {
  sourcePlatform = 'The Guardian Nigeria';
  private baseUrl = 'https://guardian.ng';

  async scrape(): Promise<ScraperResult> {
    const startTime = Date.now();
    const events: RawEventData[] = [];
    const errors: string[] = [];

    try {
      // Guardian obituary/announcement section
      const url = `${this.baseUrl}/category/news/obituary/`;

      const html = await retryWithBackoff(() => fetchHtml(url));

      if (!html) {
        errors.push('Failed to fetch Guardian obituaries');
        return {
          events,
          errors,
          executionTimeMs: Date.now() - startTime,
          sourcePlatform: this.sourcePlatform,
          sourceUrl: url,
        };
      }

      const $ = cheerio.load(html);

      // Parse obituary articles
      $('article, .post-item, .article').each((_, element) => {
        try {
          const title = $(element).find('h2, h3, .post-title').first().text().trim();
          const link = $(element).find('a').first().attr('href') || '';
          const date = $(element)
            .find('.date, .post-date, time')
            .first()
            .text()
            .trim();
          const excerpt = $(element).find('.excerpt, .post-excerpt, p').first().text().trim();

          // Check relevance
          const lowerText = (title + ' ' + excerpt).toLowerCase();
          const isRelevant =
            lowerText.includes('burial') ||
            lowerText.includes('funeral') ||
            lowerText.includes('memorial') ||
            lowerText.includes('obituary') ||
            lowerText.includes('passes away') ||
            lowerText.includes('dies at');

          if (isRelevant && title) {
            // Extract location if mentioned
            const locationMatch = excerpt.match(
              /(Lagos|Abuja|Port Harcourt|Kano|Ibadan|Enugu|Calabar|[A-Z][a-z]+ State)/i
            );

            events.push({
              event_type: lowerText.includes('memorial') ? 'memorial' : 'burial',
              title,
              date_start: date || 'TBD',
              location_raw: locationMatch ? locationMatch[0] : excerpt.substring(0, 100),
              source_platform: this.sourcePlatform,
              source_url: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
              notes: 'From Guardian obituaries',
            });
          }
        } catch (err) {
          errors.push(`Error parsing Guardian article: ${err}`);
        }
      });
    } catch (error) {
      errors.push(`Guardian scraper error: ${error}`);
    }

    return {
      events,
      errors,
      executionTimeMs: Date.now() - startTime,
      sourcePlatform: this.sourcePlatform,
    };
  }
}
