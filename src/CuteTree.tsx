import { useMemo } from "react";
import { CUTE_STAGES } from "./cuteStages";
import type { Stage } from "./stages";
import { Face } from "./Face";

type CuteTreeProps = {
  stage?: Stage;
  seed?: number;
  position?: [number, number, number];
};

type Leaf = {
  position: [number, number, number];
  radius: number;
  color: string;
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * クラウンの「主玉」を上半球寄せでばらまく。
 * 苗 (mainCount=1) は中央にひとつだけ置く。
 */
function generateMains(
  count: number,
  crownCenterY: number,
  crownRadius: number,
  leafRadiusFactor: number,
  colors: string[],
  rand: () => number,
): Leaf[] {
  if (count === 1) {
    return [
      {
        position: [0, crownCenterY + crownRadius * 0.2, 0],
        radius: crownRadius * 0.75 * leafRadiusFactor,
        color: colors[0],
      },
    ];
  }
  const leaves: Leaf[] = [];
  for (let i = 0; i < count; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = rand() * Math.PI * 0.55;
    const r = crownRadius * (0.35 + 0.45 * rand());
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    leaves.push({
      position: [x, crownCenterY + y * 0.5, z],
      radius: crownRadius * (0.4 + 0.2 * rand()) * leafRadiusFactor,
      color: colors[Math.floor(rand() * colors.length)],
    });
  }
  return leaves;
}

/**
 * 主玉の表面に小さな「バンプ」を貼り付けて凹凸と密度を出す。
 * Toy Story 調のもこもこ感に寄与。
 */
function generateBumps(
  mains: Leaf[],
  bumpsPerMain: number,
  colors: string[],
  rand: () => number,
): Leaf[] {
  const bumps: Leaf[] = [];
  for (const main of mains) {
    for (let j = 0; j < bumpsPerMain; j++) {
      // バンプは主玉の上〜横半球側に寄せる（下側には付けない）
      const theta = rand() * Math.PI * 2;
      const phi = rand() * Math.PI * 0.7;
      const surfaceR = main.radius * 0.85;
      const dx = Math.sin(phi) * Math.cos(theta) * surfaceR;
      const dy = Math.cos(phi) * surfaceR;
      const dz = Math.sin(phi) * Math.sin(theta) * surfaceR;
      bumps.push({
        position: [
          main.position[0] + dx,
          main.position[1] + dy,
          main.position[2] + dz,
        ],
        radius: main.radius * (0.35 + 0.2 * rand()),
        color: colors[Math.floor(rand() * colors.length)],
      });
    }
  }
  return bumps;
}

export function CuteTree({
  stage = "mature",
  seed = 1,
  position = [0, 0, 0],
}: CuteTreeProps) {
  const cfg = CUTE_STAGES[stage];

  const { trunkHeight, trunkRadius, leaves, crownCenterY, crownRadius } =
    useMemo(() => {
      const rand = mulberry32(seed);
      const trunkH = cfg.height * 0.5;
      const trunkR = cfg.height * 0.09;
      const crownR = cfg.height * 0.42;
      const crownCY = trunkH + crownR * 0.25;
      const mains = generateMains(
        cfg.mainCount,
        crownCY,
        crownR,
        cfg.leafRadiusFactor,
        cfg.leafColors,
        rand,
      );
      const bumps = generateBumps(mains, cfg.bumpsPerMain, cfg.leafColors, rand);
      return {
        trunkHeight: trunkH,
        trunkRadius: trunkR,
        crownCenterY: crownCY,
        crownRadius: crownR,
        leaves: [...mains, ...bumps],
      };
    }, [cfg, seed]);

  return (
    <group position={position}>
      {/* 幹（末広がりでずんぐり） */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[trunkRadius * 0.8, trunkRadius * 1.2, trunkHeight, 24]}
        />
        <meshStandardMaterial color={cfg.trunkColor} roughness={0.7} />
      </mesh>

      {/* 主玉 + バンプ。スムースシェーディングで柔らかく */}
      {leaves.map((leaf, i) => (
        <mesh key={i} position={leaf.position} castShadow>
          <sphereGeometry args={[leaf.radius, 20, 20]} />
          <meshStandardMaterial color={leaf.color} roughness={0.55} />
        </mesh>
      ))}

      {/* 顔はクラウン正面に配置 */}
      <group position={[0, crownCenterY, crownRadius * 0.95]}>
        <Face scale={cfg.faceScale} withBlush={cfg.mood === "blushing"} />
      </group>
    </group>
  );
}
