import { useMemo } from "react";
import { STAGES, type Stage } from "./stages";

type TreeProps = {
  /** 成長段階。これ一つで姿・色・葉量が決まる */
  stage?: Stage;
  /** 乱数シード。同じ値なら毎レンダリング同じ形状になる */
  seed?: number;
  /** 根元の位置 */
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

function generateLeaves(
  count: number,
  crownCenterY: number,
  crownRadius: number,
  leafRadiusFactor: number,
  colors: string[],
  rand: () => number,
): Leaf[] {
  const leaves: Leaf[] = [];
  for (let i = 0; i < count; i++) {
    // 球状分布で葉を配置
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = crownRadius * (0.4 + 0.6 * rand());
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    // やや縦長にする
    const yStretch = 1.2;
    leaves.push({
      position: [x, crownCenterY + y * yStretch, z],
      radius: crownRadius * (0.25 + 0.2 * rand()) * leafRadiusFactor,
      color: colors[Math.floor(rand() * colors.length)],
    });
  }
  return leaves;
}

export function Tree({
  stage = "mature",
  seed = 1,
  position = [0, 0, 0],
}: TreeProps) {
  const cfg = STAGES[stage];

  const { trunkHeight, trunkRadius, leaves } = useMemo(() => {
    const rand = mulberry32(seed);
    const trunkH = cfg.height * 0.55;
    const trunkR = cfg.height * 0.06;
    const crownR = cfg.height * 0.35;
    const crownCY = trunkH + crownR * 0.3;
    return {
      trunkHeight: trunkH,
      trunkRadius: trunkR,
      leaves: generateLeaves(
        cfg.leafCount,
        crownCY,
        crownR,
        cfg.leafRadiusFactor,
        cfg.leafColors,
        rand,
      ),
    };
  }, [cfg, seed]);

  return (
    <group position={position}>
      {/* 幹 */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[trunkRadius * 0.7, trunkRadius, trunkHeight, 12]}
        />
        <meshStandardMaterial color={cfg.trunkColor} roughness={0.9} />
      </mesh>

      {/* 葉（桜の場合は花） */}
      {leaves.map((leaf, i) => (
        <mesh key={i} position={leaf.position} castShadow>
          <icosahedronGeometry args={[leaf.radius, 1]} />
          <meshStandardMaterial color={leaf.color} roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  );
}
