"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string };

const TABS: Tab[] = [
  { href: "/gallery", label: "花図鑑" },
  { href: "/evolution", label: "進化" },
  { href: "/collection", label: "コレクション" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="app-nav">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`app-nav-link${active ? " is-active" : ""}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
