import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { GerberaFlower } from "./GerberaFlower";
import { TulipFlower } from "./TulipFlower";
import { LilyFlower } from "./LilyFlower";
import { RoseFlower } from "./RoseFlower";
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

type VarietyKey = "gerbera" | "tulip" | "lily" | "rose";

type Variety = {
  key: VarietyKey;
  label: string;
  z: number;
  topY: number;
};

const VARIETIES: Variety[] = [
  { key: "gerbera", label: "ガーベラ", z: -6.5, topY: 2.2 },
  { key: "tulip", label: "チューリップ", z: -2.2, topY: 2.2 },
  { key: "lily", label: "ユリ", z: 2.2, topY: 2.5 },
  { key: "rose", label: "バラ", z: 6.5, topY: 2.1 },
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
  }
}

export function FlowerGalleryScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 8, 14], fov: 50 }}
      style={{ background: "#d9ecff" }}
    >
      {/* ライト */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[10, 16, 10]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
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

      {/* グリッド：品種 × ステージ */}
      {VARIETIES.map((v) =>
        STAGES.map((stage, i) => {
          const x =
            (i - (STAGES.length - 1) / 2) * STAGE_SPACING;
          return (
            <group key={`${v.key}-${stage}`}>
              <FlowerFor
                variety={v.key}
                stage={stage}
                position={[x, 0, v.z]}
              />
              <Html position={[x, v.topY, v.z]} center>
                <div style={stageLabelStyle}>{STAGE_LABELS[stage]}</div>
              </Html>
            </group>
          );
        }),
      )}

      {/* 品種ラベル（左端） */}
      {VARIETIES.map((v) => (
        <Html key={`row-${v.key}`} position={[-8, 1.2, v.z]} center>
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
