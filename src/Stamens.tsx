import { useMemo } from "react";

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

type StamensProps = {
  count: number;
  /** 中心からの分布半径 */
  centerR: number;
  /** ドーム上に分布するか、平面上に分布するか */
  shape?: "dome" | "flat";
  /** ドーム形状係数（1 で半球、小さいほど浅く） */
  domeCoef?: number;
  /** おしべ先端の色 */
  color?: string;
  /** 色のシェードを揺らす */
  colorAlt?: string;
  /** 花糸の長さ。0 なら点だけ */
  filamentHeight?: number;
  /** 花糸の色 */
  filamentColor?: string;
  tipSize?: number;
  seed?: number;
};

/**
 * 花芯のおしべ。乱数で散らばった位置に細い花糸 + 先端の葯（やく）を並べる。
 * 花芯ドームの上に重ねる用途と、トランペット奥に立てる用途の両方に対応。
 */
export function Stamens({
  count,
  centerR,
  shape = "dome",
  domeCoef = 0.45,
  color = "#7a4420",
  colorAlt,
  filamentHeight = 0,
  filamentColor = "#e8d080",
  tipSize = 0.014,
  seed = 7,
}: StamensProps) {
  const items = useMemo(() => {
    const rand = mulberry32(seed);
    const arr: Array<{
      x: number;
      baseY: number;
      tipY: number;
      z: number;
      useAlt: boolean;
    }> = [];
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * centerR * 0.85;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const baseY =
        shape === "dome"
          ? Math.sqrt(Math.max(0.0001, centerR * centerR - r * r)) * domeCoef
          : 0;
      arr.push({
        x,
        baseY,
        tipY: baseY + filamentHeight,
        z,
        useAlt: rand() > 0.5,
      });
    }
    return arr;
  }, [count, centerR, shape, domeCoef, filamentHeight, seed]);

  return (
    <>
      {items.map((p, i) => (
        <group key={i}>
          {filamentHeight > 0 && (
            <mesh position={[p.x, p.baseY + filamentHeight / 2, p.z]}>
              <cylinderGeometry args={[0.006, 0.008, filamentHeight, 6]} />
              <meshStandardMaterial color={filamentColor} roughness={0.6} />
            </mesh>
          )}
          <mesh position={[p.x, p.tipY, p.z]}>
            <sphereGeometry args={[tipSize, 8, 8]} />
            <meshStandardMaterial
              color={p.useAlt && colorAlt ? colorAlt : color}
              roughness={0.5}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}
