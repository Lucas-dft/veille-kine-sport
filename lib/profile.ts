import { Profile } from "./types";
import { getSupabaseAdmin } from "./supabase";

/**
 * Valeur de repli si la table `profile` est vide (ne devrait arriver qu'avant
 * le premier seed). La source de vérité vit en base, éditable depuis Supabase
 * sans redéploiement.
 */
export const DEFAULT_PROFILE: Profile = {
  diplome: "Diplôme de Masseur-Kinésithérapeute, option imagerie et sport",
  experience: "Post-diplôme",
  langues: ["français", "anglais", "espagnol"],
  experiencesTerrain: [
    "Stage en cabinet",
    "Stage club de rugby",
    "Aides ponctuelles en compétitions et clubs de rugby",
    "Évaluations biomécaniques et complètes avec imagerie",
  ],
  mobilite: "Prêt à déménager, pas de visa de travail direct (hors UE/Schengen selon le pays)",
  sportsCibles: ["Football", "Basketball", "Rugby", "Football américain", "Golf", "Sport mécanique (F1, MotoGP)"],
  paysPrioritaires: ["France", "Suisse", "Angleterre", "Irlande", "États-Unis", "Italie", "Monaco", "Espagne", "Canada"],
  paysHorsZone: "À remonter quand même si offre exceptionnelle, avec étiquette 'hors zone prioritaire'",
  objectif: "Poste dans un club/équipe de grande ligue reconnue ou une université sportive prestigieuse (ex. NCAA D1)",
};

/** Charge le profil éditable depuis Supabase, avec repli sur DEFAULT_PROFILE si la table est vide. */
export async function loadProfile(): Promise<Profile> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("profile").select("data").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_PROFILE;
  return data.data as Profile;
}
