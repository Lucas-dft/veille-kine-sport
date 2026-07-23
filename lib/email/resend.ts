import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rowToOffer, OfferRow } from "@/lib/offerMapper";
import { buildDigestSubject, buildDigestHtml } from "./digestTemplate";
import { formatDate } from "@/lib/format";
import { todayISO } from "@/lib/id";

export interface DigestResult {
  sent: boolean;
  count: number;
}

/**
 * Sélectionne les offres jamais envoyées (`emaile = false`), envoie un seul
 * email récapitulatif via Resend, puis marque ces offres `emaile = true`.
 * N'envoie rien si aucune offre nouvelle (choix par défaut retenu dans la
 * spec, section 6).
 */
export async function sendDailyDigest(): Promise<DigestResult> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("emaile", false)
    .order("hors_zone_prioritaire", { ascending: true })
    .order("date_trouvee", { ascending: false });

  if (error) throw new Error(error.message);

  const offers = (data as OfferRow[]).map(rowToOffer);
  if (offers.length === 0) return { sent: false, count: 0 };

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.USER_EMAIL;
  if (!apiKey || !to) throw new Error("RESEND_API_KEY et USER_EMAIL doivent être définis.");

  const resend = new Resend(apiKey);
  const dashboardUrl = process.env.APP_URL || "http://localhost:3000";

  const { error: sendError } = await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to,
    subject: buildDigestSubject(offers.length, formatDate(todayISO())),
    html: buildDigestHtml(offers, dashboardUrl),
  });

  if (sendError) throw new Error(`Échec de l'envoi Resend : ${sendError.message}`);

  const ids = offers.map((o) => o.id);
  await supabase.from("offers").update({ emaile: true }).in("id", ids);

  return { sent: true, count: offers.length };
}
