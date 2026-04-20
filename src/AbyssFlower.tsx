import { useMemo } from "react";
import { DoubleSide } from "three";
import { tendrilPetal, swordLeaf } from "./petalLibrary";
import type { FlowerStage } from "./GerberaFlower";

const petalExtrude = {
  depth: 0.016,
  bevelEnabled: true,
  bevelSegments: 2,
  steps: 1,
  bevelSize: 0.008,
  bevelThickness: 0.005,
};

const leafExtrude = {
  depth: 0.01,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.005,
  bevelThickness: 0.003,
};

const ABYSS_DEEP = "#0a0a2a";
const ABYSS_MID = "#1a2658";
const ABYSS_VEIL = "#2e4a9a";
const CYAN_GLOW = "#30fff0";
const MAGENTA_GLOW = "#ff30d0";

/** 1 本の触手花弁：根元から先端へ向けて発光度が上がる */
function TentaclePetal({
  shape,
  baseColor,
  tipColor,
}: {
  shape: import("three").Shape;
  baseColor: string;
  tipColor: string;
}) {
  return (
    <mesh castShadow>
      <extrudeGeometry args={[shape, petalExtrude]} />
      <meshStandardMaterial
        color={baseColor}
        emissive={tipColor}
        emissiveIntensity={0.8}
        roughness={0.55}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

/** 触手の先端を彩る発光ドット：先端に配置 */
function TentacleGlowTips({
  count,
  radius,
  tipColor,
  y = 0,
}: {
  count: number;
  radius: number;
  tipColor: string;
  y?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * radius, y, Math.sin(a) * radius]}
          >
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={tipColor}
              emissiveIntensity={3.5}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </>
  );
}

