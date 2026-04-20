import { useMemo } from "react";
import { DoubleSide } from "three";
import { tendrilPetal, ovateLeaf } from "./petalLibrary";
import type { FlowerStage } from "./GerberaFlower";

const petalExtrude = {
  depth: 0.014,
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

const FLESH = "#7a2452";
const FLESH_DEEP = "#4a1030";
const POISON = "#68d040";
const TENDRIL = "#5e1840";
const TENDRIL_TIP = "#ff60a0";
const SCLERA = "#f4eadc";
const IRIS = "#ffaa00";
const IRIS_DARK = "#b05010";
const PUPIL = "#080208";

/** 眼球：白目（球殻）+ 虹彩ディスク + 瞳孔 + ハイライト */
function Eye({
  size = 0.12,
  gazeX = 0,
  gazeY = 0,
  glow = false,
}: {
  size?: number;
  gazeX?: number;
  gazeY?: number;
  glow?: boolean;
}) {
  const tiltX = gazeY * 0.35;
  const tiltY = gazeX * 0.35;
  return (
    <group rotation={[tiltX, tiltY, 0]}>
      {/* 白目 */}
      <mesh castShadow>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={SCLERA}
          emissive={glow ? "#ffe8d0" : "#000000"}
          emissiveIntensity={glow ? 0.3 : 0}
          roughness={0.35}
        />
      </mesh>
      {/* 虹彩（外側の環）：瞳の正面に配置 */}
      <mesh position={[0, 0, size * 0.92]}>
        <circleGeometry args={[size * 0.55, 32]} />
        <meshStandardMaterial
          color={IRIS}
          emissive={glow ? IRIS : "#000000"}
          emissiveIntensity={glow ? 0.7 : 0}
          roughness={0.5}
          side={DoubleSide}
          toneMapped={!glow}
        />
      </mesh>
      {/* 虹彩の内環 */}
      <mesh position={[0, 0, size * 0.93]}>
        <circleGeometry args={[size * 0.4, 28]} />
        <meshStandardMaterial
          color={IRIS_DARK}
          emissive={glow ? "#ff4020" : "#000000"}
          emissiveIntensity={glow ? 0.6 : 0}
          roughness={0.6}
          side={DoubleSide}
          toneMapped={!glow}
        />
      </mesh>
      {/* 瞳孔 */}
      <mesh position={[0, 0, size * 0.94]}>
        <circleGeometry args={[size * 0.22, 24]} />
        <meshStandardMaterial color={PUPIL} roughness={0.2} />
      </mesh>
      {/* ハイライト */}
      <mesh position={[size * 0.18, size * 0.18, size * 0.95]}>
        <circleGeometry args={[size * 0.08, 16]} />
        <meshStandardMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}

/** 触手状の花弁 1 リング */
function TendrilRing({
  count,
  shape,
  tilt,
  yOffset = 0,
  color,
  emissive,
  emissiveIntensity = 0,
  angleOffset = 0,
  twist = 0,
}: {
  count: number;
  shape: import("three").Shape;
  tilt: number;
  yOffset?: number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  angleOffset?: number;
  twist?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + angleOffset;
        const t = tilt + Math.sin(i * 1.7) * twist;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <group position={[0, yOffset, 0]} rotation={[t, 0, 0]}>
              <mesh castShadow>
                <extrudeGeometry args={[shape, petalExtrude]} />
                <meshStandardMaterial
                  color={color}
                  emissive={emissive ?? "#000000"}
                  emissiveIntensity={emissiveIntensity}
                  roughness={0.5}
                  side={DoubleSide}
                  toneMapped={emissiveIntensity > 0.5 ? false : true}
                />
              </mesh>
            </group>
          </group>
        );
      })}
    </>
  );
}

