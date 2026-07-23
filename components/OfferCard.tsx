import { ExternalLink, StickyNote, Trash2 } from "lucide-react";
import { Offer } from "@/lib/types";
import { SPORT_ACCENT, STATUS_STYLE, STATUSES, FLAGS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { Badge, GenderBadge } from "./Badge";

export function OfferCard({
  offer: o,
  expanded,
  onToggle,
  onUpdate,
  onDelete,
}: {
  offer: Offer;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<Offer>) => void;
  onDelete: () => void;
}) {
  const accent = SPORT_ACCENT[o.sport] || "#5B6570";
  const st = STATUS_STYLE[o.statut] || STATUS_STYLE["Nouveau"];

  return (
    <article
      className={"kd-card" + (o.vu ? "" : " kd-card-new")}
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <div className="kd-card-top" onClick={onToggle}>
        <div className="kd-card-badges">
          {!o.vu && <Badge bg="#F3E9D2" fg="#8A6A1E">Nouveau</Badge>}
          {o.horsZonePrioritaire && <Badge bg="#F3E9D2" fg="#8A6A1E">Hors zone prioritaire</Badge>}
          {o.expire && <Badge bg="#F3E0DF" fg="#9B3A3A">Expirée</Badge>}
          <Badge outline fg={accent}>{o.sport}</Badge>
          <GenderBadge genre={o.genre} />
          <Badge bg="#E7E8EA" fg="#3E4650">{o.niveau}</Badge>
        </div>
        <h3 className="kd-card-title">{o.titre}</h3>
        <div className="kd-card-club">{o.club}</div>
        <div className="kd-card-meta">
          <span>{FLAGS[o.pays] || "🌍"} {o.pays}</span>
          <span className="kd-dot">·</span>
          <span>Trouvée le {formatDate(o.dateTrouvee)}</span>
          {o.datePublication && <><span className="kd-dot">·</span><span>Publiée le {formatDate(o.datePublication)}</span></>}
          {o.source && <><span className="kd-dot">·</span><span>{o.source}</span></>}
        </div>
        {o.resume && <p className="kd-card-resume">{o.resume}</p>}
      </div>

      <div className="kd-card-actions">
        <select
          className="kd-status-select"
          style={{ background: st.bg, color: st.fg }}
          value={o.statut}
          onChange={(e) => onUpdate({ statut: e.target.value })}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {o.lien ? (
          <a className="kd-btn kd-btn-ghost" href={o.lien} target="_blank" rel="noreferrer">
            <ExternalLink size={13} /> Voir l&apos;annonce
          </a>
        ) : (
          <span className="kd-btn kd-btn-ghost kd-btn-disabled"><ExternalLink size={13} /> Pas de lien</span>
        )}
        <button className="kd-icon-btn" onClick={onToggle} title="Note">
          <StickyNote size={14} />
        </button>
        <button className="kd-icon-btn kd-icon-btn-danger" onClick={onDelete} title="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div className="kd-card-note">
          <label>Note</label>
          <textarea
            placeholder="Contacts, relances, impressions…"
            value={o.note}
            onChange={(e) => onUpdate({ note: e.target.value })}
            rows={3}
          />
        </div>
      )}
    </article>
  );
}
