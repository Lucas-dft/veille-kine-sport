import { Offer } from "@/lib/types";
import { FLAGS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildDigestSubject(count: number, dateLabel: string): string {
  return `Veille kiné sport — ${count} nouvelle${count > 1 ? "s" : ""} offre${count > 1 ? "s" : ""} — ${dateLabel}`;
}

export function buildDigestHtml(offers: Offer[], dashboardUrl: string): string {
  const rows = offers
    .map((o) => {
      const flag = FLAGS[o.pays] || "🌍";
      const hz = o.horsZonePrioritaire
        ? ' <span style="color:#8A6A1E;font-weight:600;">[hors zone prioritaire]</span>'
        : "";
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #DDE1E3;">
            <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#0B1E33;margin-bottom:2px;">
              ${esc(o.titre)}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:13px;color:#5B6570;margin-bottom:6px;">
              ${esc(o.club)} — ${flag} ${esc(o.pays)} · ${esc(o.sport)} · ${esc(o.niveau)}${hz}
            </div>
            ${o.resume ? `<div style="font-family:Arial,sans-serif;font-size:13px;color:#414B55;line-height:1.5;margin-bottom:6px;">${esc(o.resume)}</div>` : ""}
            <div style="font-family:Arial,sans-serif;font-size:12px;color:#5B6570;">
              Publiée le ${formatDate(o.datePublication)} · ${esc(o.source)} ·
              <a href="${esc(o.lien)}" style="color:#3E6E8E;">Voir l'annonce</a>
            </div>
          </td>
        </tr>`;
    })
    .join("");

  return `
  <div style="background:#F5F6F4;padding:24px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #DDE1E3;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(180deg,#0B1E33,#142C47);padding:20px 24px;">
                <div style="font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.14em;font-size:10px;color:#9FB3C8;margin-bottom:4px;">
                  Veille professionnelle
                </div>
                <div style="font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#F2F4F6;">
                  Kinésithérapie du Sport — ${offers.length} nouvelle${offers.length > 1 ? "s" : ""} offre${offers.length > 1 ? "s" : ""}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 4px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${rows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 24px;border-top:1px solid #DDE1E3;">
                <a href="${esc(dashboardUrl)}" style="font-family:Arial,sans-serif;font-size:13px;color:#FFFFFF;background:#0B1E33;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">
                  Ouvrir le dashboard
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}
