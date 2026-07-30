export function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return "o" + Math.abs(h).toString(36);
}

// Par défaut la query string est ignorée (le plus souvent du tracking, et la
// garder intégralement est risqué — ex. LinkedIn glisse un token de tracking
// différent à chaque email d'alerte dans trackingId/otpToken/etc., ce qui
// ferait passer la même offre pour "nouvelle" à chaque fois). Seuls quelques
// sites connus codent l'identité réelle de l'offre DANS la query string plutôt
// que dans le chemin ; pour ceux-là on ne garde que le paramètre pertinent.
const IDENTITY_QUERY_PARAM_BY_HOST: Record<string, string> = {
  "indeed.com": "jk",
};

/**
 * Normalise une URL d'offre pour la dédup : le lien réel d'une annonce ne
 * change pas d'un jour sur l'autre, contrairement au titre reformulé par
 * Gemini. On ignore protocole, "www.", fragment et slash final.
 */
function normalizeUrl(lien: string): string {
  const trimmed = lien.trim().toLowerCase();
  if (!trimmed) return "";
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");
    const identityParam = IDENTITY_QUERY_PARAM_BY_HOST[host];
    const query = identityParam && u.searchParams.has(identityParam)
      ? `?${identityParam}=${u.searchParams.get(identityParam)}`
      : "";
    return `${host}${u.pathname.replace(/\/+$/, "")}${query}`;
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
