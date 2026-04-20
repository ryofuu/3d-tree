import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Tree } from "./Tree";
import { CuteTree } from "./CuteTree";
import { Flower } from "./Flower";
import { STAGES, STAGE_ORDER } from "./stages";
import { CUTE_STAGES } from "./cuteStages";
import { FLOWER_STAGES, FLOWER_STAGE_ORDER } from "./flowerStages";

const SPACING = 4;
const FLOWER_SPACING = 2.6;
const ROW_Z = {
  tree: -5,
  cute: 0,
  flower: 5,
};

const stageLabelStyle: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: "nowrap",
  padding: "2px 10px",
  background: "rgba(255,255,255,0.8)",
  borderRadius: 6,
  pointerEvents: "none",
  fontFamily: "system-ui, sans-serif",
};

const rowLabelStyle: React.CSSProperties = {
  color: "#1a1a1a",
  fontSize: 18,
  fontWeight: 700,
  whiteSpace: "nowrap",
  padding: "4px 14px",
  background: "rgba(255,255,255,0.9)",
  borderRadius: 8,
  pointerEvents: "none",
  fontFamily: "system-ui, sans-serif",
};

function TreeStageRow({
  variant,
  z,
}: {
  variant: "normal" | "cute";
  z: number;
}) {
  const seedBase = variant === "normal" ? 1 : 100;
  return (
    <>
      {STAGE_ORDER.map((stage, i) => {
        const x = (i - (STAGE_ORDER.length - 1) / 2) * SPACING;
        const cfg = variant === "normal" ? STAGES[stage] : CUTE_STAGES[stage];
        return (
          <group key={`${variant}-${stage}`}>
            {variant === "normal" ? (
              <Tree stage={stage} position={[x, 0, z]} seed={seedBase + i} />
            ) : (
              <CuteTree
                stage={stage}
                position={[x, 0, z]}
                seed={seedBase + i}
              />
            )}
            <Html position={[x, cfg.height + 0.6, z]} center>
              <div style={stageLabelStyle}>{cfg.label}</div>
            </Html>
          </group>
        );
      })}
    </>
  );
}

function FlowerRow({ z }: { z: number }) {
  return (
    <>
      {FLOWER_STAGE_ORDER.map((stage, i) => {
        const x = (i - (FLOWER_STAGE_ORDER.length - 1) / 2) * FLOWER_SPACING;
        const cfg = FLOWER_STAGES[stage];
        // label は花の先端よりやや上に
        const labelY = Math.max(0.7, cfg.stemHeight + 0.6);
        return (
          <group key={`flower-${stage}`}>
            <Flower stage={stage} position={[x, 0, z]} />
            <Html position={[x, labelY, z]} center>
              <div style={stageLabelStyle}>{cfg.label}</div>
            </Html>
          </group>
        );
      })}
    </>
  );
}

export function GardenScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 11, 22], fov: 50 }}
      style={{ background: "#cfe8ff" }}
    >
      {/* ライト */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 18, 12]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#7ab86b" roughness={1} />
      </mesh>

      <TreeStageRow variant="normal" z={ROW_Z.tree} />
      <TreeStageRow variant="cute" z={ROW_Z.cute} />
      <FlowerRow z={ROW_Z.flower} />

      {/* 列ラベル */}
      <Html position={[-14, 1.5, ROW_Z.tree]} center>
        <div style={rowLabelStyle}>ノーマル</div>
      </Html>
      <Html position={[-14, 1.5, ROW_Z.cute]} center>
        <div style={rowLabelStyle}>かわいい</div>
      </Html>
      <Html position={[-14, 1.5, ROW_Z.flower]} center>
        <div style={rowLabelStyle}>花</div>
      </Html>

      <OrbitControls target={[0, 2, 0]} />
    </Canvas>
  );
}
