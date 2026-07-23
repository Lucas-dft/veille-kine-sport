import { NextRequest } from "next/server";

/**
 * Accepte deux mécanismes :
 * - `x-cron-secret: <CRON_SECRET>` — utilisé par le workflow GitHub Actions
 *   et pour les tests manuels (curl/Postman).
 * - `Authorization: Bearer <CRON_SECRET>` — convention native de Vercel Cron
 *   (ajoutée automatiquement à ses propres appels GET, cf. vercel.json).
 */
export function isValidCronSecret(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const header = request.headers.get("x-cron-secret");
  if (header === expected) return true;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${expected}`;
}
