import { useMemo } from "react";
import { DoubleSide } from "three";
import { spikyPetal, swordLeaf } from "./petalLibrary";
import type { FlowerStage } from "./GerberaFlower";

const petalExtrude = {
  depth: 0.016,
  bevelEnabled: true,
  bevelSegments: 2,
  steps: 1,
  bevelSize: 0.006,
  bevelThickness: 0.004,
};

const leafExtrude = {
  depth: 0.01,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.005,
  bevelThickness: 0.003,
};

const BLACK = "#0c0609";
const CHAR = "#2a1418";
const EMBER = "#ff2a0a";
const EMBER_BRIGHT = "#ff6030";
const EMBER_DEEP = "#a80820";

/** 1 枚ぶんの黒い花弁：縁は黒、内側は赤く発光 */
function SpikyPetalMesh({
  shape,
  emissive = true,
}: {
  shape: import("three").Shape;
  emissive?: boolean;
}) {
  return (
    <mesh castShadow>
      <extrudeGeometry args={[shape, petalExtrude]} />
      <meshStandardMaterial
        color={BLACK}
        emissive={emissive ? EMBER : "#000000"}
        emissiveIntensity={emissive ? 0.45 : 0}
        roughness={0.85}
        side={DoubleSide}
      />
    </mesh>
  );
}

/** 炎のコア：中心に赤く燃える球 */
function EmberCore({
  size,
  intensity,
  y = 0,
}: {
  size: number;
  intensity: number;
  y?: number;
}) {
  return (
    <mesh position={[0, y, 0]}>
      <sphereGeometry args={[size, 20, 20]} />
      <meshStandardMaterial
        color={EMBER_DEEP}
        emissive={EMBER_BRIGHT}
        emissiveIntensity={intensity}
        toneMapped={false}
      />
    </mesh>
  );
}

/** 火の粉のパーティクル */
function Sparks({ count, radiusMin, radiusMax, yMin, yMax, seed }: {
  count: number; radiusMin: number; radiusMax: number; yMin: number; yMax: number; seed: number;
}) {
  const sparks = useMemo(() => {
    let s = seed >>> 0;
    const rand = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return Array.from({ length: count }).map(() => {
      const a = rand() * Math.PI * 2;
      const r = radiusMin + rand() * (radiusMax - radiusMin);
      return {
        x: Math.cos(a) * r,
        y: yMin + rand() * (yMax - yMin),
        z: Math.sin(a) * r,
        size: 0.012 + rand() * 0.018,
      };
    });
  }, [count, radiusMin, radiusMax, yMin, yMax, seed]);
  return (
    <>
      {sparks.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshStandardMaterial
            color="#ffd040"
            emissive="#ff8020"
            emissiveIntensity={3.5}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

/** ステージ1：黒く歪んだ蕾。縦に走る赤い亀裂 */
function Bud() {
  return (
    <group>
      <mesh position={[0, 0.15, 0]} scale={[0.8, 1.4, 0.8]} castShadow>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshStandardMaterial color={BLACK} roughness={0.9} />
      </mesh>
      {/* 4本の赤い亀裂 */}
      {Array.from({ length: 4 }).map((_, i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.08, 0.15, Math.sin(a) * 0.08]}
            rotation={[0, a, 0]}
            scale={[0.01, 0.18, 0.018]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={EMBER}
              emissive={EMBER_BRIGHT}
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
        );
      })}
      {/* 先端の尖り */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <coneGeometry args={[0.035, 0.08, 8]} />
        <meshStandardMaterial color={CHAR} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** ステージ2：亀裂から炎が漏れ、花弁の先端が覗く */
function Opening() {
  const petal = useMemo(() => spikyPetal(0.28, 0.11), []);
  return (
    <group>
      <mesh position={[0, 0.12, 0]} scale={[0.85, 1.1, 0.85]} castShadow>
        <sphereGeometry args={[0.13, 22, 22]} />
        <meshStandardMaterial color={BLACK} roughness={0.88} />
      </mesh>
      <EmberCore size={0.06} intensity={1.6} y={0.1} />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <group
              position={[0.03, 0.28, 0.01]}
              rotation={[-Math.PI / 2 + 1.1, 0, 0]}
            >
              <SpikyPetalMesh shape={petal} />
            </group>
          </group>
        );
      })}
    </group>
  );
}

/** ステージ3：尖った黒い花弁が放射。中央は燃える赤 */
function Bloom() {
  const petal = useMemo(() => spikyPetal(0.46, 0.16), []);
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <group rotation={[-Math.PI / 2 + 0.35, 0, 0]}>
              <SpikyPetalMesh shape={petal} />
            </group>
          </group>
        );
      })}
      <EmberCore size={0.1} intensity={2.2} y={0.03} />
      <Sparks count={6} radiusMin={0.08} radiusMax={0.16} yMin={0.08} yMax={0.28} seed={101} />
    </group>
  );
}

/** ステージ4：二重の黒い花弁、内側が更に赤く燃える */
function Rich() {
  const outer = useMemo(() => spikyPetal(0.52, 0.18), []);
  const inner = useMemo(() => spikyPetal(0.34, 0.13), []);
  return (
    <group>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <group key={`o-${i}`} rotation={[0, a, 0]}>
            <group rotation={[-Math.PI / 2 + 0.25, 0, 0]}>
              <SpikyPetalMesh shape={outer} />
            </group>
          </group>
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return (
          <group key={`i-${i}`} rotation={[0, a, 0]}>
            <group
              position={[0, 0.04, 0]}
              rotation={[-Math.PI / 2 + 0.6, 0, 0]}
            >
              <SpikyPetalMesh shape={inner} />
            </group>
          </group>
        );
      })}
      <EmberCore size={0.13} intensity={3} y={0.06} />
      <Sparks count={12} radiusMin={0.12} radiusMax={0.3} yMin={0.1} yMax={0.5} seed={131} />
    </group>
  );
}

