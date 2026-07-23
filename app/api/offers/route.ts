import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rowToOffer, OfferRow } from "@/lib/offerMapper";
import { makeId, todayISO } from "@/lib/id";
import { NewOfferInput } from "@/lib/types";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .order("date_trouvee", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ offers: (data as OfferRow[]).map(rowToOffer) });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Partial<NewOfferInput> | null;

  if (!body?.titre?.trim() || !body?.club?.trim() || !body?.pays?.trim()) {
    return NextResponse.json(
      { error: "Titre, club et pays sont obligatoires." },
      { status: 400 }
    );
  }

  const id = makeId({ club: body.club, titre: body.titre, lien: body.lien });
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase.from("offers").select("id").eq("id", id).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "Cette offre semble déjà enregistrée." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("offers")
    .insert({
      id,
      titre: body.titre,
      club: body.club,
      pays: body.pays,
      sport: body.sport || "",
      niveau: body.niveau || "",
      genre: body.genre || "Mixte / non précisé",
      resume: body.resume || "",
      lien: body.lien || "",
      source: body.source || "",
      date_publication: body.datePublication || null,
      date_trouvee: todayISO(),
      hors_zone_prioritaire: !!body.horsZonePrioritaire,
      statut: "Nouveau",
      note: "",
      expire: false,
      vu: false,
      emaile: false,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ offer: rowToOffer(data as OfferRow) }, { status: 201 });
}
