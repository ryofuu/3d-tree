import { useMemo } from "react";
import { DoubleSide } from "three";
import { swordLeaf, tulipPetal } from "./petalLibrary";
import type { FlowerStage } from "./GerberaFlower";

const petalExtrude = {
  depth: 0.025,
  bevelEnabled: true,
  bevelSegments: 2,
  steps: 1,
  bevelSize: 0.012,
  bevelThickness: 0.008,
};

const leafExtrude = {
  depth: 0.012,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.006,
  bevelThickness: 0.004,
};

const TULIP_RED = "#d83048";
const TULIP_RED_DEEP = "#b02038";
const TULIP_RED_LIGHT = "#f26b7f";

/** 6枚の花びらを角度 angle で配置する共通ヘルパー */
function PetalRing({
  count,
  shape,
  tilt,
  tiltZ = 0,
  yOffset = 0,
  color,
  emissive,
  emissiveIntensity = 0,
  angleOffset = 0,
}: {
  count: number;
  shape: import("three").Shape;
  tilt: number;
  tiltZ?: number;
  yOffset?: number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  angleOffset?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + angleOffset;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              position={[0, yOffset, 0]}
              rotation={[tilt, 0, tiltZ]}
              castShadow
            >
              <extrudeGeometry args={[shape, petalExtrude]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive ?? "#000000"}
                emissiveIntensity={emissiveIntensity}
                roughness={0.4}
                side={DoubleSide}
                toneMapped={emissiveIntensity > 0.5 ? false : true}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/** ステージ1：固く閉じた縦長つぼみ */
function Bud() {
  return (
    <group>
      {/* 花びらが閉じて見える外形 */}
      <mesh position={[0, 0.22, 0]} scale={[0.7, 1.4, 0.7]} castShadow>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial color={TULIP_RED_DEEP} roughness={0.5} />
      </mesh>
      {/* 6枚の閉じた花びらを示す縦の溝（細長い楕円を6枚外に貼る） */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              position={[0.07, 0.22, 0]}
              scale={[0.3, 1.5, 0.3]}
              rotation={[0, 0, -0.05]}
              castShadow
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color={TULIP_RED} roughness={0.5} />
            </mesh>
          </group>
        );
      })}
      {/* 先端の尖り */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <coneGeometry args={[0.04, 0.08, 12]} />
        <meshStandardMaterial color={TULIP_RED_DEEP} roughness={0.5} />
      </mesh>
    </group>
  );
}

