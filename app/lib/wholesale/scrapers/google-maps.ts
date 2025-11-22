/**
 * Google Maps Scraper
 *
 * Scrapes wholesale supplier data from Google Places API (New).
 * Uses Google Places API (New) with Text Search and Place Details endpoints.
 *
 * API Documentation: https://developers.google.com/maps/documentation/places/web-service/text-search
 */

import { BaseScraper, ScraperResult } from "./base";
import type { WholesaleSupplier } from "../types";
import { NIGERIAN_STATES } from "../types";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types?: string[];
}

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    weekday_text?: string[];
  };
  geometry?: {
    location: { lat: number; lng: number };
  };
  types?: string[];
  reviews?: Array<{ text: string }>;
}

export class GoogleMapsScraper extends BaseScraper {
  private apiKey: string;
  private readonly TEXT_SEARCH_URL =
    "https://maps.googleapis.com/maps/api/place/textsearch/json";
  private readonly PLACE_DETAILS_URL =
    "https://maps.googleapis.com/maps/api/place/details/json";

  constructor() {
    super({
      source_platform: "maps",
      rate_limit_delay_ms: 2000, // Google has rate limits
      user_agent: "WholesaleSupplierBot/1.0",
    });

    // API key from environment variable
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || "";

    if (!this.apiKey) {
      console.warn(
        "[GoogleMapsScraper] WARNING: GOOGLE_PLACES_API_KEY not set. Scraper will not function."
      );
    }
  }

  async scrape(options?: {
    states?: string[];
    categories?: string[];
  }): Promise<ScraperResult> {
    if (!this.apiKey) {
      const error = "Google Places API key not configured";
      this.errors.push(error);
      return {
        success: false,
        records_found: 0,
        records_new: 0,
        records_updated: 0,
        errors: [error],
      };
    }

    let recordsFound = 0;
    let recordsNew = 0;
    let recordsUpdated = 0;

    const statesToSearch = options?.states || NIGERIAN_STATES;
    const searchQueries = this.generateSearchQueries(statesToSearch);

    console.log(
      `[GoogleMapsScraper] Starting scrape for ${searchQueries.length} queries...`
    );

    for (const query of searchQueries) {
      try {
        await this.logSource(query.url, "running", {});

        // Search for places
        const places = await this.textSearch(query.searchTerm);

        console.log(
          `[GoogleMapsScraper] Found ${places.length} places for "${query.searchTerm}"`
        );

        // Get details for each place
        for (const place of places) {
          try {
            const details = await this.getPlaceDetails(place.place_id);
            const supplier = this.extractSupplierData(details, query.state);

            if (supplier) {
              const result = await this.saveSupplier(supplier);
              if (result.isNew) recordsNew++;
              else recordsUpdated++;
              recordsFound++;
            }

            // Rate limiting between detail requests
            await this.delay(500);
          } catch (error) {
            console.error(
              `[GoogleMapsScraper] Error processing place ${place.place_id}:`,
              error
            );
          }
        }

        await this.logSource(query.url, "completed", {
          httpStatus: 200,
          parseSuccess: true,
          recordsFound: places.length,
          recordsNew,
          recordsUpdated,
        });

        // Rate limiting between searches
        await this.delay(this.config.rate_limit_delay_ms);
      } catch (error) {
        const errorMsg = `Error scraping ${query.url}: ${error}`;
        this.errors.push(errorMsg);
        await this.logSource(query.url, "failed", {
          httpStatus: 500,
          parseSuccess: false,
          errorMessage: errorMsg,
        });
      }
    }

    console.log(
      `[GoogleMapsScraper] Complete: ${recordsFound} found, ${recordsNew} new, ${recordsUpdated} updated`
    );

    return {
      success: this.errors.length === 0,
      records_found: recordsFound,
      records_new: recordsNew,
      records_updated: recordsUpdated,
      errors: this.errors,
    };
  }

  /**
   * Search for places using Text Search API
   */
  private async textSearch(query: string): Promise<PlaceResult[]> {
    const url = `${this.TEXT_SEARCH_URL}?query=${encodeURIComponent(
      query
    )}&key=${this.apiKey}`;

    const response = await this.fetchWithRetry(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return data.results || [];
  }

  /**
   * Get detailed information about a place
   */
  private async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const fields = [
      "place_id",
      "name",
      "formatted_address",
      "formatted_phone_number",
      "international_phone_number",
      "website",
      "rating",
      "user_ratings_total",
      "opening_hours",
      "geometry",
      "types",
      "reviews",
    ].join(",");

    const url = `${this.PLACE_DETAILS_URL}?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;

    const response = await this.fetchWithRetry(url);
    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Place Details API error: ${data.status}`);
    }

    return data.result;
  }

  /**
   * Extract supplier data from Place Details
   */
  protected extractSupplierData(
    details: PlaceDetails,
    state: string
  ): Partial<WholesaleSupplier> | null {
    if (!details.name) return null;

    // Extract business hours
    const businessHours = details.opening_hours?.weekday_text?.join(", ") || null;

    // Extract reviews for wholesale evidence
    const reviewTexts = (details.reviews || []).map((r) => r.text).join(" ");

    // Build supplier object
    const supplier: Partial<WholesaleSupplier> = {
      company_name: details.name,
      aka_names: [],
      product_examples: [],
      wholesale_terms: {
        bulk_available: true, // Assume true, will be validated by confidence scoring
        delivery_options: [],
      },
      coverage_regions: [],
      address_text: details.formatted_address || null,
      state: state as any,
      lga_or_city: this.extractCity(details.formatted_address || ""),
      lat: details.geometry?.location.lat || null,
      lon: details.geometry?.location.lng || null,
      phones: details.international_phone_number
        ? [details.international_phone_number]
        : details.formatted_phone_number
        ? [details.formatted_phone_number]
        : [],
      whatsapp: [],
      emails: [],
      websites: details.website ? [details.website] : [],
      socials: {},
      business_hours: businessHours,
      ratings: {
        google: details.rating
          ? {
              stars: details.rating,
              count: details.user_ratings_total || 0,
            }
          : undefined,
      },
      verifications: {},
      notes: reviewTexts ? `Reviews: ${reviewTexts.substring(0, 500)}` : null,
      source_url: `https://www.google.com/maps/place/?q=place_id:${details.place_id}`,
    };

    return supplier;
  }

  /**
   * Extract city/LGA from address
   */
  private extractCity(address: string): string | null {
    // Try to extract city from address (typically between first comma and state)
    const parts = address.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      return parts[1]; // Usually city is second part
    }
    return null;
  }

  /**
   * Generate search queries for different states and categories
   */
  private generateSearchQueries(
    states: string[]
  ): Array<{ searchTerm: string; state: string; url: string }> {
    const categories = [
      "event equipment wholesale",
      "party rental wholesale",
      "tent wholesale",
      "chair rental wholesale",
      "event supplies wholesale",
      "catering equipment wholesale",
      "event decor wholesale",
    ];

    const queries: Array<{
      searchTerm: string;
      state: string;
      url: string;
    }> = [];

    for (const state of states) {
      for (const category of categories) {
        const searchTerm = `${category} ${state} Nigeria`;
        const url = `https://www.google.com/maps/search/${encodeURIComponent(
          searchTerm
        )}`;

        queries.push({ searchTerm, state, url });
      }
    }

    return queries;
  }
}

