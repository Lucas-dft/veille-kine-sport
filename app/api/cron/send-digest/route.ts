import { NextRequest, NextResponse } from "next/server";
import { isValidCronSecret } from "@/lib/cronAuth";
import { sendDailyDigest } from "@/lib/email/resend";

async function handle(request: NextRequest) {
  if (!isValidCronSecret(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const result = await sendDailyDigest();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET : appelé nativement par Vercel Cron (voir vercel.json).
export const GET = handle;
// POST : pratique pour un déclenchement manuel (curl -X POST avec x-cron-secret).
export const POST = handle;
