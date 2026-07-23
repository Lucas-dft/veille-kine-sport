import { createHash } from "crypto";

export const SESSION_COOKIE = "kd_session";

/**
 * Application mono-utilisateur : pas de table users, juste un mot de passe
 * partagé (APP_PASSWORD). Le cookie de session est un simple hash dérivé du
 * mot de passe + d'un sel serveur — il suffit de le recalculer pour le
 * vérifier, pas besoin de store de session.
 */
function expectedToken(): string {
  const password = process.env.APP_PASSWORD || "";
  const salt = process.env.CRON_SECRET || "veille-kine-sport";
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

export function checkPassword(password: string): boolean {
  const expected = process.env.APP_PASSWORD;
  return !!expected && password === expected;
}

export function makeSessionToken(): string {
  return expectedToken();
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  return token === expectedToken();
}
