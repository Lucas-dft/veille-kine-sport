/**
 * Même algorithme que le prototype (veille-kine-sport.jsx) : un hash simple
 * et déterministe de "club|titre|lien" en minuscules. Ne pas changer cette
 * fonction sans migrer les id existants, sous peine de casser la dédup.
 */
export function makeId(o: { club?: string; titre?: string; lien?: string }): string {
  const s = `${o.club || ""}|${o.titre || ""}|${o.lien || ""}`.toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return "o" + Math.abs(h).toString(36);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