/** ステージ5：地獄の業火。発光花弁・浮遊する火の粉・血の霧 */
function Spectacular() {
  const outer = useMemo(() => spikyPetal(0.6, 0.2), []);
  const mid = useMemo(() => spikyPetal(0.44, 0.16), []);
  const inner = useMemo(() => spikyPetal(0.28, 0.11), []);
  return (
    <group>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <group key={`o-${i}`} rotation={[0, a, 0]}>
            <group rotation={[-Math.PI / 2 + 0.15, 0, 0]}>
              <mesh castShadow>
                <extrudeGeometry args={[outer, petalExtrude]} />
                <meshStandardMaterial
                  color={BLACK}
                  emissive={EMBER}
                  emissiveIntensity={0.7}
                  roughness={0.8}
                  side={DoubleSide}
                  toneMapped={false}
                />
              </mesh>
            </group>
          </group>
        );
      })}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 10;
        return (
          <group key={`m-${i}`} rotation={[0, a, 0]}>
            <group
              position={[0, 0.05, 0]}
              rotation={[-Math.PI / 2 + 0.45, 0, 0]}
            >
              <mesh castShadow>
                <extrudeGeometry args={[mid, petalExtrude]} />
                <meshStandardMaterial
                  color={CHAR}
                  emissive={EMBER_BRIGHT}
                  emissiveIntensity={0.9}
                  roughness={0.75}
                  side={DoubleSide}
                  toneMapped={false}
                />
              </mesh>
            </group>
          </group>
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <group key={`i-${i}`} rotation={[0, a, 0]}>
            <group
              position={[0, 0.1, 0]}
              rotation={[-Math.PI / 2 + 0.8, 0, 0]}
            >
              <mesh castShadow>
                <extrudeGeometry args={[inner, petalExtrude]} />
                <meshStandardMaterial
                  color={EMBER_DEEP}
                  emissive={EMBER_BRIGHT}
                  emissiveIntensity={1.4}
                  roughness={0.6}
                  side={DoubleSide}
                  toneMapped={false}
                />
              </mesh>
            </group>
          </group>
        );
      })}
      <EmberCore size={0.16} intensity={4.5} y={0.1} />
      {/* 周囲の大きな火の粉 */}
      <Sparks count={28} radiusMin={0.2} radiusMax={0.65} yMin={-0.05} yMax={0.8} seed={211} />
      {/* 下方へ立ち上る煙状の黒い粒 */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.4;
        const r = 0.45 + (i % 3) * 0.08;
        return (
          <mesh
            key={`smoke-${i}`}
            position={[Math.cos(a) * r, 0.02 + (i % 4) * 0.03, Math.sin(a) * r]}
          >
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={CHAR} roughness={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

/** 茶黒い枯れた葉（茎中央に棘） */
function WitheredLeaves({ stemHeight }: { stemHeight: number }) {
  const leaf = useMemo(() => swordLeaf(0.35, 0.06), []);
  return (
    <>
      {[0.35, 0.6].map((t, idx) => {
        const y = stemHeight * t;
        const angle = idx % 2 === 0 ? 0.3 : Math.PI - 0.3;
        return (
          <group key={idx} position={[0, y, 0]} rotation={[0, angle, 0]}>
            <mesh
              rotation={[-Math.PI / 2 - 0.3, 0, -0.2]}
              position={[0.02, 0, 0.02]}
              castShadow
            >
              <extrudeGeometry args={[leaf, leafExtrude]} />
              <meshStandardMaterial
                color="#2a1a18"
                roughness={0.92}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/** 鋭く長い棘：茎にびっしり */
function Thorns({ stemHeight }: { stemHeight: number }) {
  const thorns = useMemo(() => {
    const arr: Array<{ y: number; angle: number; size: number }> = [];
    for (let i = 0; i < 14; i++) {
      arr.push({
        y: 0.1 + (i * stemHeight * 0.85) / 14,
        angle: (i * 2.1) % (Math.PI * 2),
        size: 0.04 + (i % 3) * 0.015,
      });
    }
    return arr;
  }, [stemHeight]);
  return (
    <>
      {thorns.map((t, i) => (
        <group key={i} position={[0, t.y, 0]} rotation={[0, t.angle, 0]}>
          <mesh
            position={[0.03, 0, 0]}
            rotation={[0, 0, -Math.PI / 2]}
            castShadow
          >
            <coneGeometry args={[0.009, t.size, 6]} />
            <meshStandardMaterial color={CHAR} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </>
  );
}

type Props = {
  stage: FlowerStage;
  position?: [number, number, number];
};

const STEM_HEIGHT = 1.5;
const STEM_RADIUS = 0.024;

export function BlackFlameFlower({ stage, position = [0, 0, 0] }: Props) {
  return (
    <group position={position}>
      <WitheredLeaves stemHeight={STEM_HEIGHT} />
      <Thorns stemHeight={STEM_HEIGHT} />
      <mesh position={[0, STEM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[STEM_RADIUS * 0.8, STEM_RADIUS, STEM_HEIGHT, 14]}
        />
        <meshStandardMaterial color="#1a0c10" roughness={0.9} />
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
