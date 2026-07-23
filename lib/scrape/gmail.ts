import { Profile } from "@/lib/types";
import { getGeminiClient, GEMINI_MODEL, OFFERS_JSON_SCHEMA, extractOffersFromOutputText } from "./gemini";
import { ScrapedOffer, normalizeScrapedOffer } from "./types";

/**
 * Intégration optionnelle (désactivée par défaut) : lecture des alertes
 * emploi LinkedIn/Glassdoor déjà reçues sur lucas.kine.jobs@gmail.com, via
 * l'API Gmail de Google en lecture seule (scope `gmail.readonly`) — pas via
 * un connecteur MCP tiers, pour rester sur une API officielle et bien
 * documentée. Un seul appel Gemini (pas de recherche web, pas de MCP)
 * reformule ensuite les emails pertinents au même format que le scraping web.
 *
 * N'a d'effet que si GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET et
 * GMAIL_REFRESH_TOKEN sont tous renseignés ; sinon no-op silencieux.
 */

const GMAIL_SEARCH_QUERY =
  "newer_than:2d (from:linkedin.com OR from:glassdoor.com OR subject:(job alert)) " +
  '(kinesitherapeute OR kinésithérapeute OR physiotherapist OR physiotherapy OR "athletic trainer" OR "physical therapist" OR "sports therapist")';

const MAX_MESSAGES = 20;

function isGmailCheckEnabled(): boolean {
  return !!(
    process.env.GMAIL_OAUTH_CLIENT_ID &&
    process.env.GMAIL_OAUTH_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  );
}

async function getGmailAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_OAUTH_CLIENT_ID!,
      client_secret: process.env.GMAIL_OAUTH_CLIENT_SECRET!,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Échec du rafraîchissement du token Gmail OAuth (${res.status}).`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error("Réponse OAuth Google sans access_token.");
  return data.access_token as string;
}

interface GmailMessagePart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailMessagePart[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeGmailBase64(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

/** Cherche la première partie text/plain, sinon la première text/html (nettoyée). */
function extractBodyText(part: GmailMessagePart | undefined): string {
  if (!part) return "";

  const stack: GmailMessagePart[] = [part];
  let htmlFallback = "";

  while (stack.length > 0) {
    const current = stack.shift()!;
    if (current.mimeType === "text/plain" && current.body?.data) {
      return decodeGmailBase64(current.body.data);
    }
    if (current.mimeType === "text/html" && current.body?.data && !htmlFallback) {
      htmlFallback = stripHtml(decodeGmailBase64(current.body.data));
    }
    if (current.parts) stack.push(...current.parts);
  }

  return htmlFallback;
}

function headerValue(headers: { name: string; value: string }[] | undefined, name: string): string {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

interface CandidateEmail {
  id: string;
  subject: string;
  from: string;
  date: string;
  bodyExcerpt: string;
}

async function fetchCandidateEmails(accessToken: string): Promise<CandidateEmail[]> {
  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("q", GMAIL_SEARCH_QUERY);
  listUrl.searchParams.set("maxResults", String(MAX_MESSAGES));

  const listRes = await fetch(listUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!listRes.ok) {
    throw new Error(`Échec de la recherche Gmail (${listRes.status}).`);
  }
  const listData = await listRes.json();
  const ids: string[] = (listData.messages || []).map((m: { id: string }) => m.id);

  const emails: CandidateEmail[] = [];
  for (const id of ids) {
    const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;
    const msgRes = await fetch(msgUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!msgRes.ok) continue;
    const msg = await msgRes.json();
    const headers = msg.payload?.headers as { name: string; value: string }[] | undefined;
    const body = extractBodyText(msg.payload).slice(0, 4000);
    emails.push({
      id,
      subject: headerValue(headers, "Subject"),
      from: headerValue(headers, "From"),
      date: headerValue(headers, "Date"),
      bodyExcerpt: body,
    });
  }
  return emails;
}

function buildEmailExtractionPrompt(emails: CandidateEmail[], profile: Profile): { system: string; user: string } {
  const system = `Tu analyses des emails d'alerte emploi (LinkedIn, Glassdoor) reçus sur une boîte mail, pour en extraire les offres de kinésithérapeute / physiotherapist / athletic trainer / physical therapist / sports therapist pertinentes pour un candidat en kinésithérapie du sport de haut niveau.

Profil ciblé — sports : ${profile.sportsCibles.join(", ")}. Pays prioritaires (pour prioriser l'affichage, jamais pour exclure) : ${profile.paysPrioritaires.join(", ")}.

Ne retiens que les offres correspondant à un club, une franchise, une université ou une fédération de sport de haut niveau, professionnel ou semi-professionnel (académies, centres de performance inclus). Ignore les postes hors sport ou hors haut niveau, ainsi que les emails qui ne sont pas des alertes d'offre d'emploi.

Le format de sortie (objet avec un tableau "offers") est imposé techniquement. Pour chaque offre retenue : "sport" parmi Football, Basketball, Rugby, Football américain, Golf, Sport mécanique, Cyclisme, Natation, Hockey, Handball, Baseball, Tennis ; "niveau" parmi Pro, Semi-pro, Universitaire, Fédéral ; "genre" parmi Masculin, Féminin, "Mixte / non précisé" ; "resume" reformulé en 1-2 phrases (jamais de copie du texte de l'email) ; "source" = "LinkedIn (alerte email)" ou "Glassdoor (alerte email)" selon l'expéditeur. Si aucun email n'est pertinent, renvoie un tableau "offers" vide.`;

  const user =
    `Voici ${emails.length} email(s) à analyser :\n\n` +
    emails
      .map(
        (e, i) =>
          `--- Email ${i + 1} ---\nDe : ${e.from}\nSujet : ${e.subject}\nDate : ${e.date}\nContenu (extrait) : ${e.bodyExcerpt}\n`
      )
      .join("\n");

  return { system, user };
}

export async function scrapeGmailAlerts(profile: Profile): Promise<ScrapedOffer[]> {
  if (!isGmailCheckEnabled()) return [];

  const accessToken = await getGmailAccessToken();
  const emails = await fetchCandidateEmails(accessToken);
  if (emails.length === 0) return [];

  const client = getGeminiClient();
  const { system, user } = buildEmailExtractionPrompt(emails, profile);

  const interaction = await client.interactions.create({
    model: GEMINI_MODEL,
    system_instruction: system,
    input: user,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: OFFERS_JSON_SCHEMA,
    },
  });

  const rawOffers = extractOffersFromOutputText(interaction.output_text);

  return rawOffers
    .filter((o): o is Record<string, unknown> => typeof o === "object" && o !== null)
    .map((o) => normalizeScrapedOffer(o, "LinkedIn (alerte email)"))
    .filter((o) => o.titre && o.club);
}
