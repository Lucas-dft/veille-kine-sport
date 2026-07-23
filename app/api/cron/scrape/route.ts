import { NextRequest, NextResponse } from "next/server";
import { isValidCronSecret } from "@/lib/cronAuth";
import { runScrapeForCategory } from "@/lib/scrape/run";
import { ALL_CATEGORY_IDS } from "@/lib/scrape/categories";

/**
 * Route destinée à un orchestrateur externe (GitHub Actions, cf.
 * .github/workflows/daily-scrape.yml) qui l'appelle une fois par catégorie,
 * séquentiellement, pour rester sous la limite de durée Vercel (60s en
 * Hobby). Protégée par le header `x-cron-secret`, pas par le cookie de
 * session (exclue du gate dans proxy.ts).
 */
export async function POST(request: NextRequest) {
  if (!isValidCronSecret(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { category } = (await request.json().catch(() => ({ category: null }))) as { category?: string };

  if (!category || !ALL_CATEGORY_IDS.includes(category)) {
    return NextResponse.json(
      { error: `Catégorie manquante ou invalide. Valeurs possibles : ${ALL_CATEGORY_IDS.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const result = await runScrapeForCategory(category);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
