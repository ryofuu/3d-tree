import { useMemo } from "react";
import { DoubleSide } from "three";
import { gerberaPetal, ovateLeaf } from "./petalLibrary";
import { Stamens } from "./Stamens";

export type FlowerStage = 1 | 2 | 3 | 4 | 5;

const petalExtrude = {
  depth: 0.018,
  bevelEnabled: true,
  bevelSegments: 2,
  steps: 1,
  bevelSize: 0.008,
  bevelThickness: 0.006,
};

const leafExtrude = {
  depth: 0.01,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.006,
  bevelThickness: 0.004,
};

const GERBERA_PINK = "#ff5a8d";
const GERBERA_PINK_DEEP = "#e44685";
const GERBERA_PINK_LIGHT = "#ff8db5";
const GERBERA_YELLOW_CENTER = "#f4b400";
const GERBERA_YELLOW_INNER = "#c78a00";

/** 5枚の萼がつぼみを包む */
function Sepals({ openAngle = 0 }: { openAngle?: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh
              position={[0.055, 0.07, 0]}
              rotation={[0, 0, -0.6 - openAngle]}
              scale={[0.45, 1, 0.45]}
              castShadow
            >
              <coneGeometry args={[0.035, 0.17, 8]} />
              <meshStandardMaterial color="#4a8c3a" roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/** ステージ1：つぼみ。縦長の塊 + 先端 + 萼 */
function Bud() {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} scale={[0.75, 1.3, 0.75]} castShadow>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial color={GERBERA_PINK_DEEP} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.26, 0]} castShadow>
        <coneGeometry args={[0.04, 0.06, 10]} />
        <meshStandardMaterial color="#c43a7a" roughness={0.55} />
      </mesh>
      <Sepals />
    </group>
  );
}

