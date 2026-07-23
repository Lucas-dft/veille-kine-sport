import { SCRAPE_CATEGORIES, GMAIL_CATEGORY_ID, ScrapeCategory } from "./categories";
import { scrapeCategory } from "./webSearch";
import { scrapeGmailAlerts } from "./gmail";
import { ingestScrapedOffers } from "./ingest";
import { startRun, finishRun } from "./runLog";
import { loadProfile } from "@/lib/profile";

export interface RunCategoryResult {
  category: string;
  found: number;
  inserted: number;
}

export async function runScrapeForCategory(categoryId: string): Promise<RunCategoryResult> {
  const runId = await startRun(categoryId);
  try {
    const profile = await loadProfile();

    const offers =
      categoryId === GMAIL_CATEGORY_ID
        ? await scrapeGmailAlerts(profile)
        : await scrapeCategory(findCategory(categoryId), profile);

    const { found, inserted } = await ingestScrapedOffers(offers, profile);
    await finishRun(runId, { offersFound: found, offersNew: inserted, status: "ok" });
    return { category: categoryId, found, inserted };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finishRun(runId, { offersFound: 0, offersNew: 0, status: "error", errorMessage: message });
    throw err;
  }
}

function findCategory(id: string): ScrapeCategory {
  const found = SCRAPE_CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`Catégorie de scraping inconnue : ${id}`);
  return found;
}
