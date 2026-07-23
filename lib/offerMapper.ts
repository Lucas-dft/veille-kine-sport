import { Offer } from "./types";

/** Ligne brute telle que renvoyée par Supabase (snake_case, cf. supabase/schema.sql). */
export interface OfferRow {
  id: string;
  titre: string;
  club: string;
  pays: string;
  sport: string;
  niveau: string;
  genre: string;
  resume: string;
  lien: string;
  source: string;
  date_publication: string | null;
  date_trouvee: string;
  hors_zone_prioritaire: boolean;
  statut: string;
  note: string;
  expire: boolean;
  vu: boolean;
  emaile: boolean;
}

export function rowToOffer(row: OfferRow): Offer {
  return {
    id: row.id,
    titre: row.titre,
    club: row.club,
    pays: row.pays,
    sport: row.sport,
    niveau: row.niveau,
    genre: row.genre,
    resume: row.resume,
    lien: row.lien,
    source: row.source,
    datePublication: row.date_publication || "",
    dateTrouvee: row.date_trouvee,
    horsZonePrioritaire: row.hors_zone_prioritaire,
    statut: row.statut,
    note: row.note,
    expire: row.expire,
    vu: row.vu,
    emaile: row.emaile,
  };
}

/** Traduit un patch partiel (camelCase, tel qu'envoyé par l'UI) vers les colonnes DB. */
export function offerPatchToRow(patch: Partial<Offer>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.titre !== undefined) row.titre = patch.titre;
  if (patch.club !== undefined) row.club = patch.club;
  if (patch.pays !== undefined) row.pays = patch.pays;
  if (patch.sport !== undefined) row.sport = patch.sport;
  if (patch.niveau !== undefined) row.niveau = patch.niveau;
  if (patch.genre !== undefined) row.genre = patch.genre;
  if (patch.resume !== undefined) row.resume = patch.resume;
  if (patch.lien !== undefined) row.lien = patch.lien;
  if (patch.source !== undefined) row.source = patch.source;
  if (patch.datePublication !== undefined) row.date_publication = patch.datePublication || null;
  if (patch.dateTrouvee !== undefined) row.date_trouvee = patch.dateTrouvee;
  if (patch.horsZonePrioritaire !== undefined) row.hors_zone_prioritaire = patch.horsZonePrioritaire;
  if (patch.statut !== undefined) row.statut = patch.statut;
  if (patch.note !== undefined) row.note = patch.note;
  if (patch.expire !== undefined) row.expire = patch.expire;
  if (patch.vu !== undefined) row.vu = patch.vu;
  if (patch.emaile !== undefined) row.emaile = patch.emaile;
  return row;
}
