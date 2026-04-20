"use client";

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { CherryFlower } from "./CherryFlower";
import { TulipFlower } from "./TulipFlower";
import { GerberaFlower } from "./GerberaFlower";
import { LilyFlower } from "./LilyFlower";
import { RoseFlower } from "./RoseFlower";
import { FlowerPot, POT_TOP_Y } from "./FlowerPot";
import type { FlowerStage } from "./GerberaFlower";

type Variety = "cherry" | "tulip" | "gerbera" | "lily" | "rose";

type CollectionItem = {
  key: Variety;
  label: string;
  potBody: string;
  potRim: string;
};

const COLLECTION: CollectionItem[] = [
  { key: "cherry", label: "サクラ", potBody: "#e8b8c4", potRim: "#c89aa8" },
  {
    key: "tulip",
    label: "チューリップ",
    potBody: "#d8d2c5",
    potRim: "#bcb5a4",
  },
  { key: "gerbera", label: "ガーベラ", potBody: "#c25a3a", potRim: "#a0432a" },
  { key: "lily", label: "ユリ", potBody: "#5a7280", potRim: "#445864" },
  { key: "rose", label: "バラ", potBody: "#5b3a2c", potRim: "#46291f" },
];

const SLOT_SPACING = 1.6;
const SHELF_Y = 0;
const SHELF_DEPTH = 1.2;
const SHELF_BACK_Z = -0.7;

function FlowerByVariety({
  variety,
  stage,
}: {
  variety: Variety;
  stage: FlowerStage;
}) {
  switch (variety) {
    case "cherry":
      return <CherryFlower stage={stage} />;
    case "tulip":
      return <TulipFlower stage={stage} />;
    case "gerbera":
      return <GerberaFlower stage={stage} />;
    case "lily":
      return <LilyFlower stage={stage} />;
    case "rose":
      return <RoseFlower stage={stage} />;
  }
}

function Shelf({ width }: { width: number }) {
  const woodDark = "#6b4525";
  const woodMid = "#8a5a36";
  const woodBack = "#d9c6a6";
  return (
    <group>
      {/* 背板 */}
      <mesh position={[0, 1.6, SHELF_BACK_Z - 0.08]} receiveShadow>
        <boxGeometry args={[width, 3.4, 0.12]} />
        <meshStandardMaterial color={woodBack} roughness={0.95} />
      </mesh>
      {/* 天板 */}
      <mesh
        position={[0, 3.15, SHELF_BACK_Z + SHELF_DEPTH / 2 - 0.1]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width + 0.3, 0.15, SHELF_DEPTH + 0.2]} />
        <meshStandardMaterial color={woodDark} roughness={0.8} />
      </mesh>
      {/* 棚板 */}
      <mesh
        position={[0, SHELF_Y, SHELF_BACK_Z + SHELF_DEPTH / 2 - 0.1]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, 0.18, SHELF_DEPTH]} />
        <meshStandardMaterial color={woodMid} roughness={0.75} />
      </mesh>
      {/* 側板（左右） */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * (width / 2 + 0.07), 1.6, SHELF_BACK_Z + 0.15]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.15, 3.4, SHELF_DEPTH - 0.3]} />
          <meshStandardMaterial color={woodDark} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

const slotLabelStyle: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
  padding: "2px 8px",
  background: "rgba(255,255,255,0.85)",
  borderRadius: 5,
  pointerEvents: "none",
  fontFamily: "system-ui, sans-serif",
};

function ShelfSlot({
  item,
  x,
  onSelect,
}: {
  item: CollectionItem;
  x: number;
  onSelect: () => void;
}) {
  const [hover, setHover] = useState(false);
  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(true);
    document.body.style.cursor = "pointer";
  };
  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(false);
    document.body.style.cursor = "auto";
  };
  return (
    <group
      position={[x, SHELF_Y + 0.09, SHELF_BACK_Z + SHELF_DEPTH / 2 - 0.1]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <group scale={hover ? 1.06 : 1}>
        <FlowerPot
          position={[0, 0, 0]}
          bodyColor={item.potBody}
          rimColor={item.potRim}
        />
        <group position={[0, POT_TOP_Y, 0]}>
          <FlowerByVariety variety={item.key} stage={5} />
        </group>
      </group>
      <Html position={[0, -0.35, 0.4]} center>
        <div style={slotLabelStyle}>{item.label}</div>
      </Html>
    </group>
  );
}

function ShelfView({ onSelect }: { onSelect: (v: Variety) => void }) {
  const width = SLOT_SPACING * COLLECTION.length + 0.4;
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2.2, 6.5], fov: 50 }}
      style={{ background: "linear-gradient(180deg,#241d36 0%,#3e2f5a 100%)" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[5, 10, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-4, 6, -3]}
        intensity={0.3}
        color="#b0c4ff"
      />

      {/* 床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[8, 48]} />
        <meshStandardMaterial color="#2d2650" roughness={0.95} />
      </mesh>

      <Shelf width={width} />

      {COLLECTION.map((item, i) => {
        const x = (i - (COLLECTION.length - 1) / 2) * SLOT_SPACING;
        return (
          <ShelfSlot
            key={item.key}
            item={item}
            x={x}
            onSelect={() => onSelect(item.key)}
          />
        );
      })}

      <OrbitControls
        target={[0, 1.2, 0]}
        enablePan={false}
        minDistance={3.5}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />

      <EffectComposer>
        <Bloom
          intensity={0.45}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.8}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}

const backButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: 16,
  left: 16,
  padding: "8px 14px",
  background: "rgba(15,15,25,0.82)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.25)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  zIndex: 10,
};

const detailLabelStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 24,
  left: "50%",
  transform: "translateX(-50%)",
  padding: "8px 20px",
  background: "rgba(15,15,25,0.78)",
  color: "#fff",
  borderRadius: 20,
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: "0.08em",
  fontFamily: "system-ui, sans-serif",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  border: "1px solid rgba(255,255,255,0.15)",
  zIndex: 10,
  pointerEvents: "none",
};

function DetailView({
  variety,
  onBack,
}: {
  variety: Variety;
  onBack: () => void;
}) {
  const item = COLLECTION.find((c) => c.key === variety);
  if (!item) return null;
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.8, 4], fov: 45 }}
        style={{
          background: "linear-gradient(180deg,#1a1830 0%,#3a2f5a 100%)",
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[-4, 4, -3]}
          intensity={0.3}
          color="#b0c4ff"
        />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[5, 48]} />
          <meshStandardMaterial color="#2d2650" roughness={0.9} />
        </mesh>

        <FlowerPot bodyColor={item.potBody} rimColor={item.potRim} />
        <group position={[0, POT_TOP_Y, 0]}>
          <FlowerByVariety variety={variety} stage={5} />
        </group>

        <OrbitControls
          target={[0, POT_TOP_Y + 1, 0]}
          enablePan={false}
          minDistance={2}
          maxDistance={7}
          autoRotate
          autoRotateSpeed={0.6}
        />

        <EffectComposer>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.7}
            luminanceSmoothing={0.8}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      <button style={backButtonStyle} onClick={onBack}>
        ← 棚に戻る
      </button>
      <div style={detailLabelStyle}>{item.label}</div>
    </div>
  );
}

export function CollectionScene() {
  const [selected, setSelected] = useState<Variety | null>(null);
  if (selected) {
    return <DetailView variety={selected} onBack={() => setSelected(null)} />;
  }
  return <ShelfView onSelect={setSelected} />;
}
