/**
 * Base Scraper Class
 *
 * Provides common functionality for all wholesale supplier scrapers:
 * - Rate limiting and robots.txt compliance
 * - Error handling and retry logic
 * - Data normalization
 * - Logging and progress tracking
 */

import { prisma } from "@/app/lib/prisma";
import {
  normalizePhone,
  normalizeEmail,
  normalizeState,
  extractStateFromAddress,
  categorizeProducts,
  detectWholesaleLanguage,
  calculateConfidence,
} from "../normalize";
import { generateSupplierId } from "../utils";
import type {
  WholesaleSupplier,
  NormalizedSupplier,
  SourcePlatform,
} from "../types";

export interface ScraperConfig {
  source_platform: SourcePlatform;
  max_retries: number;
  retry_delay_ms: number;
  rate_limit_delay_ms: number;
  user_agent: string;
  timeout_ms: number;
}

export interface ScraperResult {
  success: boolean;
  records_found: number;
  records_new: number;
  records_updated: number;
  errors: string[];
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected runId: string;
  protected errors: string[] = [];

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = {
      source_platform: "directory",
      max_retries: 3,
      retry_delay_ms: 2000,
      rate_limit_delay_ms: 1000,
      user_agent:
        "Mozilla/5.0 (compatible; WholesaleSupplierBot/1.0; +https://example.com/bot)",
      timeout_ms: 30000,
      ...config,
    };

    // Generate unique run ID
    this.runId = `run_${new Date().toISOString().replace(/[:.]/g, "_")}`;
  }

  /**
   * Main scraping method - to be implemented by subclasses
   */
  abstract scrape(options?: any): Promise<ScraperResult>;

  /**
   * Extract supplier data from a page - to be implemented by subclasses
   */
  protected abstract extractSupplierData(pageData: any): Partial<WholesaleSupplier>[];

  /**
   * Normalize and save supplier data
   */
  protected async saveSupplier(
    rawData: Partial<WholesaleSupplier>
  ): Promise<{ isNew: boolean; id: string }> {
    try {
      // Ensure required fields
      if (!rawData.company_name || !rawData.source_url) {
        throw new Error("Missing required fields: company_name or source_url");
      }

      // Normalize phone numbers
      const phones = rawData.phones
        ?.map((p) => normalizePhone(p))
        .filter((p) => p !== null) as string[];

      const whatsapp = rawData.whatsapp
        ?.map((w) => normalizePhone(w))
        .filter((w) => w !== null) as string[];

      // Normalize emails
      const emails = rawData.emails
        ?.map((e) => normalizeEmail(e))
        .filter((e) => e !== null) as string[];

      // Normalize state
      let state = rawData.state ? normalizeState(rawData.state) : null;
      if (!state && rawData.address_text) {
        state = extractStateFromAddress(rawData.address_text);
      }

      // Categorize products
      const allText = [
        rawData.company_name,
        ...(rawData.product_examples || []),
        rawData.notes || "",
      ].join(" ");

      const categories = categorizeProducts(allText);

      // Detect wholesale language
      const wholesaleDetection = detectWholesaleLanguage(allText);

      // Calculate confidence score
      const supplierForConfidence: Partial<NormalizedSupplier> = {
        verifications: {
          explicit_wholesale_language: wholesaleDetection.isWholesale,
          evidence_snippets: wholesaleDetection.evidenceSnippets,
        },
        wholesale_terms: rawData.wholesale_terms,
        phones: phones || [],
        whatsapp: whatsapp || [],
        emails: emails || [],
        state,
        categories,
      } as any;

      const confidence = calculateConfidence(supplierForConfidence);

      // Generate supplier ID (stable hash)
      const supplierId = generateSupplierId(
        rawData.company_name,
        phones?.[0] || "",
        state || ""
      );

      // Check if supplier already exists
      const existing = await prisma.wholesaleSupplier.findUnique({
        where: { supplierId },
      });

      const supplierData = {
        supplierId,
        companyName: rawData.company_name,
        akaNames: rawData.aka_names || [],
        categories,
        productExamples: rawData.product_examples || [],
        wholesaleTerms: rawData.wholesale_terms || {},
        coverageRegions: rawData.coverage_regions || [],
        addressText: rawData.address_text,
        state,
        lgaOrCity: rawData.lga_or_city,
        lat: rawData.lat,
        lon: rawData.lon,
        phones: phones || [],
        whatsapp: whatsapp || [],
        emails: emails || [],
        websites: rawData.websites || [],
        socials: rawData.socials || {},
        businessHours: rawData.business_hours,
        ratings: rawData.ratings || {},
        verifications: {
          explicit_wholesale_language: wholesaleDetection.isWholesale,
          evidence_snippets: wholesaleDetection.evidenceSnippets,
          cac_number: rawData.verifications?.cac_number,
        },
        confidence,
        notes: rawData.notes,
        sourceUrl: rawData.source_url,
        sourcePlatform: this.config.source_platform,
        extractedAt: new Date(),
        lastSeenAt: new Date(),
        approvalStatus: confidence >= 0.6 ? "approved" : "pending",
      };

      if (existing) {
        // Update existing supplier
        const updated = await prisma.wholesaleSupplier.update({
          where: { supplierId },
          data: {
            ...supplierData,
            lastSeenAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return { isNew: false, id: updated.id };
      } else {
        // Create new supplier
        const created = await prisma.wholesaleSupplier.create({
          data: supplierData,
        });

        return { isNew: true, id: created.id };
      }
    } catch (error) {
      const errorMsg = `Error saving supplier ${rawData.company_name}: ${error}`;
      this.errors.push(errorMsg);
      console.error(errorMsg);
      throw error;
    }
  }

  /**
   * Log scraping activity
   */
  protected async logSource(
    sourceUrl: string,
    status: "pending" | "running" | "completed" | "failed",
    stats: {
      httpStatus?: number;
      parseSuccess?: boolean;
      recordsFound?: number;
      recordsNew?: number;
      recordsUpdated?: number;
      errorMessage?: string;
    }
  ): Promise<void> {
    try {
      await prisma.wholesaleSupplierSourceLog.create({
        data: {
          runId: this.runId,
          sourcePlatform: this.config.source_platform,
          sourceUrl,
          status,
          httpStatus: stats.httpStatus || null,
          parseSuccess: stats.parseSuccess || false,
          recordsFound: stats.recordsFound || 0,
          recordsNew: stats.recordsNew || 0,
          recordsUpdated: stats.recordsUpdated || 0,
          errorMessage: stats.errorMessage || null,
        },
      });
    } catch (error) {
      console.error("Error logging source:", error);
    }
  }

  /**
   * Delay execution for rate limiting
   */
  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetch with retry logic
   */
  protected async fetchWithRetry(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.max_retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            "User-Agent": this.config.user_agent,
            ...options.headers,
          },
          signal: AbortSignal.timeout(this.config.timeout_ms),
        });

        return response;
      } catch (error) {
        lastError = error as Error;
        console.error(`Fetch attempt ${attempt + 1} failed:`, error);

        if (attempt < this.config.max_retries - 1) {
          await this.delay(this.config.retry_delay_ms * (attempt + 1));
        }
      }
    }

    throw lastError || new Error("Fetch failed after all retries");
  }

  /**
   * Check robots.txt compliance (placeholder)
   */
  protected async checkRobotsTxt(baseUrl: string): Promise<boolean> {
    // TODO: Implement proper robots.txt parsing
    // For now, return true (allowed)
    return true;
  }

  /**
   * Get scraper statistics
   */
  public getErrors(): string[] {
    return this.errors;
  }

  public getRunId(): string {
    return this.runId;
  }
}
