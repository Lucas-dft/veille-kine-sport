import { getSupabaseAdmin } from "@/lib/supabase";

export async function startRun(category: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("run_log")
    .insert({ category, status: "running" })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message || "Impossible de créer le run_log.");
  return data.id as string;
}

export async function finishRun(
  id: string,
  result: { offersFound: number; offersNew: number; status: "ok" | "error"; errorMessage?: string }
): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("run_log")
    .update({
      finished_at: new Date().toISOString(),
      offers_found: result.offersFound,
      offers_new: result.offersNew,
      status: result.status,
      error_message: result.errorMessage || null,
    })
    .eq("id", id);
}
