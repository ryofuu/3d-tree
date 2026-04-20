import { useState } from "react";
import { FlowerGalleryScene } from "./FlowerGalleryScene";
import { EvolutionScene } from "./EvolutionScene";
import { CollectionScene } from "./CollectionScene";

type TabKey = "gallery" | "evolution" | "collection";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "gallery", label: "花図鑑" },
  { key: "evolution", label: "進化" },
  { key: "collection", label: "コレクション" },
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
};

const btnBase: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "transparent",
  color: "rgba(255,255,255,0.7)",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
};

const btnActive: React.CSSProperties = {
  ...btnBase,
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  borderColor: "rgba(255,255,255,0.35)",
};

const canvasContainerStyle: React.CSSProperties = {
  position: "fixed",
  top: 52,
  left: 0,
  right: 0,
  bottom: 0,
};

export function App() {
  const [tab, setTab] = useState<TabKey>("gallery");
  return (
    <>
      <nav style={navStyle}>
        {TABS.map((t) => (
          <button
            key={t.key}
            style={tab === t.key ? btnActive : btnBase}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div style={canvasContainerStyle}>
        {tab === "gallery" && <FlowerGalleryScene />}
        {tab === "evolution" && <EvolutionScene />}
        {tab === "collection" && <CollectionScene />}
      </div>
    </>
  );
}
