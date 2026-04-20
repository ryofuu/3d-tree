import { useMemo } from "react";
import { DoubleSide } from "three";
import { swordLeaf } from "./petalLibrary";
import type { FlowerStage } from "./GerberaFlower";

const leafExtrude = {
  depth: 0.01,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.005,
  bevelThickness: 0.003,
};

const SILVER_WHITE = "#e8eefc";
const MOON_PALE = "#b4c8ff";
const MOON_DEEP = "#6880c0";

/** 1 つの釣鐘型の花：円錐殻＋底面の小花弁 */
function BellFlower({
  size = 0.1,
  glow = 0.6,
  colorTop = SILVER_WHITE,
  colorBottom = MOON_PALE,
}: {
  size?: number;
  glow?: number;
  colorTop?: string;
  colorBottom?: string;
}) {
  // 釣鐘：頂点が上、開口が下。裾は反り返る
  const len = size * 1.4;
  const rTop = size * 0.15;
  const rBottom = size * 0.6;

  return (
    <group>
      {/* 鐘本体（円錐殻） */}
      <mesh castShadow>
        <cylinderGeometry args={[rTop, rBottom, len, 16, 1, true]} />
        <meshStandardMaterial
          color={colorTop}
          emissive={colorBottom}
          emissiveIntensity={glow}
          roughness={0.35}
          side={DoubleSide}
          toneMapped={glow < 0.5}
        />
      </mesh>
      {/* 裾：6枚の反り返る花弁 */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * rBottom * 0.95, -len / 2, Math.sin(a) * rBottom * 0.95]}
            rotation={[Math.PI / 2 + 0.4, a, 0]}
            castShadow
          >
            <coneGeometry args={[size * 0.14, size * 0.2, 4]} />
            <meshStandardMaterial
              color={colorBottom}
              emissive={colorBottom}
              emissiveIntensity={glow * 1.3}
              roughness={0.35}
              toneMapped={false}
            />
          </mesh>
        );
      })}
      {/* 鐘の内側から垂れる柱頭（鈴の舌） */}
      <mesh position={[0, -len / 2 - size * 0.15, 0]}>
        <sphereGeometry args={[size * 0.1, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffe0a0"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** 音符パーティクル：二分音符風の小球 */
function NoteParticles({ count, seed = 19, heightRange = 0.8, radiusMax = 0.5 }: {
  count: number; seed?: number; heightRange?: number; radiusMax?: number;
}) {
  const notes = useMemo(() => {
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
      const r = 0.2 + rand() * radiusMax;
      return {
        x: Math.cos(a) * r,
        y: 0.2 + rand() * heightRange,
        z: Math.sin(a) * r,
        size: 0.015 + rand() * 0.015,
      };
    });
  }, [count, seed, heightRange, radiusMax]);
  return (
    <>
      {notes.map((n, i) => (
        <mesh key={i} position={[n.x, n.y, n.z]}>
          <sphereGeometry args={[n.size, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={MOON_PALE}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

/** ステージ1：小さな丸い蕾 1 つ */
function Bud() {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial
          color={MOON_PALE}
          emissive={MOON_DEEP}
          emissiveIntensity={0.3}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow>
        <coneGeometry args={[0.03, 0.06, 8]} />
        <meshStandardMaterial color={MOON_DEEP} roughness={0.55} />
      </mesh>
    </group>
  );
}

/** ステージ2：3つの蕾が茎に並ぶ */
function Opening() {
  return (
    <group>
      {[0, 0.12, 0.24].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0]} scale={1 - i * 0.15} castShadow>
            <sphereGeometry args={[0.065, 20, 20]} />
            <meshStandardMaterial
              color={SILVER_WHITE}
              emissive={MOON_PALE}
              emissiveIntensity={0.4 + i * 0.1}
              roughness={0.4}
              toneMapped={false}
            />
          </mesh>
          {/* 垂下する短い花柄 */}
          <mesh position={[0.05, y + 0.03, 0]} rotation={[0, 0, Math.PI / 2.5]}>
            <cylinderGeometry args={[0.004, 0.004, 0.1, 6]} />
            <meshStandardMaterial color="#889cc0" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** 連なる釣鐘：各花は茎から短い花柄でぶら下がる */
function BellCluster({
  bells,
}: {
  bells: Array<{ y: number; angle: number; offset: number; size: number; glow: number }>;
}) {
  return (
    <>
      {bells.map((b, i) => {
        const x = Math.cos(b.angle) * b.offset;
        const z = Math.sin(b.angle) * b.offset;
        return (
          <group key={i}>
            {/* 花柄（茎から鐘へ斜めに） */}
            <mesh
              position={[x * 0.5, b.y + b.size * 0.4, z * 0.5]}
              rotation={[
                -Math.atan2(z, b.size * 0.8),
                0,
                Math.atan2(x, b.size * 0.8),
              ]}
            >
              <cylinderGeometry args={[0.004, 0.004, b.size * 1.2, 6]} />
              <meshStandardMaterial color="#889cc0" roughness={0.6} />
            </mesh>
            {/* 鐘本体：花柄の先で下向き */}
            <group position={[x, b.y - b.size * 0.7, z]}>
              <BellFlower size={b.size} glow={b.glow} />
            </group>
          </group>
        );
      })}
    </>
  );
}

/** ステージ3：5 つの釣鐘が穂状に */
function Bloom() {
  const bells = [
    { y: 0.4, angle: 0, offset: 0.12, size: 0.1, glow: 0.7 },
    { y: 0.25, angle: Math.PI * 0.6, offset: 0.16, size: 0.11, glow: 0.7 },
    { y: 0.1, angle: Math.PI * 1.2, offset: 0.18, size: 0.12, glow: 0.7 },
    { y: -0.05, angle: Math.PI * 1.8, offset: 0.17, size: 0.11, glow: 0.7 },
    { y: -0.2, angle: Math.PI * 2.4, offset: 0.14, size: 0.1, glow: 0.7 },
  ];
  return (
    <group>
      <BellCluster bells={bells} />
      <NoteParticles count={4} heightRange={0.5} radiusMax={0.15} />
    </group>
  );
}

/** ステージ4：9 つの釣鐘が広がる */
function Rich() {
  const bells = Array.from({ length: 9 }).map((_, i) => {
    const t = i / 8;
    const y = 0.5 - t * 0.8;
    const angle = i * 1.37;
    const offset = 0.15 + Math.sin(t * Math.PI) * 0.1;
    return { y, angle, offset, size: 0.11 + Math.sin(t * Math.PI) * 0.02, glow: 0.9 };
  });
  return (
    <group>
      <BellCluster bells={bells} />
      <NoteParticles count={8} heightRange={0.7} radiusMax={0.35} seed={31} />
    </group>
  );
}

/** ステージ5：15 の釣鐘 + 浮遊光 + 音符パーティクル */
function Spectacular() {
  const bells = Array.from({ length: 15 }).map((_, i) => {
    const t = i / 14;
    const y = 0.7 - t * 1.1;
    const angle = i * 1.24;
    const offset = 0.18 + Math.sin(t * Math.PI) * 0.12;
    return {
      y,
      angle,
      offset,
      size: 0.11 + Math.sin(t * Math.PI) * 0.025,
      glow: 1.5,
    };
  });
  return (
    <group>
      <BellCluster bells={bells} />
      <NoteParticles count={18} heightRange={1.2} radiusMax={0.55} seed={47} />
      {/* 全体を包む薄い青白い光 */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshStandardMaterial
          color={MOON_PALE}
          emissive={MOON_PALE}
          emissiveIntensity={0.3}
          transparent
          opacity={0.08}
          toneMapped={false}
        />
      </mesh>
      {/* 上部に小さな月のような光の粒 */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.06, 20, 20]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** 細長い銀白色の葉 */
function SilverLeaves({ stemHeight }: { stemHeight: number }) {
  const leaf = useMemo(() => swordLeaf(0.42, 0.06), []);
  return (
    <>
      {[0.25, 0.5, 0.75].map((t, idx) => {
        const y = stemHeight * t;
        const angle = (idx * 2.3) % (Math.PI * 2);
        return (
          <group key={idx} position={[0, y, 0]} rotation={[0, angle, 0]}>
            <mesh
              rotation={[-Math.PI / 2 - 0.2, 0, -0.05]}
              position={[0.02, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[leaf, leafExtrude]} />
              <meshStandardMaterial
                color="#5e7a9c"
                emissive={MOON_PALE}
                emissiveIntensity={0.15}
                roughness={0.6}
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

const STEM_HEIGHT = 1.6;
const STEM_RADIUS = 0.018;

export function MoonBellFlower({ stage, position = [0, 0, 0] }: Props) {
  return (
    <group position={position}>
      <SilverLeaves stemHeight={STEM_HEIGHT} />
      <mesh position={[0, STEM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[STEM_RADIUS * 0.85, STEM_RADIUS, STEM_HEIGHT, 12]}
        />
        <meshStandardMaterial
          color="#4a6080"
          emissive={MOON_PALE}
          emissiveIntensity={0.12}
          roughness={0.6}
        />
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
