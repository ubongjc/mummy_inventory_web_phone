/**
 * BusinessList Nigeria Scraper
 *
 * Scrapes wholesale supplier data from BusinessList.ng directory.
 * Uses Cheerio for HTML parsing.
 */

import { BaseScraper, ScraperResult } from "./base";
import type { WholesaleSupplier } from "../types";
import * as cheerio from "cheerio";

export class BusinessListScraper extends BaseScraper {
  private readonly BASE_URL = "https://businesslist.ng";

  constructor() {
    super({
      source_platform: "directory",
      rate_limit_delay_ms: 2000,
    });
  }

  async scrape(options?: { categories?: string[] }): Promise<ScraperResult> {
    let recordsFound = 0;
    let recordsNew = 0;
    let recordsUpdated = 0;

    const categories = options?.categories || [
      "event-planners",
      "event-equipment-rental",
      "party-supplies",
      "catering-services",
      "tent-rental",
    ];

    console.log(
      `[BusinessListScraper] Starting scrape for ${categories.length} categories...`
    );

    for (const category of categories) {
      try {
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 5) {
          // Limit to 5 pages per category
          const url = `${this.BASE_URL}/category/${category}?page=${page}`;

          await this.logSource(url, "running", {});

          try {
            const response = await this.fetchWithRetry(url);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();
            const suppliers = this.extractSupplierData(html, category);

            console.log(
              `[BusinessListScraper] Found ${suppliers.length} suppliers on ${category} page ${page}`
            );

            if (suppliers.length === 0) {
              hasMore = false;
              break;
            }

            recordsFound += suppliers.length;

            for (const supplier of suppliers) {
              try {
                const result = await this.saveSupplier(supplier);
                if (result.isNew) recordsNew++;
                else recordsUpdated++;
              } catch (error) {
                console.error(
                  `[BusinessListScraper] Error saving supplier:`,
                  error
                );
              }
            }

            await this.logSource(url, "completed", {
              httpStatus: 200,
              parseSuccess: true,
              recordsFound: suppliers.length,
              recordsNew,
              recordsUpdated,
            });

            page++;
            await this.delay(this.config.rate_limit_delay_ms);
          } catch (error) {
            const errorMsg = `Error scraping ${url}: ${error}`;
            this.errors.push(errorMsg);
            await this.logSource(url, "failed", {
              httpStatus: 500,
              parseSuccess: false,
              errorMessage: errorMsg,
            });
            hasMore = false;
          }
        }
      } catch (error) {
        const errorMsg = `BusinessList category error: ${error}`;
        this.errors.push(errorMsg);
      }
    }

    console.log(
      `[BusinessListScraper] Complete: ${recordsFound} found, ${recordsNew} new, ${recordsUpdated} updated`
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
   * Extract supplier data from HTML
   * Note: HTML structure may vary - this is a generic implementation
   */
  protected extractSupplierData(
    html: string,
    category: string
  ): Partial<WholesaleSupplier>[] {
    const $ = cheerio.load(html);
    const suppliers: Partial<WholesaleSupplier>[] = [];

    // Generic selectors - adjust based on actual site structure
    // Typical business directory structure
    $(".business-listing, .listing-item, .company-card, article.business").each(
      (_, element) => {
        try {
          const $el = $(element);

          // Extract business name
          const name =
            $el.find(".business-name, .company-name, h2, h3").first().text().trim() ||
            $el.find("a").first().text().trim();

          if (!name) return;

          // Extract address
          const address =
            $el.find(".address, .location, .business-address").text().trim() ||
            null;

          // Extract phone
          const phoneText =
            $el.find(".phone, .tel, .contact-phone").text().trim() ||
            $el.find('[href^="tel:"]').text().trim();
          const phones = phoneText
            ? phoneText.split(/[,;]/).map((p) => p.trim())
            : [];

          // Extract email
          const emailText =
            $el.find(".email, .contact-email").text().trim() ||
            $el.find('[href^="mailto:"]').attr("href")?.replace("mailto:", "") ||
            "";
          const emails = emailText ? [emailText] : [];

          // Extract website
          const website =
            $el.find(".website, .url").attr("href") ||
            $el.find('a[href^="http"]').attr("href") ||
            null;
          const websites = website ? [website] : [];

          // Extract description for wholesale detection
          const description =
            $el.find(".description, .about, .summary").text().trim() || "";

          // Extract detail page URL
          const detailUrl =
            $el.find("a").first().attr("href") || this.BASE_URL;
          const sourceUrl = detailUrl.startsWith("http")
            ? detailUrl
            : `${this.BASE_URL}${detailUrl}`;

          // Build supplier object
          const supplier: Partial<WholesaleSupplier> = {
            company_name: name,
            aka_names: [],
            product_examples: [],
            wholesale_terms: {
              bulk_available: true,
              delivery_options: [],
            },
            coverage_regions: [],
            address_text: address,
            state: null, // Will be extracted from address in normalization
            lga_or_city: null,
            lat: null,
            lon: null,
            phones,
            whatsapp: [],
            emails,
            websites,
            socials: {},
            business_hours: null,
            ratings: {},
            verifications: {},
            notes: description ? `Description: ${description}` : null,
            source_url: sourceUrl,
          };

          suppliers.push(supplier);
        } catch (error) {
          console.error(`[BusinessListScraper] Error parsing listing:`, error);
        }
      }
    );

    return suppliers;
  }
}

