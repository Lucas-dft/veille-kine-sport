# Veille Kiné Sport

Webapp de veille recrutement pour la kinésithérapie du sport de haut niveau —
reproduction fidèle du prototype `veille-kine-sport.jsx`, avec deux
automatisations en plus : scraping quotidien et email récapitulatif quotidien.

Voir `SPEC-veille-kine-sport.md` (à la racine du dossier parent) pour la
spécification d'origine.

## Stack

- **Next.js 16 (App Router) + TypeScript + Tailwind** — frontend, reprend les
  composants et le design du prototype.
- **Supabase (Postgres)** — base de données (`offers`, `profile`, `run_log`).
- **Brave Search API** — recherche web (voir note ci-dessous sur le choix de Brave plutôt que le `google_search` de Gemini).
- **Google Gemini API (`gemini-flash-latest`, texte seul)** — filtre/reformule les résultats de recherche en offres structurées, gratuit.
- **Resend** — envoi de l'email quotidien.
- **GitHub Actions** — orchestrateur du scraping quotidien (pas Vercel Cron :
  voir "Pourquoi GitHub Actions et pas seulement Vercel Cron" ci-dessous).
- **Vercel Cron** — déclenche l'envoi de l'email quotidien.

## Mise en route

### 1. Installer les dépendances

```bash
npm install
```

### 2. Créer le projet Supabase

