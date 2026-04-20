import { useMemo } from "react";
import { DoubleSide } from "three";
import { diamondPetal, swordLeaf } from "./petalLibrary";
import type { FlowerStage } from "./GerberaFlower";

const petalExtrude = {
  depth: 0.02,
  bevelEnabled: true,
  bevelSegments: 3,
  steps: 1,
  bevelSize: 0.012,
  bevelThickness: 0.008,
};

const leafExtrude = {
  depth: 0.01,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.006,
  bevelThickness: 0.004,
};

const ICE_WHITE = "#eaf4ff";
const ICE_BLUE = "#b8e0ff";
const RAINBOW = ["#ffb8c8", "#ffddb0", "#fff4b0", "#b8ffd0", "#b8e0ff", "#d0b8ff"];

/** 透明感のある水晶花弁 */
function CrystalPetal({
  shape,
  color,
  emissive,
  emissiveIntensity = 0.6,
  opacity = 0.75,
}: {
  shape: import("three").Shape;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
}) {
  return (
    <mesh castShadow>
      <extrudeGeometry args={[shape, petalExtrude]} />
      <meshPhysicalMaterial
        color={color}
        emissive={emissive ?? color}
        emissiveIntensity={emissiveIntensity}
        roughness={0.1}
        metalness={0.05}
        transmission={0.55}
        thickness={0.2}
        ior={1.5}
        transparent
        opacity={opacity}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

/** ステージ1：六角柱の結晶の蕾 */
function Bud() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 0.35, 6]} />
        <meshPhysicalMaterial
          color={ICE_WHITE}
          emissive={ICE_BLUE}
          emissiveIntensity={0.6}
          roughness={0.1}
          transmission={0.7}
          thickness={0.2}
          transparent
          opacity={0.75}
          toneMapped={false}
        />
      </mesh>
      {/* 先端の尖り（六角錐） */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <coneGeometry args={[0.09, 0.14, 6]} />
        <meshPhysicalMaterial
          color={ICE_WHITE}
          emissive={ICE_BLUE}
          emissiveIntensity={0.8}
          roughness={0.1}
          transmission={0.7}
          thickness={0.2}
          transparent
          opacity={0.75}
          toneMapped={false}
        />
      </mesh>
      {/* 基部の小結晶 */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.07, 0.05, Math.sin(a) * 0.07]}
            rotation={[0, a, 0.3]}
            castShadow
          >
            <coneGeometry args={[0.015, 0.06, 4]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#c0e0ff"
              emissiveIntensity={1.2}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** ステージ2：結晶の先端が三角形に割れる */
function Opening() {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 0.3, 6]} />
        <meshPhysicalMaterial
          color={ICE_WHITE}
          emissive={ICE_BLUE}
          emissiveIntensity={0.7}
          roughness={0.1}
          transmission={0.75}
          thickness={0.2}
          transparent
          opacity={0.75}
          toneMapped={false}
        />
      </mesh>
      {/* 6枚の三角形が外に少し広がる */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.08, 0.44, Math.sin(a) * 0.08]}
            rotation={[Math.PI / 2 - 0.4, a, 0]}
            castShadow
          >
            <coneGeometry args={[0.06, 0.18, 4]} />
            <meshPhysicalMaterial
              color={ICE_WHITE}
              emissive={ICE_BLUE}
              emissiveIntensity={0.9}
              roughness={0.1}
              transmission={0.7}
              thickness={0.2}
              transparent
              opacity={0.8}
              toneMapped={false}
            />
          </mesh>
        );
      })}
      {/* 中央にきらめく光 */}
      <mesh position={[0, 0.44, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** ステージ3：6枚の菱形花弁が放射、中央は光のコア */
function Bloom() {
  const petal = useMemo(() => diamondPetal(0.5, 0.18), []);
  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <group rotation={[-Math.PI / 2 + 0.3, 0, 0]}>
              <CrystalPetal shape={petal} color={ICE_WHITE} emissive={ICE_BLUE} emissiveIntensity={0.7} />
            </group>
          </group>
        );
      })}
      {/* 光のコア */}
      <mesh position={[0, 0.04, 0]}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={4}
          toneMapped={false}
        />
      </mesh>
      {/* 装飾の小結晶（中央を囲む） */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const r = 0.1;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, 0.035, Math.sin(a) * r]}
            rotation={[0, a, 0]}
            castShadow
          >
            <coneGeometry args={[0.018, 0.05, 4]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={ICE_BLUE}
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** ステージ4：外12枚の大菱形 + 内6枚の小菱形、虹色に色づく */
function Rich() {
  const outer = useMemo(() => diamondPetal(0.56, 0.2), []);
  const inner = useMemo(() => diamondPetal(0.34, 0.13), []);
  return (
    <group>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const color = RAINBOW[i % RAINBOW.length];
        return (
          <group key={`o-${i}`} rotation={[0, a, 0]}>
            <group rotation={[-Math.PI / 2 + 0.25, 0, 0]}>
              <CrystalPetal shape={outer} color={color} emissive={color} emissiveIntensity={0.55} opacity={0.8} />
            </group>
          </group>
        );
      })}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return (
          <group key={`i-${i}`} rotation={[0, a, 0]}>
            <group
              position={[0, 0.06, 0]}
              rotation={[-Math.PI / 2 + 0.65, 0, 0]}
            >
              <CrystalPetal shape={inner} color={ICE_WHITE} emissive="#ffffff" emissiveIntensity={1} opacity={0.7} />
            </group>
          </group>
        );
      })}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.09, 28, 28]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** ステージ5：多層プリズム・浮遊結晶・放射光 */
