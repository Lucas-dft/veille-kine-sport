import { useState } from "react";
import { X } from "lucide-react";
import { NewOfferInput } from "@/lib/types";
import { SPORTS, LEVELS, GENDERS } from "@/lib/constants";

export function AddOfferModal({
  onClose,
  onSubmit,
  paysOptions,
}: {
  onClose: () => void;
  onSubmit: (form: NewOfferInput) => void;
  paysOptions: string[];
}) {
  const [form, setForm] = useState<NewOfferInput>({
    titre: "", club: "", pays: "", sport: SPORTS[0], niveau: LEVELS[0], genre: GENDERS[2],
    resume: "", lien: "", source: "", datePublication: "",
    horsZonePrioritaire: false,
  });
  const set = (k: keyof NewOfferInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid = form.titre.trim() && form.club.trim() && form.pays.trim();

  return (
    <div className="kd-modal-overlay" onClick={onClose}>
      <div className="kd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kd-modal-head">
          <h2>Ajouter une offre</h2>
          <button className="kd-icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="kd-modal-body">
          <label className="kd-field">
            <span>Intitulé du poste *</span>
            <input value={form.titre} onChange={set("titre")} placeholder="Ex. Sports Physiotherapist" />
          </label>
          <label className="kd-field">
            <span>Club / équipe / université *</span>
            <input value={form.club} onChange={set("club")} />
          </label>
          <div className="kd-field-row">
            <label className="kd-field">
              <span>Pays *</span>
              <input value={form.pays} onChange={set("pays")} list="kd-pays-list" placeholder="Ex. France" />
              <datalist id="kd-pays-list">
                {paysOptions.map((p) => <option key={p} value={p} />)}
              </datalist>
            </label>
            <label className="kd-field">
              <span>Sport</span>
              <select value={form.sport} onChange={set("sport")}>
                {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="kd-field">
              <span>Niveau</span>
              <select value={form.niveau} onChange={set("niveau")}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label className="kd-field">
              <span>Genre</span>
              <select value={form.genre} onChange={set("genre")}>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
          </div>
          <label className="kd-field">
            <span>Résumé court (1-2 phrases, reformulées)</span>
            <textarea rows={2} value={form.resume} onChange={set("resume")} />
          </label>
          <div className="kd-field-row">
            <label className="kd-field">
              <span>Lien de l&apos;annonce</span>
              <input value={form.lien} onChange={set("lien")} placeholder="https://…" />
            </label>
            <label className="kd-field">
              <span>Source</span>
              <input value={form.source} onChange={set("source")} placeholder="LinkedIn, TeamWork Online…" />
            </label>
            <label className="kd-field">
              <span>Date de publication (si connue)</span>
              <input type="date" value={form.datePublication} onChange={set("datePublication")} />
            </label>
          </div>
          <label className="kd-checkbox">
            <input
              type="checkbox"
              checked={form.horsZonePrioritaire}
              onChange={(e) => setForm((f) => ({ ...f, horsZonePrioritaire: e.target.checked }))}
            />
            Offre hors zone prioritaire (mais exceptionnelle)
          </label>
        </div>
        <div className="kd-modal-foot">
          <button className="kd-btn kd-btn-ghost" onClick={onClose}>Annuler</button>
          <button
            className="kd-btn kd-btn-primary"
            disabled={!valid}
            onClick={() => onSubmit(form)}
          >
            Enregistrer l&apos;offre
          </button>
        </div>
      </div>
    </div>
  );
}
