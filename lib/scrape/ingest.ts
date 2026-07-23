import { getSupabaseAdmin } from "@/lib/supabase";
import { makeId, todayISO } from "@/lib/id";
import { ScrapedOffer } from "./types";
import { Profile } from "@/lib/types";

export interface IngestResult {
  found: number;
  inserted: number;
}

/**
 * Déduplique par id = hash(club|titre|lien) et insère les offres inconnues.
 * Ne touche jamais aux offres déjà en base (pas de mise à jour de statut/note
 * existants) — cf. contrainte de dédup stricte de la spec.
 */
export async function ingestScrapedOffers(offers: ScrapedOffer[], profile: Profile): Promise<IngestResult> {
  if (offers.length === 0) return { found: 0, inserted: 0 };

  const supabase = getSupabaseAdmin();
  const ids = offers.map((o) => makeId({ club: o.club, titre: o.titre, lien: o.lien }));

  const { data: existingRows } = await supabase.from("offers").select("id").in("id", ids);
  const existingIds = new Set((existingRows || []).map((r) => r.id as string));

  const priorityCountries = new Set(profile.paysPrioritaires.map((c) => c.toLowerCase()));
  const today = todayISO();

  const toInsert = offers
    .map((o, i) => ({ offer: o, id: ids[i] }))
    .filter(({ id }) => !existingIds.has(id))
    .map(({ offer, id }) => ({
      id,
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

  // Deux offres du même lot peuvent produire le même id (doublon interne au scraping) :
  // on ne garde que la première occurrence.
  const seen = new Set<string>();
  const deduped = toInsert.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });

  if (deduped.length > 0) {
    const { error } = await supabase.from("offers").insert(deduped);
    if (error) throw new Error(`Échec de l'insertion des offres : ${error.message}`);
  }

  return { found: offers.length, inserted: deduped.length };
}
