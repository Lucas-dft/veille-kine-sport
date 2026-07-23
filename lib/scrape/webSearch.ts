import { buildSystemPrompt, buildUserPrompt } from "./prompt";
import { ScrapeCategory } from "./categories";
import { Profile } from "@/lib/types";
import { getGeminiClient, GEMINI_MODEL, OFFERS_JSON_SCHEMA, extractOffersFromOutputText } from "./gemini";
import { ScrapedOffer, normalizeScrapedOffer } from "./types";
import { braveSearch, BraveResult } from "./braveSearch";

/**
 * Recherche web via Brave Search API (gratuit, sans achat minimum imposé —
 * contrairement au palier payant de Gemini `google_search`, cf. README).
 * Le code exécute les requêtes explicites de la catégorie (categories.ts),
 * puis un seul appel Gemini (texte seul, pas d'outil) filtre/reformule les
 * résultats en offres structurées.
 */
export async function scrapeCategory(category: ScrapeCategory, profile: Profile): Promise<ScrapedOffer[]> {
  const resultsByQuery = await Promise.all(
    category.queries.map(async (query) => {
      try {
        return await braveSearch(query, 10);
      } catch {
        return [] as BraveResult[];
      }
    })
  );

  const seen = new Set<string>();
  const results: BraveResult[] = [];
  for (const list of resultsByQuery) {
    for (const r of list) {
      if (!r.url || seen.has(r.url)) continue;
      seen.add(r.url);
      results.push(r);
    }
  }

  if (results.length === 0) return [];

  const client = getGeminiClient();

  const searchResultsText = results
    .map((r, i) => `--- Résultat ${i + 1} ---\nTitre : ${r.title}\nURL : ${r.url}\nDescription : ${r.description}\n`)
    .join("\n");

  const userInput =
    buildUserPrompt(category) +
    `\n\nVoici les résultats de recherche web déjà collectés (ne cherche pas au-delà, extrait uniquement à partir de ceux-ci) :\n\n${searchResultsText}`;

  const interaction = await client.interactions.create({
    model: GEMINI_MODEL,
    system_instruction: buildSystemPrompt(profile),
    input: userInput,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: OFFERS_JSON_SCHEMA,
    },
  });

  const rawOffers = extractOffersFromOutputText(interaction.output_text);

  return rawOffers
    .filter((o): o is Record<string, unknown> => typeof o === "object" && o !== null)
    .map((o) => normalizeScrapedOffer(o))
    .filter((o) => o.titre && o.club);
}
