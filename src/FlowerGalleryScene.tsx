"use client";

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { GerberaFlower } from "./GerberaFlower";
import { TulipFlower } from "./TulipFlower";
import { LilyFlower } from "./LilyFlower";
import { RoseFlower } from "./RoseFlower";
import { CherryFlower } from "./CherryFlower";
import { FlowerPot, POT_TOP_Y } from "./FlowerPot";
import type { FlowerStage } from "./GerberaFlower";

const STAGES: FlowerStage[] = [1, 2, 3, 4, 5];
const STAGE_LABELS: Record<FlowerStage, string> = {
  1: "蕾",
  2: "ほころび",
  3: "満開",
  4: "豪華",
  5: "特別",
};

const STAGE_SPACING = 2.6;
const ROW_SPACING = 3.5;

type VarietyKey = "gerbera" | "tulip" | "lily" | "rose" | "cherry";

type Variety = {
  key: VarietyKey;
  label: string;
  z: number;
  /** ラベルを花の上に置く高さ（茎根本基準）。植木鉢のオフセットは描画時に加算する */
  topY: number;
  /** 鉢の色（品種で変えると図鑑感が出る） */
  potBody?: string;
  potRim?: string;
};

const VARIETIES: Variety[] = [
  {
    key: "gerbera",
    label: "ガーベラ",
    z: -ROW_SPACING * 2,
    topY: 2.2,
    potBody: "#c25a3a",
    potRim: "#a0432a",
  },
  {
    key: "tulip",
    label: "チューリップ",
    z: -ROW_SPACING,
    topY: 2.2,
    potBody: "#d8d2c5",
    potRim: "#bcb5a4",
  },
  {
    key: "lily",
    label: "ユリ",
    z: 0,
    topY: 2.5,
    potBody: "#5a7280",
    potRim: "#445864",
  },
  {
    key: "rose",
    label: "バラ",
    z: ROW_SPACING,
    topY: 2.1,
    potBody: "#5b3a2c",
    potRim: "#46291f",
  },
  {
    key: "cherry",
    label: "サクラ",
    z: ROW_SPACING * 2,
    topY: 2.0,
    potBody: "#e8b8c4",
    potRim: "#c89aa8",
  },
];

const stageLabelStyle: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: 13,
  fontWeight: 600,
  whiteSpace: "nowrap",
  padding: "2px 9px",
  background: "rgba(255,255,255,0.82)",
  borderRadius: 6,
  pointerEvents: "none",
  fontFamily: "system-ui, sans-serif",
};

const rowLabelStyle: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: 17,
  fontWeight: 700,
  whiteSpace: "nowrap",
  padding: "4px 14px",
  background: "rgba(255,255,255,0.9)",
  borderRadius: 8,
  pointerEvents: "none",
  fontFamily: "system-ui, sans-serif",
};

function FlowerFor({
  variety,
  stage,
  position,
}: {
  variety: VarietyKey;
  stage: FlowerStage;
  position: [number, number, number];
}) {
  switch (variety) {
    case "gerbera":
      return <GerberaFlower stage={stage} position={position} />;
    case "tulip":
      return <TulipFlower stage={stage} position={position} />;
    case "lily":
      return <LilyFlower stage={stage} position={position} />;
    case "rose":
      return <RoseFlower stage={stage} position={position} />;
    case "cherry":
      return <CherryFlower stage={stage} position={position} />;
  }
}

export function FlowerGalleryScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, 17], fov: 50 }}
      style={{ background: "#d9ecff" }}
    >
      {/* ライト */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[10, 18, 10]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      <directionalLight
        position={[-6, 8, -6]}
        intensity={0.35}
        color="#e0ecff"
      />

      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#8fc475" roughness={1} />
      </mesh>

      {/* グリッド：品種 × ステージ。各セルは植木鉢 + 花 + ステージラベル */}
      {VARIETIES.map((v) =>
        STAGES.map((stage, i) => {
          const x = (i - (STAGES.length - 1) / 2) * STAGE_SPACING;
          return (
            <group key={`${v.key}-${stage}`}>
              <FlowerPot
                position={[x, 0, v.z]}
                bodyColor={v.potBody}
                rimColor={v.potRim}
              />
              <FlowerFor
                variety={v.key}
                stage={stage}
                position={[x, POT_TOP_Y, v.z]}
              />
              <Html position={[x, v.topY + POT_TOP_Y, v.z]} center>
                <div style={stageLabelStyle}>{STAGE_LABELS[stage]}</div>
              </Html>
            </group>
          );
        }),
      )}

      {/* 品種ラベル（左端） */}
      {VARIETIES.map((v) => (
        <Html key={`row-${v.key}`} position={[-8.5, 1.2, v.z]} center>
          <div style={rowLabelStyle}>{v.label}</div>
        </Html>
      ))}

      <OrbitControls target={[0, 1.5, 0]} />

      {/* 特別ステージの発光をほのかに強調 */}
      <EffectComposer>
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.8}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
