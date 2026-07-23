export interface ScrapedOffer {
  titre: string;
  club: string;
  pays: string;
  sport: string;
  niveau: string;
  genre: string;
  resume: string;
  lien: string;
  source: string;
  date_publication: string;
}

/** Normalise un objet brut (issu du JSON structuré Gemini) vers ScrapedOffer. */
export function normalizeScrapedOffer(o: Record<string, unknown>, defaultSource = ""): ScrapedOffer {
  return {
    titre: String(o.titre || "").trim(),
    club: String(o.club || "").trim(),
    pays: String(o.pays || "").trim(),
    sport: String(o.sport || "").trim(),
    niveau: String(o.niveau || "").trim(),
    genre: String(o.genre || "Mixte / non précisé").trim(),
    resume: String(o.resume || "").trim(),
    lien: String(o.lien || "").trim(),
    source: String(o.source || defaultSource).trim(),
    date_publication: String(o.date_publication || "").trim(),
  };
}
