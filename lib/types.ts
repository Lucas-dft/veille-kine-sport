export interface Offer {
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
  datePublication: string;
  dateTrouvee: string;
  horsZonePrioritaire: boolean;
  statut: string;
  note: string;
  expire: boolean;
  vu: boolean;
  emaile: boolean;
}

export type NewOfferInput = Omit<Offer, "id" | "dateTrouvee" | "statut" | "note" | "expire" | "vu" | "emaile">;

export interface Profile {
  diplome: string;
  experience: string;
  langues: string[];
  experiencesTerrain: string[];
  mobilite: string;
  sportsCibles: string[];
  paysPrioritaires: string[];
  paysHorsZone: string;
  objectif: string;
}

export interface RunLogEntry {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  category: string;
  offersFound: number;
  offersNew: number;
  status: "ok" | "error" | "running";
  errorMessage: string | null;
}