function Spectacular() {
  const outer = useMemo(() => diamondPetal(0.64, 0.22), []);
  const mid = useMemo(() => diamondPetal(0.46, 0.17), []);
  const inner = useMemo(() => diamondPetal(0.28, 0.12), []);

  const crystals = useMemo(() => {
    let s = 53;
    const rand = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return Array.from({ length: 14 }).map((_, i) => {
      const a = rand() * Math.PI * 2;
      const r = 0.45 + rand() * 0.4;
      const y = 0.3 + rand() * 0.8;
      return {
        x: Math.cos(a) * r,
        y,
        z: Math.sin(a) * r,
        rot: [rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI] as [number, number, number],
        size: 0.025 + rand() * 0.035,
        color: RAINBOW[i % RAINBOW.length],
      };
    });
  }, []);

  return (
    <group>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const color = RAINBOW[i % RAINBOW.length];
        return (
          <group key={`o-${i}`} rotation={[0, a, 0]}>
            <group rotation={[-Math.PI / 2 + 0.15, 0, 0]}>
              <CrystalPetal shape={outer} color={color} emissive={color} emissiveIntensity={0.7} />
            </group>
          </group>
        );
      })}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 10;
        const color = RAINBOW[(i + 3) % RAINBOW.length];
        return (
          <group key={`m-${i}`} rotation={[0, a, 0]}>
            <group
              position={[0, 0.05, 0]}
              rotation={[-Math.PI / 2 + 0.45, 0, 0]}
            >
              <CrystalPetal shape={mid} color={color} emissive={color} emissiveIntensity={0.9} opacity={0.7} />
            </group>
          </group>
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <group key={`i-${i}`} rotation={[0, a, 0]}>
            <group
              position={[0, 0.12, 0]}
              rotation={[-Math.PI / 2 + 0.85, 0, 0]}
            >
              <CrystalPetal shape={inner} color={ICE_WHITE} emissive="#ffffff" emissiveIntensity={1.4} opacity={0.65} />
            </group>
          </group>
        );
      })}
      {/* 中心の強烈な光のコア */}
      <mesh position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.11, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={7}
          toneMapped={false}
        />
      </mesh>
      {/* 放射状の光線（細い円柱） */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={`ray-${i}`}
            position={[Math.cos(a) * 0.22, 0.14, Math.sin(a) * 0.22]}
            rotation={[0, -a, Math.PI / 2]}
            scale={[0.008, 0.2, 0.008]}
          >
            <cylinderGeometry args={[1, 1, 1, 6]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={3}
              transparent
              opacity={0.7}
              toneMapped={false}
            />
          </mesh>
        );
      })}
      {/* 浮遊する小結晶 */}
      {crystals.map((c, i) => (
        <mesh key={`fc-${i}`} position={[c.x, c.y, c.z]} rotation={c.rot}>
          <octahedronGeometry args={[c.size, 0]} />
          <meshPhysicalMaterial
            color={c.color}
            emissive={c.color}
            emissiveIntensity={1.2}
            roughness={0.1}
            transmission={0.5}
            thickness={0.1}
            transparent
            opacity={0.85}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** 氷のような透明な葉 */
function CrystalLeaves({ stemHeight }: { stemHeight: number }) {
  const leaf = useMemo(() => swordLeaf(0.4, 0.08), []);
  return (
    <>
      {[0.3, 0.55, 0.8].map((t, idx) => {
        const y = stemHeight * t;
        const angle = (idx * 2.1) % (Math.PI * 2);
        return (
          <group key={idx} position={[0, y, 0]} rotation={[0, angle, 0]}>
            <mesh
              rotation={[-Math.PI / 2 - 0.1, 0, -0.1]}
              position={[0.02, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[leaf, leafExtrude]} />
              <meshPhysicalMaterial
                color={ICE_WHITE}
                emissive={ICE_BLUE}
                emissiveIntensity={0.4}
                roughness={0.15}
                transmission={0.6}
                thickness={0.15}
                transparent
                opacity={0.8}
                side={DoubleSide}
                toneMapped={false}
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
const STEM_RADIUS = 0.022;

export function CrystalFlower({ stage, position = [0, 0, 0] }: Props) {
  return (
    <group position={position}>
      <CrystalLeaves stemHeight={STEM_HEIGHT} />
      {/* 透明な茎（氷柱のような） */}
      <mesh position={[0, STEM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[STEM_RADIUS * 0.8, STEM_RADIUS, STEM_HEIGHT, 12]}
        />
        <meshPhysicalMaterial
          color={ICE_WHITE}
          emissive={ICE_BLUE}
          emissiveIntensity={0.35}
          roughness={0.15}
          transmission={0.55}
          thickness={0.2}
          transparent
          opacity={0.8}
          toneMapped={false}
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
