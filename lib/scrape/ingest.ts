import { getSupabaseAdmin } from "@/lib/supabase";
import { makeId, todayISO, hash } from "@/lib/id";
import { ScrapedOffer } from "./types";
import { Profile } from "@/lib/types";

export interface IngestResult {
  found: number;
  inserted: number;
}

function titleWords(titre: string): Set<string> {
  return new Set(
    titre
      .toLowerCase()
      .replace(/[^a-z0-9À-ÿ\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}

/**
 * Ressemblance grossière entre deux titres (Jaccard sur les mots). L'id est
 * basé sur l'URL normalisée, qui suffit dans l'immense majorité des cas —
 * mais certains sites (pages de recherche génériques sans lien profond par
 * offre) réutilisent la même URL pour plusieurs annonces distinctes. Dans ce
 * cas-là seulement, on vérifie aussi que les titres se ressemblent avant de
 * considérer que c'est un doublon, pour ne jamais masquer une offre
 * réellement nouvelle.
 */
function titlesSimilar(a: string, b: string): boolean {
  const wa = titleWords(a);
  const wb = titleWords(b);
  if (wa.size === 0 || wb.size === 0) return true;
  let intersection = 0;
  for (const w of wa) if (wb.has(w)) intersection++;
  const union = wa.size + wb.size - intersection;
  return intersection / union >= 0.4;
}

/**
 * Déduplique par id = hash(URL normalisée) — stable d'un scraping à l'autre
 * même si le titre reformulé par Gemini varie légèrement — avec repli sur
 * club+titre si aucun lien. Ne touche jamais aux offres déjà en base (pas de
 * mise à jour de statut/note existants) — cf. contrainte de dédup stricte de
 * la spec.
 */
export async function ingestScrapedOffers(offers: ScrapedOffer[], profile: Profile): Promise<IngestResult> {
  if (offers.length === 0) return { found: 0, inserted: 0 };

  const supabase = getSupabaseAdmin();
  const ids = offers.map((o) => makeId({ club: o.club, titre: o.titre, lien: o.lien }));

  const { data: existingRows } = await supabase.from("offers").select("id, titre").in("id", ids);
  const existingTitreById = new Map((existingRows || []).map((r) => [r.id as string, r.titre as string]));

  const priorityCountries = new Set(profile.paysPrioritaires.map((c) => c.toLowerCase()));
  const today = todayISO();

  const toInsert = offers
    .map((o, i) => ({ offer: o, id: ids[i] }))
    .filter(({ offer, id }) => {
      const existingTitre = existingTitreById.get(id);
      // Pas de collision d'id : offre inconnue, à insérer.
      if (existingTitre === undefined) return true;
      // Id connu et titre similaire : vrai doublon, à ignorer.
      return !titlesSimilar(offer.titre, existingTitre);
    })
    .map(({ offer, id }) => ({
      // Cas rare : même URL normalisée réutilisée par le site pour des
      // annonces différentes (page de recherche générique) — id connu mais
      // titre différent, donc pas un doublon. On dérive un id distinct pour
      // ne pas entrer en collision avec la ligne existante.
      id: existingTitreById.has(id) ? hash(`${id}|${offer.titre.toLowerCase().trim()}`) : id,
      titre: offer.titre,
      club: offer.club,
      pays: offer.pays,
      sport: offer.sport,
      niveau: offer.niveau,
      genre: offer.genre || "Mixte / non précisé",
      resume: offer.resume,
      lien: offer.lien,
      source: offer.source,
      date_publication: offer.date_publication || null,
      date_trouvee: today,
      hors_zone_prioritaire: offer.pays ? !priorityCountries.has(offer.pays.toLowerCase()) : false,
      statut: "Nouveau",
      note: "",
      expire: false,
      vu: false,
      emaile: false,
    }));

  // Deux offres du même lot peuvent produire le même id (doublon interne au
  // scraping, ou même URL générique réutilisée pour des annonces réellement
  // différentes) : on ne garde que la première occurrence par titre similaire,
  // et on dérive un id distinct pour les titres réellement différents.
  const seenTitreById = new Map<string, string>();
  const deduped: typeof toInsert = [];
  for (const row of toInsert) {
    const seenTitre = seenTitreById.get(row.id);
    if (seenTitre !== undefined) {
      if (titlesSimilar(row.titre, seenTitre)) continue;
      row.id = hash(`${row.id}|${row.titre.toLowerCase().trim()}`);
    }
    seenTitreById.set(row.id, row.titre);
    deduped.push(row);
  }

  if (deduped.length > 0) {
    const { error } = await supabase.from("offers").insert(deduped);
    if (error) throw new Error(`Échec de l'insertion des offres : ${error.message}`);
  }

  return { found: offers.length, inserted: deduped.length };
}
