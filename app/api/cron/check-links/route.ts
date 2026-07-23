import { NextRequest, NextResponse } from "next/server";
import { isValidCronSecret } from "@/lib/cronAuth";
import { checkExpiredLinks } from "@/lib/scrape/checkLinks";

export async function POST(request: NextRequest) {
  if (!isValidCronSecret(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const result = await checkExpiredLinks();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
