// Base scraper interface

import { RawEventData, ScraperResult } from '../types';

/**
 * Base interface for all event scrapers
 */
export interface EventScraper {
  /**
   * Name of the source platform (e.g., "Church Website", "Eventbrite")
   */
  sourcePlatform: string;

  /**
   * Run the scraper and return raw event data
   */
  scrape(): Promise<ScraperResult>;
}

/**
 * Utility function to fetch HTML content with error handling
 */
export async function fetchHtml(url: string, timeout = 30000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching ${url}:`, error.message);
    }
    return null;
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
