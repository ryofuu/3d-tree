import { useMemo } from "react";
import { DoubleSide } from "three";
import { petalShape } from "./flowerShapes";

type Props = {
  colors: string[];
  scale?: number;
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

const OUTER_COUNT = 14;
const INNER_COUNT = 10;
const CENTER_R = 0.2;

const petalExtrude = {
  depth: 0.02,
  bevelEnabled: true,
  bevelSegments: 2,
  steps: 1,
  bevelSize: 0.01,
  bevelThickness: 0.006,
};

/**
 * 開花した花の頭部。外側 + 内側の二重花びら、花芯ドーム、散らしたおしべ。
 * 原点が花の中心（花芯の底）になるよう配置。
 */
export function FlowerBloom({ colors, scale = 1 }: Props) {
  const outerShape = useMemo(() => petalShape(0.55, 0.14), []);
  const innerShape = useMemo(() => petalShape(0.38, 0.1), []);

  const stamens = useMemo(() => {
    const rand = mulberry32(7);
    const arr: Array<{ pos: [number, number, number]; shade: number }> = [];
    for (let i = 0; i < 45; i++) {
      const angle = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * CENTER_R * 0.85;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const domeY =
        Math.sqrt(Math.max(0.0001, CENTER_R * CENTER_R - r * r)) * 0.45;
      arr.push({ pos: [x, domeY + 0.015, z], shade: rand() });
    }
    return arr;
  }, []);

  return (
    <group scale={scale}>
      {/* 外側の花びら */}
      {Array.from({ length: OUTER_COUNT }).map((_, i) => {
        const angle = (i / OUTER_COUNT) * Math.PI * 2;
        return (
          <group key={`outer-${i}`} rotation={[0, angle, 0]}>
            <mesh rotation={[-Math.PI / 2 + 0.22, 0, 0]} castShadow>
              <extrudeGeometry args={[outerShape, petalExtrude]} />
              <meshStandardMaterial
                color={colors[i % colors.length]}
                roughness={0.45}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* 内側の花びら（半ステップ回転ずらして二重見せ） */}
      {Array.from({ length: INNER_COUNT }).map((_, i) => {
        const angle =
          (i / INNER_COUNT) * Math.PI * 2 + Math.PI / INNER_COUNT;
        return (
          <group key={`inner-${i}`} rotation={[0, angle, 0]}>
            <mesh
              position={[0, 0.04, 0]}
              rotation={[-Math.PI / 2 + 0.55, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[innerShape, petalExtrude]} />
              <meshStandardMaterial
                color={colors[(i + 1) % colors.length]}
                roughness={0.4}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* 花芯ドーム */}
      <mesh position={[0, 0.01, 0]} castShadow>
        <sphereGeometry
          args={[CENTER_R, 28, 28, 0, Math.PI * 2, 0, Math.PI / 2.2]}
        />
        <meshStandardMaterial color="#f4b400" roughness={0.7} />
      </mesh>

      {/* おしべ */}
      {stamens.map((s, i) => (
        <mesh key={`st-${i}`} position={s.pos} castShadow>
          <sphereGeometry args={[0.013, 8, 8]} />
          <meshStandardMaterial
            color={s.shade > 0.5 ? "#7a4420" : "#a06030"}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