/** ステージ2：先端が少し割れて、花びら同士の隙間から色が覗く */
function Opening() {
  const petal = useMemo(() => tulipPetal(0.45, 0.13), []);
  return (
    <group>
      {/* ほんのり開いた6枚 */}
      <PetalRing
        count={6}
        shape={petal}
        tilt={-Math.PI / 2 + 0.05}
        color={TULIP_RED}
      />
      {/* 中央の暗い芯 */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#4a1020" roughness={0.7} />
      </mesh>
    </group>
  );
}

/** ステージ3：満開。カップ型にやや開いた6枚 + 6本のおしべ */
function Bloom() {
  const petal = useMemo(() => tulipPetal(0.55, 0.18), []);
  return (
    <group>
      <PetalRing
        count={6}
        shape={petal}
        tilt={-Math.PI / 2 + 0.25}
        color={TULIP_RED}
      />
      {/* めしべ（中央の柱） */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, 0.22, 10]} />
        <meshStandardMaterial color="#f8d080" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow>
        <sphereGeometry args={[0.03, 14, 14]} />
        <meshStandardMaterial color="#e8c060" roughness={0.6} />
      </mesh>
      {/* 6本のおしべ */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const r = 0.05;
        return (
          <group key={i}>
            <mesh
              position={[
                Math.cos(angle) * r,
                0.18,
                Math.sin(angle) * r,
              ]}
              castShadow
            >
              <cylinderGeometry args={[0.008, 0.008, 0.2, 6]} />
              <meshStandardMaterial color="#f8d080" roughness={0.6} />
            </mesh>
            {/* 葯（やく） */}
            <mesh
              position={[
                Math.cos(angle) * r,
                0.28,
                Math.sin(angle) * r,
              ]}
              rotation={[0, angle, 0]}
              scale={[0.6, 1.8, 0.6]}
              castShadow
            >
              <sphereGeometry args={[0.02, 10, 10]} />
              <meshStandardMaterial color="#3a2010" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** ステージ4：豪華。外 6 枚 + 内 6 枚の二重。ほとんど星形に開く */
function Rich() {
  const outer = useMemo(() => tulipPetal(0.62, 0.2), []);
  const inner = useMemo(() => tulipPetal(0.48, 0.16), []);
  return (
    <group>
      {/* 外側：もっと水平に倒す */}
      <PetalRing
        count={6}
        shape={outer}
        tilt={-Math.PI / 2 + 0.55}
        color={TULIP_RED}
      />
      {/* 内側：ずらして立たせる */}
      <PetalRing
        count={6}
        shape={inner}
        tilt={-Math.PI / 2 + 0.15}
        yOffset={0.03}
        color={TULIP_RED_LIGHT}
        angleOffset={Math.PI / 6}
      />
      {/* 花芯 */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <sphereGeometry args={[0.06, 20, 20]} />
        <meshStandardMaterial color="#f8c860" roughness={0.65} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const r = 0.05;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * r,
              0.17,
              Math.sin(angle) * r,
            ]}
            castShadow
          >
            <cylinderGeometry args={[0.008, 0.008, 0.22, 6]} />
            <meshStandardMaterial color="#f8d080" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

/** ステージ5：特別。三重花びら + 発光縁 + 金色の芯 + 装飾ドット */
function Spectacular() {
  const outer = useMemo(() => tulipPetal(0.7, 0.22), []);
  const mid = useMemo(() => tulipPetal(0.55, 0.18), []);
  const inner = useMemo(() => tulipPetal(0.38, 0.13), []);
  return (
    <group>
      {/* 三重の花びら */}
      <PetalRing
        count={6}
        shape={outer}
        tilt={-Math.PI / 2 + 0.7}
        color={TULIP_RED}
        emissive={TULIP_RED}
        emissiveIntensity={0.35}
      />
      <PetalRing
        count={6}
        shape={mid}
        tilt={-Math.PI / 2 + 0.4}
        yOffset={0.05}
        color={TULIP_RED_LIGHT}
        emissive={TULIP_RED_LIGHT}
        emissiveIntensity={0.3}
        angleOffset={Math.PI / 6}
      />
      <PetalRing
        count={6}
        shape={inner}
        tilt={-Math.PI / 2 + 0.1}
        yOffset={0.12}
        color="#ffb0c0"
        emissive="#ffb0c0"
        emissiveIntensity={0.4}
      />
      {/* 発光花芯 */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshStandardMaterial
          color="#ffd060"
          emissive="#ffaa30"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      {/* おしべ */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const r = 0.06;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * r,
              0.18,
              Math.sin(angle) * r,
            ]}
          >
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffd080"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>
        );
      })}
      {/* 装飾ドット：花びら先端を囲むリング */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const r = 0.55;
        const h = 0.3 + Math.sin(angle * 6) * 0.05;
        return (
          <mesh
            key={`deco-${i}`}
            position={[Math.cos(angle) * r, h, Math.sin(angle) * r]}
          >
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffe8a0"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** チューリップ特有の、茎を抱くような2枚の長い葉 */
function WrapLeaves() {
  const leaf = useMemo(() => swordLeaf(1.1, 0.11), []);
  return (
    <>
      {[0, Math.PI].map((angle, i) => (
        <group key={i} position={[0, 0.1, 0]} rotation={[0, angle, 0]}>
          <mesh
            rotation={[-Math.PI / 2 + 0.25, 0, -0.15]}
            position={[0.03, 0, 0.02]}
            castShadow
          >
            <extrudeGeometry args={[leaf, leafExtrude]} />
            <meshStandardMaterial
              color="#4a8c3a"
              roughness={0.65}
              side={DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

type TulipProps = {
  stage: FlowerStage;
  position?: [number, number, number];
};

const STEM_HEIGHT = 1.6;
const STEM_RADIUS = 0.028;

export function TulipFlower({ stage, position = [0, 0, 0] }: TulipProps) {
  return (
    <group position={position}>
      <WrapLeaves />
      {/* 茎（太めで真っすぐ） */}
      <mesh position={[0, STEM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[STEM_RADIUS * 0.85, STEM_RADIUS, STEM_HEIGHT, 16]}
        />
        <meshStandardMaterial color="#4a8c3a" roughness={0.6} />
      </mesh>
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