1. Crée un projet sur [supabase.com](https://supabase.com) (gratuit).
2. Dans l'éditeur SQL, exécute dans l'ordre :
   - `supabase/schema.sql`
   - `supabase/seed.sql` (reprend les 26 offres de démarrage du prototype, pour
     ne pas repartir d'un dashboard vide — idempotent, à rejouer sans risque)
3. Récupère l'URL du projet et la clé `service_role` (Project Settings → API)
   → variables `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Créer une clé API Google Gemini (gratuite)

Sur [aistudio.google.com/apikey](https://aistudio.google.com/apikey), connecte-toi
avec un compte Google et génère une clé → `GEMINI_API_KEY`. Aucune carte
bancaire requise, utilisée en texte seul (filtrage/reformulation), ce qui reste
gratuit indéfiniment à ce volume.

**Pourquoi pas l'outil `google_search` de Gemini ?** C'est le choix initial de
ce projet, mais en pratique le grounding Gemini (même annoncé "gratuit jusqu'à
500 requêtes/jour" dans la documentation) s'est révélé nécessiter un
**prépaiement minimum de 10$** dès qu'une carte est liée au projet — testé et
confirmé en conditions réelles, pas juste documenté. Ce n'était pas le
compromis souhaité (0€ de dépense), d'où le passage à Brave Search pour la
recherche elle-même, Gemini ne servant plus qu'à la reformulation en JSON
structuré (qui, elle, fonctionne bien sur le palier gratuit sans carte).

### 3bis. Créer une clé API Brave Search (gratuite, carte de vérification requise)

Sur [api-dashboard.search.brave.com](https://api-dashboard.search.brave.com),
crée un compte, choisis le plan **Free** (5$/mois de crédit auto-appliqué,
≈1000 requêtes/mois). Une carte est demandée pour vérification d'identité
anti-fraude mais **aucun achat minimum n'est imposé** (contrairement au
prépaiement Gemini) — le coût réel attendu est 0€ à notre volume (~20
requêtes/jour, soit ~600/mois, bien sous le quota gratuit). Génère la clé →
`BRAVE_SEARCH_API_KEY`.

### 4. Configurer Resend (email quotidien)

1. Crée un compte gratuit sur [resend.com](https://resend.com) avec l'adresse
   `ldufiet.pro@gmail.com` (100 emails/jour offerts, largement suffisant ici).
2. Génère une clé API → `RESEND_API_KEY`.
3. Laisse `RESEND_FROM=onboarding@resend.dev` — ce domaine partagé de Resend ne
   peut envoyer qu'à l'adresse du **propriétaire du compte**, donc tant que
   `USER_EMAIL=ldufiet.pro@gmail.com` (la même adresse que celle du compte
   Resend), aucune configuration DNS/domaine n'est nécessaire. Si tu veux un
   jour envoyer depuis un domaine à toi, il faudra vérifier ce domaine dans
   Resend et changer `RESEND_FROM`.

### 5. Variables d'environnement

Copie `.env.example` vers `.env.local` (dev) et renseigne les mêmes variables
dans Vercel (Project Settings → Environment Variables) pour la prod.

```bash
cp .env.example .env.local
```

Génère une valeur aléatoire pour `CRON_SECRET`, par exemple :

```bash
openssl rand -hex 24
```

### 6. Lancer en local

```bash
npm run dev
```

Va sur `http://localhost:3000` — le dashboard s'affiche directement, sans mot
de passe (accès direct au tableau des offres).

### 7. Déployer sur Vercel

```bash
npx vercel
```

Renseigne toutes les variables de `.env.example` dans les Environment
Variables du projet Vercel (Production **et** Preview si tu comptes tester des
PR). Le cron de `vercel.json` (envoi de l'email) se met en place automatiquement
au déploiement.

### 8. Activer le scraping quotidien (GitHub Actions)

Le scraping tourne via un workflow GitHub Actions (`.github/workflows/daily-scrape.yml`),
pas via Vercel Cron — voir explication plus bas. Pour l'activer :

1. Pousse ce dossier sur un dépôt GitHub.
2. Dans Settings → Secrets and variables → Actions, ajoute :
   - `APP_URL` = URL de ton déploiement Vercel (ex. `https://veille-kine-sport.vercel.app`)
   - `CRON_SECRET` = la même valeur que dans Vercel
3. Le workflow se déclenche chaque jour à 5h UTC (~6h/7h à Paris selon l'heure
   d'été/hiver — ajuste le `cron:` dans le fichier si tu veux être plus précis,
   sachant que ni GitHub Actions ni Vercel Cron ne gèrent nativement les fuseaux
   horaires avec heure d'été).
4. Tu peux aussi le déclencher manuellement depuis l'onglet Actions du repo
   (bouton "Run workflow" — le workflow a `workflow_dispatch` activé).

### 9. Tester manuellement avant d'attendre le cron

- Bouton **« Actualiser maintenant »** dans le dashboard (protégé par ta
  session) : lance le scraping catégorie par catégorie, avec une barre de
  progression.
- `curl -X POST https://.../api/cron/send-digest -H "x-cron-secret: ..."` pour
  forcer l'envoi de l'email sans attendre le cron Vercel.
- Table `run_log` dans Supabase pour debugger un run (statut, erreurs, nombre
  d'offres trouvées/nouvelles par catégorie).

## Pourquoi GitHub Actions et pas seulement Vercel Cron ?

Les fonctions serverless Vercel ont une limite de durée (60s en plan Hobby).
Une recherche web complète sur ~10 groupes de ligues/circuits peut dépasser
cette limite. Le scraping est donc découpé en 10 appels courts (un par
catégorie, voir `lib/scrape/categories.ts`), orchestrés par un workflow GitHub
Actions (gratuit, pas de limite de durée aussi stricte) qui appelle
`POST /api/cron/scrape` une fois par catégorie. Seul l'envoi de l'email
(rapide, une seule requête DB + un appel Resend) reste sur Vercel Cron.

## Modifier le profil ciblé

Le profil (diplôme, langues, sports ciblés, pays prioritaires, objectif...)
vit dans la table Supabase `profile` (une seule ligne, colonne `data` en
JSON) — modifiable directement depuis l'éditeur de table Supabase, sans
redéploiement. Valeur par défaut : `lib/profile.ts` (`DEFAULT_PROFILE`), utilisée
uniquement si la table est vide.

## Intégration Gmail (optionnelle, désactivée par défaut)

`lib/scrape/gmail.ts` peut interroger la boîte mail `lucas.kine.jobs@gmail.com`
(alertes emploi LinkedIn/Glassdoor déjà reçues) en plus de la recherche web —
dans la même veille quotidienne (catégorie spéciale `gmail-alerts`). Ça
appelle directement l'**API Gmail officielle de Google** en lecture seule
(scope `gmail.readonly`), pas un connecteur tiers : plus fiable, seulement des
API bien documentées (API Gmail + un appel Claude classique pour reformuler
les offres trouvées). **Cette brique ne s'active que si les 3 variables
`GMAIL_OAUTH_CLIENT_ID`, `GMAIL_OAUTH_CLIENT_SECRET` et `GMAIL_REFRESH_TOKEN`
sont toutes renseignées** ; tant qu'elles sont vides, c'est un no-op silencieux
et le reste du scraping fonctionne normalement.

### Créer l'app OAuth (gratuit, pas de compte de facturation nécessaire)

1. Va sur [console.cloud.google.com](https://console.cloud.google.com), crée
   un nouveau projet (ex. "veille-kine-sport").
2. **APIs & Services → Library** → cherche "Gmail API" → **Enable**.
3. **APIs & Services → OAuth consent screen** :
   - Type d'utilisateur : **External** (pas besoin de Google Workspace).
   - Renseigne un nom d'app et un email de contact.
   - Scopes : ajoute `https://www.googleapis.com/auth/gmail.readonly`.
   - Test users : ajoute `lucas.kine.jobs@gmail.com` (obligatoire tant que
     l'app reste en mode "Testing", ce qui est très bien ici — inutile de
     passer l'app en production pour un usage perso).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID** :
   - Type d'application : **Desktop app** (le plus simple pour un flow
     d'autorisation en une fois, sans URL de callback à héberger).
   - Récupère le **Client ID** et le **Client secret** →
     `GMAIL_OAUTH_CLIENT_ID` / `GMAIL_OAUTH_CLIENT_SECRET`.
5. Génère le `refresh_token` une seule fois, en te connectant avec le compte
   `lucas.kine.jobs@gmail.com` lors du consentement. Le plus simple : utilise
   [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground) :
   - Icône ⚙️ en haut à droite → coche "Use your own OAuth credentials" →
     renseigne ton Client ID/secret.
   - À gauche, dans la liste des scopes, ajoute manuellement
     `https://www.googleapis.com/auth/gmail.readonly` → **Authorize APIs** →
     connecte-toi avec `lucas.kine.jobs@gmail.com`.
   - Clique **Exchange authorization code for tokens** → copie le
     **Refresh token** affiché → `GMAIL_REFRESH_TOKEN`.
6. Renseigne les 3 variables dans Vercel et dans les secrets GitHub Actions.

Aucune de ces étapes ne nécessite d'activer la facturation sur le projet
Google Cloud — l'API Gmail est gratuite dans ces volumes (quelques dizaines
d'emails lus par jour, très loin du quota gratuit journalier).

## Ce qui change par rapport au prototype

- Les données ne vivent plus dans `window.storage` mais dans Supabase.
- Deux automatisations quotidiennes en plus (scraping, email) — le reste
  (filtres, statuts, notes, vue cartes/tableau, ajout manuel, copie du résumé
  du jour) est identique.
- Un bouton **« Actualiser maintenant »** et un bouton de déconnexion ont été
  ajoutés au masthead/toolbar ; la bannière d'info explique désormais que la
  veille est automatique.
- Contraintes de la spec respectées : jamais de texte intégral d'annonce
  copié (résumé reformulé uniquement), dédup stricte par
  `hash(club|titre|lien)`, aucune offre déjà connue ré-émise dans un email.
