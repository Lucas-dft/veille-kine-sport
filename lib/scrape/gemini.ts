import { GoogleGenAI } from "@google/genai";

/**
 * Client Gemini partagé (moteur de scraping — voir README "Pourquoi Gemini
 * plutôt qu'Anthropic pour le scraping"). Clé API gratuite obtenue sur
 * https://aistudio.google.com/apikey (aucune carte bancaire requise).
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY manquant.");
  return new GoogleGenAI({ apiKey });
}

// Alias plutôt qu'une version épinglée (ex. "gemini-2.5-flash") : Google
// retire régulièrement l'accès des nouvelles clés API aux anciennes versions
// pinnées ("this model is no longer available to new users"), alors que les
// alias *-latest continuent de pointer vers un modèle supporté.
export const GEMINI_MODEL = "gemini-flash-latest";

/** Schéma JSON strict imposé à la réponse (Structured Output) : un tableau d'offres. */
export const OFFERS_JSON_SCHEMA = {
  type: "object",
  properties: {
    offers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          titre: { type: "string" },
          club: { type: "string" },
          pays: { type: "string" },
          sport: { type: "string" },
          niveau: { type: "string" },
          genre: { type: "string" },
          resume: { type: "string" },
          lien: { type: "string" },
          source: { type: "string" },
          date_publication: { type: "string" },
        },
        required: ["titre", "club", "pays", "sport", "niveau", "resume", "lien", "source"],
      },
    },
  },
  required: ["offers"],
};

export function extractOffersFromOutputText(outputText: string | undefined): unknown[] {
  if (!outputText) return [];
  const parsed = JSON.parse(outputText);
  const offers = Array.isArray(parsed) ? parsed : parsed.offers;
  if (!Array.isArray(offers)) throw new Error("Réponse Gemini sans tableau `offers` exploitable.");
  return offers;
}
