import { ReactNode } from "react";
import { GENDER_STYLE } from "@/lib/constants";

export function Badge({
  children,
  bg,
  fg,
  outline,
}: {
  children: ReactNode;
  bg?: string;
  fg: string;
  outline?: boolean;
}) {
  return (
    <span
      className="kd-badge"
      style={outline ? { borderColor: fg, color: fg } : { background: bg, color: fg }}
    >
      {children}
    </span>
  );
}

export function GenderBadge({ genre }: { genre: string }) {
  const g = GENDER_STYLE[genre] || GENDER_STYLE["Mixte / non précisé"];
  return (
    <Badge bg={g.bg} fg={g.fg}>
      <span aria-hidden="true" style={{ marginRight: 4, fontWeight: 700 }}>{g.symbol}</span>
      {g.label}
    </Badge>
  );
}
