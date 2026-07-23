/**
 * Découpage des sources en groupes pour rester sous la limite de durée des
 * fonctions serverless (60s en Vercel Hobby). Chaque groupe correspond à un
 * appel séparé à /api/scrape?category=<id> — voir SPEC section 5 "Limites de
 * l'appel API à respecter".
 */
export interface ScrapeCategory {
  id: string;
  label: string;
  /** Décrit au modèle les ligues/sources à interroger pour ce groupe (contexte de filtrage). */
  brief: string;
  /**
   * Requêtes Brave Search explicites pour ce groupe (contrairement à un outil
   * de recherche agentique, Brave Search API répond à une requête précise à
   * la fois — c'est donc le code, pas le modèle, qui décide des requêtes).
   */
  queries: string[];
}

export const SCRAPE_CATEGORIES: ScrapeCategory[] = [
  {
    id: "football-europe",
    label: "Football — ligues nationales d'Europe de l'Ouest",
    brief:
      "Football (soccer). Ligues : Premier League + EFL (Angleterre), Ligue 1 + Ligue 2 (France), " +
      "Serie A (Italie), La Liga (Espagne), Bundesliga (Allemagne), Swiss Football League (Suisse), " +
      "League of Ireland (Irlande). Cherche tous les clubs de ces ligues, pas seulement ceux des pays " +
      "prioritaires. Plateformes utiles : LinkedIn Jobs, Indeed, Glassdoor, Jobs in Football, " +
      "Jobs4football, EFL iRecruit, sites carrières officiels des clubs.",
    queries: [
      "physiotherapist job vacancy Premier League EFL football club",
      "kinésithérapeute recrutement club Ligue 1 Ligue 2 football",
      "physiotherapist job Serie A La Liga Bundesliga football club vacancy",
    ],
  },
  {
    id: "football-cl",
    label: "Football — clubs engagés en Champions League / Women's Champions League",
    brief:
      "Football (soccer). Tout club engagé en UEFA Champions League ou Women's Champions League lors " +
      "de la saison en cours ou à venir, quel que soit son pays d'origine (ex. Benfica, Ajax, Bayern, " +
      "Feyenoord, Partizan si en Europa/Conference le cas échéant). Ne pas se limiter aux pays " +
      "prioritaires. Plateformes utiles : sites carrières officiels des clubs, Jobs in Football, " +
      "LinkedIn Jobs, Indeed (par pays), Glassdoor.",
    queries: [
      "physiotherapist job vacancy UEFA Champions League football club",
      "physiotherapist job Women's Champions League football club career",
    ],
  },
  {
    id: "football-na",
    label: "Football — MLS (États-Unis / Canada)",
    brief:
      "Football (soccer) en Amérique du Nord : MLS (effectif premier, réserve/développement, académies). " +
      "Plateformes utiles : TeamWork Online, sites carrières officiels des franchises, Indeed (par ville).",
    queries: [
      "MLS soccer physiotherapist athletic trainer job teamworkonline",
      "MLS academy athletic therapist job vacancy",
    ],
  },
  {
    id: "basketball-na",
    label: "Basketball — NBA / WNBA / G League / OTE",
    brief:
      "Basketball en Amérique du Nord : NBA, WNBA, NBA G League, OTE (Overtime Elite). " +
      "Plateformes utiles : TeamWork Online, sites carrières officiels des franchises, Indeed (par ville).",
    queries: [
      "NBA WNBA athletic trainer physical therapist job teamworkonline",
      "NBA G League OTE Overtime Elite athletic trainer job vacancy",
    ],
  },
  {
    id: "basketball-eu",
    label: "Basketball — Euroleague (tous pays)",
    brief:
      "Basketball : Euroleague, tous les clubs qui la composent, indépendamment du pays (ex. Real Madrid, " +
      "Panathinaikos, Olympiacos, Partizan, Fenerbahçe). Ne pas se limiter aux pays prioritaires.",
    queries: ["Euroleague basketball club physiotherapist job vacancy career"],
  },
  {
    id: "football-us",
    label: "Football américain — NFL & NCAA Division I",
    brief:
      "Football américain : NFL (toutes franchises) et NCAA Division I (toute université avec un " +
      "programme sportif de haut niveau — pas seulement football américain : basketball, natation, " +
      "athlétisme etc. sont éligibles si le programme est NCAA D1). Plateformes utiles : TeamWork " +
      "Online, NCAA Market, CollegeSports.jobs, sites carrières officiels des franchises/universités.",
    queries: [
      "NFL athletic trainer physical therapist job teamworkonline",
      "NCAA Division I athletic trainer job vacancy ncaa market collegesports",
    ],
  },
  {
    id: "rugby",
    label: "Rugby — Top 14, Premiership, URC",
    brief:
      "Rugby : Top 14 (France), Premiership Rugby (Angleterre), URC — United Rugby Championship " +
      "(Irlande, Pays de Galles, Écosse, Italie ET Afrique du Sud : Stormers, Bulls, Sharks, Lions). " +
      "Plateformes utiles : LNR, Premiership Rugby, URC, sites carrières des clubs individuels, " +
      "LinkedIn Jobs, Indeed.",
    queries: [
      "kinésithérapeute recrutement club Top 14 rugby",
      "physiotherapist job vacancy Premiership Rugby URC club",
    ],
  },
  {
    id: "hockey-baseball",
    label: "Hockey (NHL) & Baseball (MLB, dont Minor League) — Amérique du Nord",
    brief:
      "Hockey sur glace : NHL (toutes franchises). Baseball : MLB et ses filières Minor League. " +
      "Plateformes utiles : TeamWork Online, sites carrières officiels des franchises.",
    queries: [
      "NHL athletic trainer physical therapist job teamworkonline",
      "MLB minor league physical therapist job vacancy teamworkonline",
    ],
  },
  {
    id: "autres-sports",
    label: "Handball, Natation, Golf, Tennis, Sport mécanique, Cyclisme",
    brief:
      "Handball : Starligue (France), Bundesliga (Allemagne). Natation : fédérations nationales et " +
      "centres de performance élite (pays prioritaires + toute structure d'élite reconnue). Golf : " +
      "PGA Tour, DP World Tour, LIV Golf (circuits internationaux, y compris performance institutes " +
      "rattachés à un tour). Tennis : circuits ATP/WTA, fédérations nationales (ex. LTA). Sport " +
      "mécanique : écuries F1, MotoGP. Cyclisme : équipes UCI WorldTour (Tour de France et grands " +
      "tours). Plateformes utiles : Fluid Jobs, Motorsportjobs.com, Formula Careers, fédérations " +
      "sportives nationales, sites carrières des circuits.",
    queries: [
      "PGA Tour DP World Tour LIV Golf physiotherapist job vacancy",
      "Formula 1 MotoGP team physiotherapist job vacancy motorsportjobs",
      "UCI WorldTour cycling team physiotherapist soigneur job vacancy",
    ],
  },
];

/**
 * Id spécial traité à part par la route de scraping : au lieu d'une
 * recherche web, déclenche la vérification de la boîte mail connectée
 * (voir lib/scrape/gmail.ts). N'a d'effet que si l'intégration Gmail est
 * configurée (variables GMAIL_*) ; sinon c'est un no-op silencieux.
 */
export const GMAIL_CATEGORY_ID = "gmail-alerts";

export const ALL_CATEGORY_IDS = [...SCRAPE_CATEGORIES.map((c) => c.id), GMAIL_CATEGORY_ID];
