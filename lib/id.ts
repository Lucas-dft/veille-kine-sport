export function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return "o" + Math.abs(h).toString(36);
}

/**
 * Normalise une URL d'offre pour la dédup : le lien réel d'une annonce ne
 * change pas d'un jour sur l'autre, contrairement au titre reformulé par
 * Gemini (qui varie légèrement à chaque passage de scraping et cassait la
 * dédup basée sur club|titre|lien). On ignore protocole, "www.", query
 * string, fragment et slash final.
 */
function normalizeUrl(lien: string): string {
  const trimmed = lien.trim().toLowerCase();
  if (!trimmed) return "";
  try {
    const u = new URL(trimmed);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "")}`;
  } catch {
    return trimmed.replace(/[?#].*$/, "").replace(/\/+$/, "");
  }
}

/**
 * Identité d'une offre : le lien normalisé quand il existe (identifiant le
 * plus stable d'une vraie annonce), sinon club+titre normalisés (offres
 * ajoutées manuellement sans lien).
 */
export function makeId(o: { club?: string; titre?: string; lien?: string }): string {
  const normLien = normalizeUrl(o.lien || "");
  if (normLien) return hash(normLien);
  const s = `${o.club || ""}|${o.titre || ""}`.toLowerCase().trim().replace(/\s+/g, " ");
  return hash(s);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
