import { useMemo } from "react";
import { DoubleSide } from "three";
import type { Shape } from "three";
import { ovateLeaf, rosePetal } from "./petalLibrary";
import type { FlowerStage } from "./GerberaFlower";

const petalExtrude = {
  depth: 0.012,
  bevelEnabled: true,
  bevelSegments: 2,
  steps: 1,
  bevelSize: 0.006,
  bevelThickness: 0.004,
};

const leafExtrude = {
  depth: 0.008,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.005,
  bevelThickness: 0.003,
};

const ROSE_RED = "#b8162d";
const ROSE_RED_DEEP = "#92101f";
const ROSE_RED_BRIGHT = "#d82a4a";
const ROSE_PINK = "#e85878";

type RingParams = {
  count: number;
  radius: number;
  /** 外に倒れる角度。正で外向き、負で内向き。0 で垂直 */
  outwardLean: number;
  y: number;
  size: number;
  color: string;
  angleOffset?: number;
  emissive?: string;
  emissiveIntensity?: number;
};

/** 1 リングぶんの花びらを円周状に配置 */
function PetalRing({
  count,
  radius,
  outwardLean,
  y,
  size,
  color,
  angleOffset = 0,
  emissive,
  emissiveIntensity = 0,
}: RingParams) {
  const shape: Shape = useMemo(() => rosePetal(size), [size]);
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + angleOffset;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              position={[radius, y, 0]}
              rotation={[0, 0, -outwardLean]}
              castShadow
            >
              <extrudeGeometry args={[shape, petalExtrude]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive ?? "#000000"}
                emissiveIntensity={emissiveIntensity}
                roughness={0.48}
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

/** ステージ1：固い蕾。5枚の萼が包む中に涙型の蕾 */
function Bud() {
  return (
    <group>
      {/* 花びらが閉じた内側の塊（縦長） */}
      <mesh position={[0, 0.2, 0]} scale={[0.75, 1.5, 0.75]} castShadow>
        <sphereGeometry args={[0.11, 22, 22]} />
        <meshStandardMaterial color={ROSE_RED_DEEP} roughness={0.5} />
      </mesh>
      {/* 内側の塊の上にもう一段小さな塊を重ねて巻いた感 */}
      <mesh position={[0, 0.33, 0]} scale={[0.55, 1, 0.55]} castShadow>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial color={ROSE_RED} roughness={0.5} />
      </mesh>
      {/* 5枚の萼（がく）：尖った緑の葉が蕾を包む */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2 + Math.PI / 10;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              position={[0.05, 0.14, 0]}
              rotation={[0, 0, -0.35]}
              scale={[0.35, 1, 0.35]}
              castShadow
            >
              <coneGeometry args={[0.055, 0.3, 8]} />
              <meshStandardMaterial color="#4a8c3a" roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** ステージ2：ほころび。萼が外に広がり、外側花びらが数枚顔を出す */
function Opening() {
  return (
    <group>
      {/* 内部の閉じた塊（少し大きく） */}
      <mesh position={[0, 0.18, 0]} scale={[0.85, 1.5, 0.85]} castShadow>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial color={ROSE_RED_DEEP} roughness={0.5} />
      </mesh>
      {/* 5枚の外側花びらが少し開き始める */}
      <PetalRing
        count={5}
        radius={0.07}
        outwardLean={0.25}
        y={0.05}
        size={0.25}
        color={ROSE_RED}
      />
      {/* 萼が外に広がる */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              position={[0.09, 0.08, 0]}
              rotation={[0, 0, -0.9]}
              scale={[0.35, 1, 0.35]}
              castShadow
            >
              <coneGeometry args={[0.05, 0.28, 8]} />
              <meshStandardMaterial color="#4a8c3a" roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** ステージ3：満開。4リングの螺旋配置、典型的なバラ */
function Bloom() {
  return (
    <group>
      {/* 内側の小さな芯（閉じた部分の名残） */}
      <mesh position={[0, 0.12, 0]} scale={[0.5, 0.9, 0.5]} castShadow>
        <sphereGeometry args={[0.08, 18, 18]} />
        <meshStandardMaterial color={ROSE_RED_DEEP} roughness={0.55} />
      </mesh>
      {/* 内側リング：ほぼ垂直 */}
      <PetalRing
        count={5}
        radius={0.06}
        outwardLean={0.05}
        y={0.08}
        size={0.18}
        color={ROSE_RED_DEEP}
      />
      <PetalRing
        count={7}
        radius={0.13}
        outwardLean={0.45}
        y={0.04}
        size={0.25}
        color={ROSE_RED}
        angleOffset={Math.PI / 7}
      />
      <PetalRing
        count={8}
        radius={0.22}
        outwardLean={0.85}
        y={0.01}
        size={0.32}
        color={ROSE_RED}
        angleOffset={0}
      />
      <PetalRing
        count={10}
        radius={0.3}
        outwardLean={1.2}
        y={-0.01}
        size={0.38}
        color={ROSE_RED_BRIGHT}
        angleOffset={Math.PI / 10}
      />
    </group>
  );
}

/** ステージ4：豪華。5リング、外側がさらに広がる */
function Rich() {
  return (
    <group>
      <mesh position={[0, 0.13, 0]} scale={[0.5, 0.9, 0.5]} castShadow>
        <sphereGeometry args={[0.08, 18, 18]} />
        <meshStandardMaterial color={ROSE_RED_DEEP} roughness={0.55} />
      </mesh>
      <PetalRing
        count={5}
        radius={0.06}
        outwardLean={0.05}
        y={0.1}
        size={0.2}
        color={ROSE_RED_DEEP}
      />
      <PetalRing
        count={7}
        radius={0.13}
        outwardLean={0.45}
        y={0.06}
        size={0.27}
        color={ROSE_RED}
        angleOffset={Math.PI / 7}
      />
      <PetalRing
        count={8}
        radius={0.21}
        outwardLean={0.9}
        y={0.03}
        size={0.32}
        color={ROSE_RED_BRIGHT}
      />
      <PetalRing
        count={10}
        radius={0.29}
        outwardLean={1.25}
        y={0}
        size={0.38}
        color={ROSE_PINK}
        angleOffset={Math.PI / 10}
      />
      <PetalRing
        count={12}
        radius={0.37}
        outwardLean={1.45}
        y={-0.03}
        size={0.42}
        color={ROSE_PINK}
      />
    </group>
  );
}

/** ステージ5：特別。6リング + 発光縁 + 浮遊する花びら */
function Spectacular() {
  const floatingPetalShape = useMemo(() => rosePetal(0.22), []);
  const floatingPetals = useMemo(() => {
    let s = 41;
    const rand = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return Array.from({ length: 10 }).map(() => {
      const ang = rand() * Math.PI * 2;
      const r = 0.55 + rand() * 0.45;
      const y = 0.25 + rand() * 0.7;
      return {
        pos: [Math.cos(ang) * r, y, Math.sin(ang) * r] as [
          number,
          number,
          number,
        ],
        rot: [rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI] as [
          number,
          number,
          number,
        ],
      };
    });
  }, []);

  return (
    <group>
      {/* 6 リングの花びら */}
      <mesh position={[0, 0.15, 0]} scale={[0.5, 0.9, 0.5]} castShadow>
        <sphereGeometry args={[0.08, 18, 18]} />
        <meshStandardMaterial
          color={ROSE_RED_DEEP}
          emissive="#ff2040"
          emissiveIntensity={0.4}
          roughness={0.5}
        />
      </mesh>
      <PetalRing
        count={5}
        radius={0.06}
        outwardLean={0.05}
        y={0.12}
        size={0.22}
        color={ROSE_RED_DEEP}
        emissive="#ff3040"
        emissiveIntensity={0.4}
      />
      <PetalRing
        count={7}
        radius={0.13}
        outwardLean={0.45}
        y={0.08}
        size={0.28}
        color={ROSE_RED}
        emissive="#ff2040"
        emissiveIntensity={0.35}
        angleOffset={Math.PI / 7}
      />
      <PetalRing
        count={8}
        radius={0.22}
        outwardLean={0.9}
        y={0.04}
        size={0.33}
        color={ROSE_RED_BRIGHT}
        emissive={ROSE_RED_BRIGHT}
        emissiveIntensity={0.35}
      />
      <PetalRing
        count={10}
        radius={0.3}
        outwardLean={1.25}
        y={0.01}
        size={0.4}
        color={ROSE_PINK}
        emissive={ROSE_PINK}
        emissiveIntensity={0.4}
        angleOffset={Math.PI / 10}
      />
      <PetalRing
        count={12}
        radius={0.4}
        outwardLean={1.5}
        y={-0.03}
        size={0.45}
        color="#ffb5ce"
        emissive="#ffa0c0"
        emissiveIntensity={0.45}
      />
      <PetalRing
        count={14}
        radius={0.5}
        outwardLean={1.65}
        y={-0.06}
        size={0.48}
        color="#ffcad8"
        emissive="#ffa8c8"
        emissiveIntensity={0.4}
        angleOffset={Math.PI / 14}
      />
      {/* 金色の発光ドロップ（露/精気） */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const r = 0.36 + (i % 3) * 0.05;
        return (
          <mesh
            key={`dew-${i}`}
            position={[
              Math.cos(angle) * r,
              0.04 + (i % 2) * 0.05,
              Math.sin(angle) * r,
            ]}
          >
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffe0a0"
              emissiveIntensity={2.5}
              toneMapped={false}
            />
          </mesh>
        );
      })}
      {/* 浮遊する花びら */}
      {floatingPetals.map((fp, i) => (
        <mesh key={`fp-${i}`} position={fp.pos} rotation={fp.rot}>
          <extrudeGeometry args={[floatingPetalShape, petalExtrude]} />
          <meshStandardMaterial
            color={ROSE_PINK}
            emissive={ROSE_PINK}
            emissiveIntensity={0.6}
            roughness={0.4}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** バラの複葉：3〜5枚の小葉が1本の軸に並ぶ葉 */
function CompoundLeaf({
  y,
  angle,
  size = 1,
}: {
  y: number;
  angle: number;
  size?: number;
}) {
  const mainShape = useMemo(() => ovateLeaf(0.22, 0.08), []);
  const leafletOffsets = [-0.14, -0.07, 0, 0.07, 0.14];

  return (
    <group position={[0, y, 0]} rotation={[0, angle, 0]} scale={size}>
      {/* 葉軸 */}
      <mesh position={[0.14, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.004, 0.005, 0.3, 6]} />
        <meshStandardMaterial color="#3e7830" roughness={0.65} />
      </mesh>
      {/* 5枚の小葉 */}
      {leafletOffsets.map((off, i) => {
        const isTerm = i === 2;
        const leafletX = 0.14 + off;
        const leafletSide = isTerm ? 0 : i < 2 ? -1 : 1;
        return (
          <group
            key={i}
            position={[leafletX, 0, leafletSide * 0.03]}
            rotation={[
              -Math.PI / 2,
              0,
              leafletSide === 0 ? 0 : leafletSide * 0.8,
            ]}
          >
            <mesh position={[0, 0, 0.005]} castShadow>
              <extrudeGeometry args={[mainShape, leafExtrude]} />
              <meshStandardMaterial
                color="#3e7830"
                roughness={0.65}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** 茎の棘（とげ）：小さな三角錐を散らす */
function Thorns({ stemHeight }: { stemHeight: number }) {
  const thorns = useMemo(() => {
    const arr: Array<{ y: number; angle: number }> = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        y: 0.15 + (i * stemHeight * 0.75) / 8 + (i % 2) * 0.04,
        angle: (i * 1.6) % (Math.PI * 2),
      });
    }
    return arr;
  }, [stemHeight]);
  return (
    <>
      {thorns.map((t, i) => (
        <group key={i} position={[0, t.y, 0]} rotation={[0, t.angle, 0]}>
          <mesh
            position={[0.025, 0, 0]}
            rotation={[0, 0, -Math.PI / 2]}
            castShadow
          >
            <coneGeometry args={[0.008, 0.03, 6]} />
            <meshStandardMaterial color="#6a4020" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </>
  );
}

type RoseProps = {
  stage: FlowerStage;
  position?: [number, number, number];
};

const STEM_HEIGHT = 1.4;
const STEM_RADIUS = 0.022;

export function RoseFlower({ stage, position = [0, 0, 0] }: RoseProps) {
  return (
    <group position={position}>
      {/* 茎 */}
      <mesh position={[0, STEM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[STEM_RADIUS * 0.8, STEM_RADIUS, STEM_HEIGHT, 14]}
        />
        <meshStandardMaterial color="#4a7830" roughness={0.65} />
      </mesh>
      <Thorns stemHeight={STEM_HEIGHT} />
      {/* 複葉を2段 */}
      <CompoundLeaf y={STEM_HEIGHT * 0.35} angle={0.3} size={1.0} />
      <CompoundLeaf y={STEM_HEIGHT * 0.65} angle={Math.PI + 0.3} size={0.9} />
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
