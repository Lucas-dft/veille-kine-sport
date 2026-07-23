import { ExternalLink, Trash2 } from "lucide-react";
import { Offer } from "@/lib/types";
import { STATUS_STYLE, STATUSES, GENDER_STYLE, FLAGS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export function TableView({
  offers,
  onUpdate,
  onDelete,
}: {
  offers: Offer[];
  onUpdate: (id: string, patch: Partial<Offer>) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="kd-table-wrap">
      <table className="kd-table">
        <thead>
          <tr>
            <th>Titre</th><th>Club / Équipe</th><th>Pays</th><th>Sport</th><th>Genre</th><th>Niveau</th>
            <th>Statut</th><th>Publiée</th><th>Trouvée</th><th>Lien</th><th></th>
          </tr>
        </thead>
        <tbody>
          {offers.map((o) => {
            const st = STATUS_STYLE[o.statut] || STATUS_STYLE["Nouveau"];
            const g = GENDER_STYLE[o.genre] || GENDER_STYLE["Mixte / non précisé"];
            return (
              <tr key={o.id} className={o.vu ? "" : "kd-row-new"}>
                <td className="kd-td-title">{o.titre}</td>
                <td>{o.club}</td>
                <td>{FLAGS[o.pays] || "🌍"} {o.pays}{o.horsZonePrioritaire ? " *" : ""}</td>
                <td>{o.sport}</td>
                <td title={g.label} style={{ color: g.fg, fontWeight: 700, textAlign: "center" }}>{g.symbol}</td>
                <td>{o.niveau}</td>
                <td>
                  <select
                    className="kd-status-select kd-status-select-sm"
                    style={{ background: st.bg, color: st.fg }}
                    value={o.statut}
                    onChange={(e) => onUpdate(o.id, { statut: e.target.value, vu: true })}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="kd-mono">{o.datePublication ? formatDate(o.datePublication) : "—"}</td>
                <td className="kd-mono">{formatDate(o.dateTrouvee)}</td>
                <td>
                  {o.lien ? (
                    <a href={o.lien} target="_blank" rel="noreferrer" className="kd-icon-btn"><ExternalLink size={14} /></a>
                  ) : "—"}
                </td>
                <td>
                  <button className="kd-icon-btn kd-icon-btn-danger" onClick={() => onDelete(o.id)}><Trash2 size={14} /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="kd-table-note">* offre hors zone prioritaire</p>
    </div>
  );
}
