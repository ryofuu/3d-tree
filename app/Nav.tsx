"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string };

const TABS: Tab[] = [
  { href: "/gallery", label: "花図鑑" },
  { href: "/evolution", label: "進化" },
  { href: "/collection", label: "コレクション" },
];

const navStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 52,
  display: "flex",
  gap: 4,
  padding: 8,
  background: "rgba(15,15,25,0.85)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  zIndex: 100,
  fontFamily: "system-ui, sans-serif",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  boxSizing: "border-box",
  overflowX: "auto",
};

const linkBase: React.CSSProperties = {
  padding: "8px 14px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "transparent",
  color: "rgba(255,255,255,0.7)",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  lineHeight: 1,
};

const linkActive: React.CSSProperties = {
  ...linkBase,
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  borderColor: "rgba(255,255,255,0.35)",
};

export function Nav() {
  const pathname = usePathname();
  return (
    <nav style={navStyle}>
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            style={active ? linkActive : linkBase}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
