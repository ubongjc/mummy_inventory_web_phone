/**
 * Scraper Orchestrator
 *
 * Coordinates all scrapers and manages the refresh process.
 */

import { GoogleMapsScraper } from "./google-maps";
import { BusinessListScraper } from "./businesslist";
import type { SourcePlatform } from "../types";

export interface OrchestatorOptions {
  sources?: SourcePlatform[];
  states?: string[];
  categories?: string[];
  fullCrawl?: boolean;
}

export interface OrchestatorResult {
  runId: string;
  success: boolean;
  totalRecordsFound: number;
  totalRecordsNew: number;
  totalRecordsUpdated: number;
  sourceResults: {
    [source: string]: {
      success: boolean;
      recordsFound: number;
      recordsNew: number;
      recordsUpdated: number;
      errors: string[];
    };
  };
  errors: string[];
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
}

export class ScraperOrchestrator {
  private scrapers: Map<SourcePlatform, any> = new Map();

  constructor() {
    // Initialize all scrapers
    this.scrapers.set("maps", new GoogleMapsScraper());
    this.scrapers.set("directory", new BusinessListScraper());
    // Add more scrapers as they're implemented
  }

  /**
   * Run all configured scrapers
   */
  async run(options: OrchestatorOptions = {}): Promise<OrchestatorResult> {
    const startedAt = new Date();
    const runId = `run_${startedAt.toISOString().replace(/[:.]/g, "_")}`;

    console.log(`[Orchestrator] Starting run ${runId}`);

    // Determine which sources to run
    const sourcesToRun =
      options.sources || (["maps", "directory"] as SourcePlatform[]);

    const sourceResults: OrchestatorResult["sourceResults"] = {};
    const errors: string[] = [];
    let totalRecordsFound = 0;
    let totalRecordsNew = 0;
    let totalRecordsUpdated = 0;

    // Run each scraper sequentially (could be parallelized with Promise.all)
    for (const source of sourcesToRun) {
      const scraper = this.scrapers.get(source);

      if (!scraper) {
        const error = `Scraper not found for source: ${source}`;
        errors.push(error);
        console.error(`[Orchestrator] ${error}`);
        continue;
      }

      try {
        console.log(`[Orchestrator] Running scraper: ${source}`);

        const result = await scraper.scrape({
          states: options.states,
          categories: options.categories,
        });

        sourceResults[source] = {
          success: result.success,
          recordsFound: result.records_found,
          recordsNew: result.records_new,
          recordsUpdated: result.records_updated,
          errors: result.errors,
        };

        totalRecordsFound += result.records_found;
        totalRecordsNew += result.records_new;
        totalRecordsUpdated += result.records_updated;

        if (!result.success) {
          errors.push(...result.errors);
        }

        console.log(
          `[Orchestrator] ${source} completed: ${result.records_found} found, ${result.records_new} new, ${result.records_updated} updated`
        );
      } catch (error) {
        const errorMsg = `Scraper ${source} failed: ${error}`;
        errors.push(errorMsg);
        console.error(`[Orchestrator] ${errorMsg}`);

        sourceResults[source] = {
          success: false,
          recordsFound: 0,
          recordsNew: 0,
          recordsUpdated: 0,
          errors: [errorMsg],
        };
      }
    }

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    console.log(`[Orchestrator] Run ${runId} completed in ${durationMs}ms`);
    console.log(
      `[Orchestrator] Total: ${totalRecordsFound} found, ${totalRecordsNew} new, ${totalRecordsUpdated} updated`
    );

    return {
      runId,
      success: errors.length === 0,
      totalRecordsFound,
      totalRecordsNew,
      totalRecordsUpdated,
      sourceResults,
      errors,
      startedAt,
      completedAt,
      durationMs,
    };
  }

  /**
   * Run deduplication after scraping
   */
  async runDeduplication(): Promise<void> {
    console.log("[Orchestrator] Running deduplication...");
    // TODO: Implement auto-merge for high-similarity duplicates (≥95%)
    // This would use the deduplicator module
  }

  /**
   * Export data to JSONL and CSV
   */
  async exportData(): Promise<void> {
    console.log("[Orchestrator] Exporting data...");
    // TODO: Implement export to suppliers.jsonl and suppliers.csv
  }
}

/**
 * Example usage:
 *
 * const orchestrator = new ScraperOrchestrator();
 * const result = await orchestrator.run({
 *   sources: ['maps', 'directory'],
 *   states: ['Lagos', 'FCT', 'Rivers'],
 *   fullCrawl: false
 * });
 *
 * console.log(result);
 */
