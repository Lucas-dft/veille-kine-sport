export interface BraveResult {
  title: string;
  url: string;
  description: string;
}

/**
 * Recherche web via Brave Search API (palier gratuit : 5$/mois de crédit
 * auto-appliqué, ≈ 1000 requêtes/mois, aucun achat minimum imposé —
 * contrairement au palier payant de Gemini). Une requête = un appel HTTP,
 * pas de recherche agentique multi-requêtes côté serveur Brave.
 */
export async function braveSearch(query: string, count = 10): Promise<BraveResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) throw new Error("BRAVE_SEARCH_API_KEY manquant.");

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(count));

  const res = await fetch(url, {
    headers: { Accept: "application/json", "X-Subscription-Token": apiKey },
  });

  if (!res.ok) {
    throw new Error(`Échec Brave Search (${res.status}) pour la requête "${query}".`);
  }

  const data = await res.json();
  const results = data?.web?.results;
  if (!Array.isArray(results)) return [];

  return results.map((r: { title?: string; url?: string; description?: string }) => ({
    title: r.title || "",
    url: r.url || "",
    description: r.description || "",
  }));
}
