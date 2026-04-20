import { useMemo } from "react";
import { DoubleSide } from "three";
import { leafShape } from "./flowerShapes";

type Props = {
  height: number;
  radius: number;
  leafCount?: number;
  leafStartRatio?: number;
};

const leafExtrude = {
  depth: 0.01,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.005,
  bevelThickness: 0.003,
};

/**
 * 茎と、茎に沿って左右交互に生える葉。
 * 葉は薄板の ExtrudeGeometry + 軽いベベルで葉らしい質感に。
 */
export function FlowerStem({
  height,
  radius,
  leafCount = 0,
  leafStartRatio = 0.25,
}: Props) {
  const leafGeomShape = useMemo(() => leafShape(0.38, 0.1), []);
  const smallLeafShape = useMemo(() => leafShape(0.25, 0.07), []);

  const leaves = useMemo(() => {
    if (leafCount <= 0) return [];
    const arr: Array<{ y: number; angle: number; scale: number }> = [];
    const endRatio = 0.8;
    for (let i = 0; i < leafCount; i++) {
      const t =
        leafCount === 1
          ? (leafStartRatio + endRatio) / 2
          : leafStartRatio +
            (i / (leafCount - 1)) * (endRatio - leafStartRatio);
      const y = height * t;
      // 左右交互 + 少しひねり
      const angle = i % 2 === 0 ? 0.1 : Math.PI - 0.1;
      // 下の方の葉を少し大きく
      const scale = 1.1 - t * 0.3;
      arr.push({ y, angle, scale });
    }
    return arr;
  }, [leafCount, leafStartRatio, height]);

  return (
    <group>
      {/* 茎（末広がり・24 分割で滑らかに） */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[radius * 0.8, radius * 1.1, height, 16]}
        />
        <meshStandardMaterial color="#4a8c3a" roughness={0.65} />
      </mesh>

      {/* 葉 */}
      {leaves.map((l, i) => (
        <group
          key={`leaf-${i}`}
          position={[0, l.y, 0]}
          rotation={[0, l.angle, 0]}
          scale={l.scale}
        >
          {/* メインの葉 */}
          <mesh
            rotation={[-Math.PI / 2 + 0.15, 0, 0]}
            position={[0, 0, 0.01]}
            castShadow
          >
            <extrudeGeometry args={[leafGeomShape, leafExtrude]} />
            <meshStandardMaterial
              color="#54a843"
              roughness={0.6}
              side={DoubleSide}
            />
          </mesh>
          {/* 葉柄と小さな副葉（ディテール） */}
          {i % 2 === 0 && (
            <mesh
              rotation={[-Math.PI / 2 + 0.3, 0.4, 0]}
              position={[0.05, -0.02, 0.02]}
              castShadow
            >
              <extrudeGeometry args={[smallLeafShape, leafExtrude]} />
              <meshStandardMaterial
                color="#6bbd4f"
                roughness={0.6}
                side={DoubleSide}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