/** 渦巻きの中心：2色のグラデーションの球 */
function VortexCore({ size, intensity }: { size: number; intensity: number }) {
  return (
    <group>
      {/* 外側の渦巻きオーブ */}
      <mesh>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={ABYSS_DEEP}
          emissive={ABYSS_VEIL}
          emissiveIntensity={intensity * 0.6}
          roughness={0.4}
          toneMapped={false}
        />
      </mesh>
      {/* 内側のシアンの核 */}
      <mesh>
        <sphereGeometry args={[size * 0.55, 20, 20]} />
        <meshStandardMaterial
          color={CYAN_GLOW}
          emissive={CYAN_GLOW}
          emissiveIntensity={intensity * 2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** 浮遊する生物発光粒子 */
function BioParticles({ count, seed, radiusMin, radiusMax, yMin, yMax }: {
  count: number; seed: number; radiusMin: number; radiusMax: number; yMin: number; yMax: number;
}) {
  const parts = useMemo(() => {
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
        size: 0.01 + rand() * 0.015,
        useMagenta: rand() > 0.6,
      };
    });
  }, [count, seed, radiusMin, radiusMax, yMin, yMax]);
  return (
    <>
      {parts.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 6, 6]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={p.useMagenta ? MAGENTA_GLOW : CYAN_GLOW}
            emissiveIntensity={2.8}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

/** ステージ1：暗い青の丸い塊、表面に渦模様（縦の帯）*/
function Bud() {
  return (
    <group>
      <mesh position={[0, 0.13, 0]} scale={[1, 1.1, 1]} castShadow>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color={ABYSS_DEEP} roughness={0.55} />
      </mesh>
      {/* 表面の渦：斜めに巻きついた帯 */}
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.1, 0.13, Math.sin(a) * 0.1]}
            rotation={[0, a, 0.6]}
            scale={[0.008, 0.22, 0.012]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={CYAN_GLOW}
              emissive={CYAN_GLOW}
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** ステージ2：4本の触手が覗く */
function Opening() {
  const petal = useMemo(() => tendrilPetal(0.28, 0.08), []);
  return (
    <group>
      <mesh position={[0, 0.12, 0]} scale={[0.95, 1, 0.95]} castShadow>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial
          color={ABYSS_DEEP}
          emissive={ABYSS_VEIL}
          emissiveIntensity={0.3}
          roughness={0.5}
        />
      </mesh>
      {Array.from({ length: 4 }).map((_, i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <group
              position={[0.03, 0.3, 0.01]}
              rotation={[-Math.PI / 2 + 1.0, 0, 0]}
            >
              <TentaclePetal shape={petal} baseColor={ABYSS_MID} tipColor={CYAN_GLOW} />
            </group>
          </group>
        );
      })}
      {/* 先端の発光 */}
      {Array.from({ length: 4 }).map((_, i) => {
        const a = (i / 4) * Math.PI * 2;
        const r = 0.18;
        return (
          <mesh key={`t-${i}`} position={[Math.cos(a) * r, 0.35, Math.sin(a) * r]}>
            <sphereGeometry args={[0.02, 10, 10]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={CYAN_GLOW}
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** ステージ3：8本の触手花弁、中央の渦 */
function Bloom() {
  const petal = useMemo(() => tendrilPetal(0.54, 0.12), []);
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const t = -Math.PI / 2 + 0.25 + Math.sin(i * 1.3) * 0.15;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <group rotation={[t, 0, 0]}>
              <TentaclePetal shape={petal} baseColor={ABYSS_MID} tipColor={CYAN_GLOW} />
            </group>
          </group>
        );
      })}
      <group position={[0, 0.05, 0]}>
        <VortexCore size={0.11} intensity={1.4} />
      </group>
      <TentacleGlowTips count={8} radius={0.38} tipColor={CYAN_GLOW} y={0.05} />
    </group>
  );
}

/** ステージ4：触手 12 本 + 内側に小触手 8 本、発光強 */
function Rich() {
  const outer = useMemo(() => tendrilPetal(0.6, 0.14), []);
  const inner = useMemo(() => tendrilPetal(0.36, 0.1), []);
  return (
    <group>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const t = -Math.PI / 2 + 0.15 + Math.sin(i * 1.1) * 0.2;
        return (
          <group key={`o-${i}`} rotation={[0, a, 0]}>
            <group rotation={[t, 0, 0]}>
              <TentaclePetal shape={outer} baseColor={ABYSS_MID} tipColor={CYAN_GLOW} />
            </group>
          </group>
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const t = -Math.PI / 2 + 0.55 + Math.cos(i * 1.4) * 0.12;
        return (
          <group key={`i-${i}`} rotation={[0, a, 0]}>
            <group position={[0, 0.05, 0]} rotation={[t, 0, 0]}>
              <TentaclePetal shape={inner} baseColor={ABYSS_VEIL} tipColor={MAGENTA_GLOW} />
            </group>
          </group>
        );
      })}
      <group position={[0, 0.08, 0]}>
        <VortexCore size={0.14} intensity={2} />
      </group>
      <TentacleGlowTips count={12} radius={0.45} tipColor={CYAN_GLOW} y={0.06} />
      <TentacleGlowTips count={8} radius={0.28} tipColor={MAGENTA_GLOW} y={0.18} />
      <BioParticles count={14} seed={83} radiusMin={0.2} radiusMax={0.45} yMin={0.15} yMax={0.55} />
    </group>
  );
}

/** ステージ5：深淵の渦、触手多数、無数の発光生物 */
function Spectacular() {
  const outer = useMemo(() => tendrilPetal(0.68, 0.15), []);
  const mid = useMemo(() => tendrilPetal(0.48, 0.12), []);
  const inner = useMemo(() => tendrilPetal(0.3, 0.09), []);
  return (
    <group>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const t = -Math.PI / 2 + 0.1 + Math.sin(i * 1.2) * 0.25;
        return (
          <group key={`o-${i}`} rotation={[0, a, 0]}>
            <group rotation={[t, 0, 0]}>
              <TentaclePetal shape={outer} baseColor={ABYSS_MID} tipColor={CYAN_GLOW} />
            </group>
          </group>
        );
      })}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 10;
        const t = -Math.PI / 2 + 0.4 + Math.cos(i * 1.3) * 0.2;
        return (
          <group key={`m-${i}`} rotation={[0, a, 0]}>
            <group position={[0, 0.05, 0]} rotation={[t, 0, 0]}>
              <TentaclePetal shape={mid} baseColor={ABYSS_VEIL} tipColor={MAGENTA_GLOW} />
            </group>
          </group>
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const t = -Math.PI / 2 + 0.85 + Math.sin(i * 1.5) * 0.1;
        return (
          <group key={`i-${i}`} rotation={[0, a, 0]}>
            <group position={[0, 0.12, 0]} rotation={[t, 0, 0]}>
              <mesh castShadow>
                <extrudeGeometry args={[inner, petalExtrude]} />
                <meshStandardMaterial
                  color={ABYSS_VEIL}
                  emissive={CYAN_GLOW}
                  emissiveIntensity={1.5}
                  roughness={0.45}
                  side={DoubleSide}
                  toneMapped={false}
                />
              </mesh>
            </group>
          </group>
        );
      })}
      {/* 渦の中心 */}
      <group position={[0, 0.13, 0]}>
        <VortexCore size={0.18} intensity={3.2} />
      </group>
      {/* 渦巻き光：中心を周回する細い帯 */}
      {Array.from({ length: 3 }).map((_, ring) => (
        <group key={`ring-${ring}`} rotation={[ring * 0.5, ring * 1.1, 0]}>
          <mesh>
            <torusGeometry args={[0.22 + ring * 0.06, 0.006, 8, 48]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={ring % 2 === 0 ? CYAN_GLOW : MAGENTA_GLOW}
              emissiveIntensity={2.8}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      <TentacleGlowTips count={14} radius={0.55} tipColor={CYAN_GLOW} y={0.05} />
      <TentacleGlowTips count={10} radius={0.35} tipColor={MAGENTA_GLOW} y={0.25} />
      <BioParticles count={40} seed={103} radiusMin={0.25} radiusMax={0.7} yMin={-0.1} yMax={0.9} />
    </group>
  );
}

/** 葉：深海藻のような濃青 + 発光の筋 */
function SeaweedLeaves({ stemHeight }: { stemHeight: number }) {
  const leaf = useMemo(() => swordLeaf(0.5, 0.08), []);
  return (
    <>
      {[0.25, 0.55, 0.8].map((t, idx) => {
        const y = stemHeight * t;
        const angle = (idx * 2.5) % (Math.PI * 2);
        return (
          <group key={idx} position={[0, y, 0]} rotation={[0, angle, 0]}>
            <mesh
              rotation={[-Math.PI / 2 - 0.3, 0, -0.15]}
              position={[0.02, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[leaf, leafExtrude]} />
              <meshStandardMaterial
                color="#0c1a3a"
                emissive={CYAN_GLOW}
                emissiveIntensity={0.3}
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

type Props = {
  stage: FlowerStage;
  position?: [number, number, number];
};

const STEM_HEIGHT = 1.55;
const STEM_RADIUS = 0.023;

export function AbyssFlower({ stage, position = [0, 0, 0] }: Props) {
  return (
    <group position={position}>
      <SeaweedLeaves stemHeight={STEM_HEIGHT} />
      {/* 茎：螺旋状に発光の筋が走る */}
      <mesh position={[0, STEM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[STEM_RADIUS * 0.85, STEM_RADIUS * 1.1, STEM_HEIGHT, 14]}
        />
        <meshStandardMaterial color="#0a1030" roughness={0.6} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const t = i / 8;
        const a = t * Math.PI * 3;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(a) * STEM_RADIUS * 1.05,
              STEM_HEIGHT * (0.1 + t * 0.8),
              Math.sin(a) * STEM_RADIUS * 1.05,
            ]}
            scale={[0.008, 0.05, 0.008]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={CYAN_GLOW}
              emissive={CYAN_GLOW}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        );
      })}
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
