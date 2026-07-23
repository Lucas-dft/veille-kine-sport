import { getSupabaseAdmin } from "@/lib/supabase";

const TIMEOUT_MS = 8000;

async function isLinkDead(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    if (res.status === 405 || res.status === 501) {
      // Certains sites ne supportent pas HEAD ; on retente en GET léger.
      res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    }
    return res.status === 404 || res.status === 410;
  } catch {
    // Erreur réseau : on ne marque pas expiré sur un seul échec transitoire.
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export interface CheckLinksResult {
  checked: number;
  newlyExpired: number;
}

/** Vérifie les offres non expirées avec un lien, marque `expire = true` si 404/410. */
export async function checkExpiredLinks(): Promise<CheckLinksResult> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("offers")
    .select("id, lien")
    .eq("expire", false)
    .neq("lien", "");

  if (error) throw new Error(error.message);

  const rows = data || [];
  let newlyExpired = 0;

  for (const row of rows) {
    const dead = await isLinkDead(row.lien as string);
    if (dead) {
      await supabase.from("offers").update({ expire: true }).eq("id", row.id);
      newlyExpired++;
    }
  }

  return { checked: rows.length, newlyExpired };
}