/** ステージ2：ほころび。つぼみの上から6枚の花びらが覗く */
function Opening() {
  const petal = useMemo(() => gerberaPetal(0.26, 0.09), []);
  return (
    <group>
      <mesh position={[0, 0.11, 0]} scale={[0.8, 1.1, 0.8]} castShadow>
        <sphereGeometry args={[0.1, 22, 22]} />
        <meshStandardMaterial color={GERBERA_PINK_DEEP} roughness={0.55} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              position={[0, 0.22, 0.015]}
              rotation={[-Math.PI / 2 + 0.95, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[petal, petalExtrude]} />
              <meshStandardMaterial
                color={GERBERA_PINK}
                roughness={0.45}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      <Sepals openAngle={0.2} />
    </group>
  );
}

/** ステージ3：満開。16枚の花びら + 黄色い花芯 + おしべ */
function Bloom() {
  const petal = useMemo(() => gerberaPetal(0.55, 0.14), []);
  const N = 16;
  return (
    <group>
      {Array.from({ length: N }).map((_, i) => {
        const angle = (i / N) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              rotation={[-Math.PI / 2 + 0.22, 0, 0]}
              position={[0, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[petal, petalExtrude]} />
              <meshStandardMaterial
                color={GERBERA_PINK}
                roughness={0.45}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {/* 花芯ドーム */}
      <mesh position={[0, 0.015, 0]} castShadow>
        <sphereGeometry
          args={[0.19, 28, 28, 0, Math.PI * 2, 0, Math.PI / 2.2]}
        />
        <meshStandardMaterial color={GERBERA_YELLOW_CENTER} roughness={0.7} />
      </mesh>
      {/* 花芯中央の濃い輪 */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <sphereGeometry
          args={[0.09, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2.2]}
        />
        <meshStandardMaterial color={GERBERA_YELLOW_INNER} roughness={0.7} />
      </mesh>
      <Stamens
        count={55}
        centerR={0.19}
        color="#8a5020"
        colorAlt="#c07830"
        tipSize={0.012}
        seed={11}
      />
    </group>
  );
}

/** ステージ4：豪華。外16 + 内12 の二重花びら。花芯ドームが大きく、おしべも多い */
function Rich() {
  const outer = useMemo(() => gerberaPetal(0.6, 0.145), []);
  const inner = useMemo(() => gerberaPetal(0.42, 0.105), []);
  return (
    <group>
      {/* 外周 */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        return (
          <group key={`o-${i}`} rotation={[0, angle, 0]}>
            <mesh
              rotation={[-Math.PI / 2 + 0.18, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[outer, petalExtrude]} />
              <meshStandardMaterial
                color={GERBERA_PINK}
                roughness={0.45}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {/* 内周：半ステップずらし、やや持ち上げる */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 + Math.PI / 12;
        return (
          <group key={`i-${i}`} rotation={[0, angle, 0]}>
            <mesh
              position={[0, 0.05, 0]}
              rotation={[-Math.PI / 2 + 0.5, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[inner, petalExtrude]} />
              <meshStandardMaterial
                color={GERBERA_PINK_LIGHT}
                roughness={0.4}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.03, 0]} castShadow>
        <sphereGeometry
          args={[0.21, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]}
        />
        <meshStandardMaterial color={GERBERA_YELLOW_CENTER} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.035, 0]} castShadow>
        <sphereGeometry
          args={[0.1, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2.2]}
        />
        <meshStandardMaterial color={GERBERA_YELLOW_INNER} roughness={0.7} />
      </mesh>
      <Stamens
        count={75}
        centerR={0.21}
        color="#8a5020"
        colorAlt="#d08030"
        tipSize={0.013}
        seed={13}
      />
    </group>
  );
}

/** ステージ5：特別。三重花びら + 発光花芯 + 浮遊の小花びら */
function Spectacular() {
  const outer = useMemo(() => gerberaPetal(0.66, 0.15), []);
  const mid = useMemo(() => gerberaPetal(0.5, 0.12), []);
  const inner = useMemo(() => gerberaPetal(0.34, 0.085), []);
  return (
    <group>
      {/* 外周 */}
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        return (
          <group key={`o-${i}`} rotation={[0, angle, 0]}>
            <mesh rotation={[-Math.PI / 2 + 0.1, 0, 0]} castShadow>
              <extrudeGeometry args={[outer, petalExtrude]} />
              <meshStandardMaterial
                color={GERBERA_PINK}
                emissive={GERBERA_PINK}
                emissiveIntensity={0.25}
                roughness={0.35}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {/* 中周 */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2 + Math.PI / 14;
        return (
          <group key={`m-${i}`} rotation={[0, angle, 0]}>
            <mesh
              position={[0, 0.04, 0]}
              rotation={[-Math.PI / 2 + 0.35, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[mid, petalExtrude]} />
              <meshStandardMaterial
                color={GERBERA_PINK_LIGHT}
                emissive={GERBERA_PINK_LIGHT}
                emissiveIntensity={0.2}
                roughness={0.35}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {/* 内周 */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2 + Math.PI / 20;
        return (
          <group key={`i-${i}`} rotation={[0, angle, 0]}>
            <mesh
              position={[0, 0.08, 0]}
              rotation={[-Math.PI / 2 + 0.7, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[inner, petalExtrude]} />
              <meshStandardMaterial
                color="#ffd0e0"
                emissive="#ffa8c8"
                emissiveIntensity={0.3}
                roughness={0.35}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {/* 発光花芯 */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <sphereGeometry
          args={[0.22, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]}
        />
        <meshStandardMaterial
          color="#ffc800"
          emissive="#ffaa00"
          emissiveIntensity={1.2}
          roughness={0.5}
          toneMapped={false}
        />
      </mesh>
      <Stamens
        count={90}
        centerR={0.22}
        color="#b06020"
        colorAlt="#ffaa50"
        tipSize={0.015}
        seed={17}
      />
      {/* 装飾リング：花芯の周りに小さな発光ドット */}
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const r = 0.28;
        return (
          <mesh
            key={`deco-${i}`}
            position={[Math.cos(angle) * r, 0.06, Math.sin(angle) * r]}
          >
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffd060"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** 基部の放射状の葉（ガーベラ特有の根生葉） */
function BasalLeaves() {
  const leaf = useMemo(() => ovateLeaf(0.42, 0.14), []);
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              rotation={[-Math.PI / 2 - 0.1, 0, 0]}
              position={[0, 0.02, 0.05]}
              castShadow
            >
              <extrudeGeometry args={[leaf, leafExtrude]} />
              <meshStandardMaterial
                color="#4a9030"
                roughness={0.65}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

type GerberaProps = {
  stage: FlowerStage;
  position?: [number, number, number];
};

const STEM_HEIGHT = 1.6;
const STEM_RADIUS = 0.02;

export function GerberaFlower({ stage, position = [0, 0, 0] }: GerberaProps) {
  return (
    <group position={position}>
      <BasalLeaves />
      {/* 茎 */}
      <mesh position={[0, STEM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[STEM_RADIUS * 0.85, STEM_RADIUS * 1.05, STEM_HEIGHT, 14]}
        />
        <meshStandardMaterial color="#558a40" roughness={0.65} />
      </mesh>
      {/* 花頭 */}
      <group position={[0, STEM_HEIGHT, 0]}>
        {stage === 1 && <Bud />}
        {stage === 2 && <Opening />}
        {stage === 3 && <Bloom />}
        {stage === 4 && <Rich />}
        {stage === 5 && <Spectacular />}
      </group>
    </group>
  );
}
