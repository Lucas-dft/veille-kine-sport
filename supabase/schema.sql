-- Veille Kiné Sport — schéma Supabase (Postgres)
-- À exécuter une fois dans l'éditeur SQL de Supabase (ou via `supabase db push`).

create table if not exists offers (
  id                     text primary key,
  titre                  text not null default '',
  club                   text not null default '',
  pays                   text not null default '',
  sport                  text not null default '',
  niveau                 text not null default '',
  genre                  text not null default 'Mixte / non précisé',
  resume                 text not null default '',
  lien                   text not null default '',
  source                 text not null default '',
  date_publication       date,
  date_trouvee           date not null default current_date,
  hors_zone_prioritaire  boolean not null default false,
  statut                 text not null default 'Nouveau',
  note                   text not null default '',
  expire                 boolean not null default false,
  vu                     boolean not null default false,
  emaile                 boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists offers_emaile_idx on offers (emaile) where emaile = false;
create index if not exists offers_expire_idx on offers (expire) where expire = false;

create table if not exists profile (
  id         int primary key default 1,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  constraint profile_singleton check (id = 1)
);

create table if not exists run_log (
  id             uuid primary key default gen_random_uuid(),
  started_at     timestamptz not null default now(),
  finished_at    timestamptz,
  category       text not null default '',
  offers_found   int not null default 0,
  offers_new     int not null default 0,
  status         text not null default 'running',
  error_message  text
);

create index if not exists run_log_started_at_idx on run_log (started_at desc);

-- Maintient updated_at à jour sur `offers`
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists offers_set_updated_at on offers;
create trigger offers_set_updated_at
  before update on offers
  for each row execute function set_updated_at();

-- RLS activée sans policy : seule la clé service_role (utilisée exclusivement
-- côté serveur par cette app) peut lire/écrire ces tables. La clé publique
-- (publishable/anon) n'a accès à rien, ce qui est voulu — le frontend ne
-- parle jamais directement à Supabase.
alter table offers enable row level security;
alter table profile enable row level security;
alter table run_log enable row level security;
