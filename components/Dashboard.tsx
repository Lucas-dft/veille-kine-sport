"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, SlidersHorizontal, Copy, Check, Plus, X,
  Info, ChevronDown, LayoutGrid, Table2, CheckCheck, RefreshCw,
} from "lucide-react";
import { Offer, NewOfferInput } from "@/lib/types";
import { PRIORITY_COUNTRIES, SPORTS, LEVELS, STATUSES } from "@/lib/constants";
import { formatDate, copyToClipboard } from "@/lib/format";
import { todayISO } from "@/lib/id";
import { ALL_CATEGORY_IDS } from "@/lib/scrape/categories";
import { OfferCard } from "./OfferCard";
import { TableView } from "./TableView";
import { AddOfferModal } from "./AddOfferModal";
import { FilterSelect } from "./FilterSelect";
import { CSS } from "./dashboardStyles";

export default function Dashboard() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [fPays, setFPays] = useState("Tous");
  const [fSport, setFSport] = useState("Tous");
  const [fNiveau, setFNiveau] = useState("Tous");
  const [fStatut, setFStatut] = useState("Tous");
  const [includeHorsZone, setIncludeHorsZone] = useState(true);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [showFilters, setShowFilters] = useState(true);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [copied, setCopied] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState<{ done: number; total: number } | null>(null);

  const loadOffers = useCallback(async () => {
    try {
      const res = await fetch("/api/offers");
      if (!res.ok) throw new Error("Impossible de charger les offres.");
      const data = await res.json();
      setOffers(data.offers || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Chargement initial depuis l'API : setState après resolution du fetch,
    // pattern standard non couvert proprement par la règle set-state-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOffers();
  }, [loadOffers]);

  const updateOffer = async (id: string, patch: Partial<Offer>) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
    } catch {
      setError("Échec de l'enregistrement. Vos derniers changements peuvent ne pas être conservés.");
    }
  };

  const deleteOffer = async (id: string) => {
    const prev = offers;
    setOffers((p) => p.filter((o) => o.id !== id));
    try {
      const res = await fetch(`/api/offers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setOffers(prev);
      setError("Échec de la suppression.");
    }
  };

  const markAllSeen = async () => {
    setOffers((prev) => prev.map((o) => ({ ...o, vu: true })));
    try {
      const res = await fetch("/api/offers/mark-all-seen", { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      setError("Échec de la mise à jour.");
    }
  };

  const addManualOffer = async (form: NewOfferInput) => {
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Cette offre semble déjà enregistrée.");
        return;
      }
      setOffers((prev) => [data.offer, ...prev]);
      setShowAdd(false);
    } catch {
      setError("Échec de l'enregistrement de l'offre.");
    }
  };

  const runRefresh = async () => {
    setRefreshing(true);
    setRefreshProgress({ done: 0, total: ALL_CATEGORY_IDS.length });
    let anyError = false;
    for (let i = 0; i < ALL_CATEGORY_IDS.length; i++) {
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: ALL_CATEGORY_IDS[i] }),
        });
        if (!res.ok) anyError = true;
      } catch {
        anyError = true;
      }
      setRefreshProgress({ done: i + 1, total: ALL_CATEGORY_IDS.length });
    }
    setRefreshing(false);
    setRefreshProgress(null);
    if (anyError) setError("Certaines catégories n'ont pas pu être actualisées (voir run_log en base).");
    await loadOffers();
  };

  const paysOptions = useMemo(() => {
    const set = new Set(PRIORITY_COUNTRIES);
    offers.forEach((o) => o.pays && set.add(o.pays));
    return Array.from(set);
  }, [offers]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return offers
      .filter((o) => (fPays === "Tous" ? true : o.pays === fPays))
      .filter((o) => (fSport === "Tous" ? true : o.sport === fSport))
      .filter((o) => (fNiveau === "Tous" ? true : o.niveau === fNiveau))
      .filter((o) => (fStatut === "Tous" ? true : o.statut === fStatut))
      .filter((o) => (includeHorsZone ? true : !o.horsZonePrioritaire))
      .filter((o) => (s === "" ? true : `${o.titre} ${o.club}`.toLowerCase().includes(s)))
      .sort((a, b) => (b.dateTrouvee || "").localeCompare(a.dateTrouvee || ""));
  }, [offers, search, fPays, fSport, fNiveau, fStatut, includeHorsZone]);

  const newCount = offers.filter((o) => !o.vu).length;

  const handleCopySummary = async () => {
    const list = offers.filter((o) => !o.vu).sort((a, b) => (b.dateTrouvee || "").localeCompare(a.dateTrouvee || ""));
    const base = list.length ? list : filtered;
    const lines: string[] = [];
    lines.push(`Veille kinésithérapie du sport — résumé du ${formatDate(todayISO())}`);
    lines.push(`${base.length} offre${base.length > 1 ? "s" : ""} à passer en revue`);
    lines.push("");
    base.forEach((o, i) => {
      lines.push(`${i + 1}. ${o.titre} — ${o.club} (${o.pays}, ${o.sport}, ${o.niveau})${o.horsZonePrioritaire ? " [hors zone prioritaire]" : ""}`);
      if (o.resume) lines.push(`   ${o.resume}`);
      lines.push(`   Lien : ${o.lien || "non renseigné"}`);
      lines.push("");
    });
    try {
      await copyToClipboard(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("La copie a échoué. Votre navigateur bloque peut-être le presse-papiers.");
    }
  };

  return (
    <div className="kd-root">
      <style>{CSS}</style>

      <header className="kd-masthead">
        <div>
          <div className="kd-eyebrow">Veille professionnelle</div>
          <h1 className="kd-title">Kinésithérapie du Sport — Recrutement Élite</h1>
          <p className="kd-subtitle">Clubs, franchises et universités de haut niveau</p>
        </div>
        <div className="kd-masthead-actions">
          <div className="kd-scoreboard">
            <span className="kd-scoreboard-label">Nouvelles offres</span>
            <span className="kd-scoreboard-digits">{String(newCount).padStart(2, "0")}</span>
            <button className="kd-scoreboard-btn" onClick={markAllSeen} disabled={newCount === 0}>
              <CheckCheck size={13} /> Tout marquer comme vu
            </button>
          </div>
        </div>
      </header>

      <div className="kd-banner">
        <Info size={15} />
        <span>
          La veille tourne automatiquement chaque matin (recherche web + boîte mail connectée) et un
          récapitulatif est envoyé par email dès que de nouvelles offres apparaissent — plus besoin de
          demander une actualisation. Le bouton ci-dessous reste disponible pour forcer une vérification
          immédiate.
        </span>
      </div>

      {error && (
        <div className="kd-banner kd-banner-error">
          <span>{error}</span>
          <button className="kd-banner-close" onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      <div className="kd-toolbar">
        <div className="kd-search">
          <Search size={15} />
          <input
            placeholder="Rechercher un poste ou un club…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="kd-btn kd-btn-ghost" onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal size={14} /> Filtres <ChevronDown size={14} style={{ transform: showFilters ? "rotate(180deg)" : "none" }} />
        </button>

        <div className="kd-view-toggle">
          <button className={view === "cards" ? "active" : ""} onClick={() => setView("cards")} title="Vue cartes">
            <LayoutGrid size={15} />
          </button>
          <button className={view === "table" ? "active" : ""} onClick={() => setView("table")} title="Vue tableau">
            <Table2 size={15} />
          </button>
        </div>

        <button className="kd-btn kd-btn-ghost" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Ajouter une offre
        </button>

        <button className="kd-btn kd-btn-ghost" onClick={runRefresh} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? "kd-spin" : ""} />
          {refreshing
            ? `Actualisation ${refreshProgress?.done ?? 0}/${refreshProgress?.total ?? ALL_CATEGORY_IDS.length}…`
            : "Actualiser maintenant"}
        </button>

        <button className="kd-btn kd-btn-primary" onClick={handleCopySummary}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copié" : "Copier le résumé du jour"}
        </button>
      </div>

      {showFilters && (
        <div className="kd-filters">
          <FilterSelect label="Pays" value={fPays} onChange={setFPays} options={["Tous", ...paysOptions]} />
          <FilterSelect label="Sport" value={fSport} onChange={setFSport} options={["Tous", ...SPORTS]} />
          <FilterSelect label="Niveau" value={fNiveau} onChange={setFNiveau} options={["Tous", ...LEVELS]} />
          <FilterSelect label="Statut" value={fStatut} onChange={setFStatut} options={["Tous", ...STATUSES]} />
          <label className="kd-checkbox">
            <input type="checkbox" checked={includeHorsZone} onChange={(e) => setIncludeHorsZone(e.target.checked)} />
            Inclure les offres hors zone prioritaire
          </label>
        </div>
      )}

      <main className="kd-main">
        {loading ? (
          <div className="kd-empty">Chargement des offres…</div>
        ) : offers.length === 0 ? (
          <div className="kd-empty">
            <p className="kd-empty-title">Aucune offre enregistrée pour le moment.</p>
            <p>
              La première veille automatique passera au prochain créneau planifié, ou lancez « Actualiser
              maintenant » ci-dessus pour déclencher une recherche tout de suite.
            </p>
            <button className="kd-btn kd-btn-primary" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Ajouter une offre
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="kd-empty">
            <p className="kd-empty-title">Aucune offre ne correspond à ces filtres.</p>
            <p>Élargissez vos critères pour voir davantage de résultats.</p>
          </div>
        ) : view === "cards" ? (
          <div className="kd-grid">
            {filtered.map((o) => (
              <OfferCard
                key={o.id}
                offer={o}
                expanded={expandedId === o.id}
                onToggle={() => {
                  setExpandedId(expandedId === o.id ? null : o.id);
                  if (!o.vu) updateOffer(o.id, { vu: true });
                }}
                onUpdate={(patch) => updateOffer(o.id, patch)}
                onDelete={() => deleteOffer(o.id)}
              />
            ))}
          </div>
        ) : (
          <TableView offers={filtered} onUpdate={updateOffer} onDelete={deleteOffer} />
        )}
      </main>

      {showAdd && <AddOfferModal onClose={() => setShowAdd(false)} onSubmit={addManualOffer} paysOptions={paysOptions} />}

      <footer className="kd-footer">
        Veille automatisée : recherche web quotidienne + vérification de la boîte mail connectée (alertes
        LinkedIn/Glassdoor), avec récapitulatif par email chaque matin dès qu&apos;il y a du nouveau. Le profil
        ciblé (diplôme, sports, pays prioritaires) est modifiable dans la table Supabase `profile` sans
        redéploiement.
      </footer>
    </div>
  );
}
