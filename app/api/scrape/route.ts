import { NextRequest, NextResponse } from "next/server";
import { runScrapeForCategory } from "@/lib/scrape/run";
import { ALL_CATEGORY_IDS } from "@/lib/scrape/categories";

/**
 * Déclenchement manuel (bouton admin dans le dashboard, protégé par le
 * cookie de session via proxy.ts). Le corps précise une seule catégorie à la
 * fois pour rester sous la limite de durée des fonctions serverless — le
 * dashboard boucle côté client sur toutes les catégories.
 */
export async function POST(request: NextRequest) {
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