/** 毒の斑点：花弁の上に散らす */
function PoisonSpots({ count, radius, seed = 9 }: {
  count: number; radius: number; seed?: number;
}) {
  const dots = useMemo(() => {
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
      const r = Math.sqrt(rand()) * radius;
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, size: 0.008 + rand() * 0.014 };
    });
  }, [count, radius, seed]);
  return (
    <>
      {dots.map((d, i) => (
        <mesh key={i} position={[d.x, 0.015, d.z]}>
          <sphereGeometry args={[d.size, 6, 6]} />
          <meshStandardMaterial
            color={POISON}
            emissive={POISON}
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

/** ステージ1：まぶたを閉じた卵形の蕾 */
function Bud() {
  return (
    <group>
      <mesh position={[0, 0.14, 0]} scale={[0.95, 1.1, 0.95]} castShadow>
        <sphereGeometry args={[0.13, 28, 28]} />
        <meshStandardMaterial color={FLESH_DEEP} roughness={0.55} />
      </mesh>
      {/* まぶたの継ぎ目：水平のくぼみを示す黒い帯 */}
      <mesh position={[0, 0.14, 0]} scale={[1.02, 0.06, 1.02]}>
        <sphereGeometry args={[0.13, 28, 28]} />
        <meshStandardMaterial color="#1a0418" roughness={0.6} />
      </mesh>
      {/* 血管っぽい筋 */}
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.11, 0.14, Math.sin(a) * 0.11]}
            rotation={[0, a, 0.15]}
            scale={[0.008, 0.24, 0.008]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#3a0820" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

/** ステージ2：瞼が縦に開き、瞳孔の赤い光が覗く */
function Opening() {
  const petal = useMemo(() => tendrilPetal(0.22, 0.07), []);
  return (
    <group>
      <mesh position={[0, 0.14, 0]} scale={[0.95, 1.05, 0.95]} castShadow>
        <sphereGeometry args={[0.13, 28, 28]} />
        <meshStandardMaterial color={FLESH_DEEP} roughness={0.55} />
      </mesh>
      {/* 縦に裂けた開口部 */}
      <mesh position={[0, 0.14, 0.13]} scale={[0.04, 0.2, 0.01]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ff3020"
          emissive="#ff4020"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
      {/* 先端から少し触手が出る */}
      <TendrilRing
        count={5}
        shape={petal}
        tilt={-Math.PI / 2 + 1.1}
        yOffset={0.26}
        color={FLESH}
        twist={0.08}
      />
    </group>
  );
}

/** ステージ3：中央に完全な眼球。触手状の花弁6枚 */
function Bloom() {
  const petal = useMemo(() => tendrilPetal(0.5, 0.12), []);
  return (
    <group>
      {/* 触手花弁（放射）*/}
      <TendrilRing
        count={6}
        shape={petal}
        tilt={-Math.PI / 2 + 0.3}
        color={FLESH}
        twist={0.12}
      />
      {/* 中央の肉質のクッション */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <sphereGeometry args={[0.18, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial color={FLESH_DEEP} roughness={0.55} />
      </mesh>
      <PoisonSpots count={18} radius={0.18} />
      {/* 眼球：やや上を向く */}
      <group position={[0, 0.13, 0]}>
        <Eye size={0.11} gazeX={0} gazeY={-0.2} />
      </group>
    </group>
  );
}

/** ステージ4：中央の大きな眼球＋周囲に小さな眼＋触手が増える */
function Rich() {
  const outer = useMemo(() => tendrilPetal(0.56, 0.13), []);
  const inner = useMemo(() => tendrilPetal(0.32, 0.09), []);
  return (
    <group>
      <TendrilRing
        count={8}
        shape={outer}
        tilt={-Math.PI / 2 + 0.2}
        color={FLESH}
        twist={0.15}
      />
      <TendrilRing
        count={6}
        shape={inner}
        tilt={-Math.PI / 2 + 0.6}
        yOffset={0.04}
        angleOffset={Math.PI / 6}
        color={TENDRIL}
        emissive={TENDRIL_TIP}
        emissiveIntensity={0.35}
      />
      <mesh position={[0, 0.03, 0]} castShadow>
        <sphereGeometry args={[0.2, 28, 28, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial color={FLESH_DEEP} roughness={0.55} />
      </mesh>
      <PoisonSpots count={30} radius={0.2} seed={41} />
      {/* 中央の大きな眼 */}
      <group position={[0, 0.15, 0]}>
        <Eye size={0.13} gazeX={0.1} gazeY={-0.1} />
      </group>
      {/* 周囲の3つの小さな眼 */}
      {Array.from({ length: 3 }).map((_, i) => {
        const a = (i / 3) * Math.PI * 2 + 0.3;
        const r = 0.22;
        return (
          <group key={i} position={[Math.cos(a) * r, 0.1, Math.sin(a) * r]} rotation={[0, a + Math.PI / 2, 0]}>
            <Eye size={0.055} gazeX={-0.2} gazeY={-0.3} />
          </group>
        );
      })}
    </group>
  );
}

/** ステージ5：無数の眼が浮遊する邪悪な開花 */
function Spectacular() {
  const outer = useMemo(() => tendrilPetal(0.62, 0.14), []);
  const mid = useMemo(() => tendrilPetal(0.44, 0.11), []);
  const inner = useMemo(() => tendrilPetal(0.28, 0.08), []);

  const floatEyes = useMemo(() => {
    let s = 71;
    const rand = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return Array.from({ length: 7 }).map(() => {
      const a = rand() * Math.PI * 2;
      const r = 0.35 + rand() * 0.35;
      const y = 0.3 + rand() * 0.55;
      return {
        x: Math.cos(a) * r,
        y,
        z: Math.sin(a) * r,
        rotY: a + Math.PI,
        size: 0.04 + rand() * 0.035,
      };
    });
  }, []);

  return (
    <group>
      <TendrilRing
        count={10}
        shape={outer}
        tilt={-Math.PI / 2 + 0.1}
        color={FLESH}
        emissive={TENDRIL_TIP}
        emissiveIntensity={0.35}
        twist={0.2}
      />
      <TendrilRing
        count={8}
        shape={mid}
        tilt={-Math.PI / 2 + 0.4}
        yOffset={0.05}
        angleOffset={Math.PI / 8}
        color={TENDRIL}
        emissive={TENDRIL_TIP}
        emissiveIntensity={0.5}
        twist={0.18}
      />
      <TendrilRing
        count={6}
        shape={inner}
        tilt={-Math.PI / 2 + 0.8}
        yOffset={0.12}
        color={"#d04080"}
        emissive={TENDRIL_TIP}
        emissiveIntensity={0.7}
      />
      <mesh position={[0, 0.06, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial
          color={FLESH_DEEP}
          emissive={"#ff2060"}
          emissiveIntensity={0.4}
          roughness={0.5}
        />
      </mesh>
      <PoisonSpots count={55} radius={0.24} seed={59} />
      {/* 中央の巨大な邪眼 */}
      <group position={[0, 0.22, 0]}>
        <Eye size={0.17} gazeX={0} gazeY={-0.15} glow />
      </group>
      {/* 浮遊する小さな眼 */}
      {floatEyes.map((e, i) => (
        <group
          key={`fe-${i}`}
          position={[e.x, e.y, e.z]}
          rotation={[0, e.rotY, 0]}
        >
          <Eye size={e.size} gazeX={0.1} gazeY={-0.2} glow />
        </group>
      ))}
    </group>
  );
}

/** 肉質の黒紫の葉 */
function FleshyLeaves() {
  const leaf = useMemo(() => ovateLeaf(0.3, 0.14), []);
  return (
    <>
      {[0.4, 0.65].map((t, idx) => {
        const y = 1.4 * t;
        const angle = idx % 2 === 0 ? 0.4 : Math.PI - 0.4;
        return (
          <group key={idx} position={[0, y, 0]} rotation={[0, angle, 0]}>
            <mesh
              rotation={[-Math.PI / 2 + 0.7, 0, 0.3]}
              position={[0.04, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[leaf, leafExtrude]} />
              <meshStandardMaterial
                color="#3a1230"
                emissive={POISON}
                emissiveIntensity={0.15}
                roughness={0.7}
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

const STEM_HEIGHT = 1.4;
const STEM_RADIUS = 0.025;

export function EvilEyeFlower({ stage, position = [0, 0, 0] }: Props) {
  return (
    <group position={position}>
      <FleshyLeaves />
      {/* 茎：血管のような赤い筋 */}
      <mesh position={[0, STEM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[STEM_RADIUS * 0.85, STEM_RADIUS * 1.15, STEM_HEIGHT, 14]}
        />
        <meshStandardMaterial color="#2a0c22" roughness={0.6} />
      </mesh>
      {/* 茎の血管 */}
      {[0.2, 0.5, 0.8].map((t) => (
        <mesh
          key={t}
          position={[0.022, STEM_HEIGHT * t, 0]}
          scale={[0.004, STEM_HEIGHT * 0.14, 0.006]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#ff3060"
            emissive="#ff3060"
            emissiveIntensity={0.9}
            toneMapped={false}
          />
        </mesh>
      ))}
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
