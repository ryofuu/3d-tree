import { useMemo } from "react";
import { DoubleSide } from "three";
import { lilyPetal, swordLeaf } from "./petalLibrary";
import type { FlowerStage } from "./GerberaFlower";

const petalExtrude = {
  depth: 0.018,
  bevelEnabled: true,
  bevelSegments: 2,
  steps: 1,
  bevelSize: 0.01,
  bevelThickness: 0.006,
};

const leafExtrude = {
  depth: 0.01,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.006,
  bevelThickness: 0.004,
};

const LILY_WHITE = "#fff4f0";
const LILY_PINK = "#ffc2d4";
const LILY_DEEP = "#ff8aae";

/**
 * ユリの1本のおしべ：細い花糸 + 先端に葯
 */
function Stamen({
  dirAngle,
  tilt,
  length,
  filamentColor = "#fef2d8",
  antherColor = "#8a4520",
  tipSize = 0.015,
  glow = false,
}: {
  dirAngle: number;
  tilt: number;
  length: number;
  filamentColor?: string;
  antherColor?: string;
  tipSize?: number;
  glow?: boolean;
}) {
  // 花糸は曲線を2つの円柱で近似：基部は垂直、上部は傾く
  const bend = 0.4;
  const baseLen = length * 0.5;
  const tipLen = length * 0.55;
  const midX = Math.cos(dirAngle) * Math.sin(tilt * bend) * length * 0.3;
  const midZ = Math.sin(dirAngle) * Math.sin(tilt * bend) * length * 0.3;
  const tipX = Math.cos(dirAngle) * Math.sin(tilt) * length * 0.7;
  const tipZ = Math.sin(dirAngle) * Math.sin(tilt) * length * 0.7;
  const tipY = Math.cos(tilt) * length * 0.8;

  return (
    <group>
      {/* 基部（垂直） */}
      <mesh
        position={[midX / 2, baseLen / 2, midZ / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.0055, 0.007, baseLen, 6]} />
        <meshStandardMaterial color={filamentColor} roughness={0.5} />
      </mesh>
      {/* 上部（傾斜） */}
      <group
        position={[midX, baseLen, midZ]}
        rotation={[-dirAngle === 0 ? 0 : 0, -dirAngle, tilt * 0.9]}
      >
        <mesh position={[0, tipLen / 2, 0]} castShadow>
          <cylinderGeometry args={[0.005, 0.0055, tipLen, 6]} />
          <meshStandardMaterial color={filamentColor} roughness={0.5} />
        </mesh>
      </group>
      {/* 葯 */}
      <mesh
        position={[tipX, tipY, tipZ]}
        rotation={[0, dirAngle, tilt]}
        scale={[1, 2.2, 1]}
        castShadow
      >
        <sphereGeometry args={[tipSize, 12, 12]} />
        <meshStandardMaterial
          color={antherColor}
          roughness={0.6}
          emissive={glow ? "#ffb060" : "#000000"}
          emissiveIntensity={glow ? 1.6 : 0}
          toneMapped={!glow}
        />
      </mesh>
    </group>
  );
}

/** ステージ1：縦長のつぼみ。6本の縞が見える */
function Bud() {
  return (
    <group>
      <mesh position={[0, 0.28, 0]} scale={[0.55, 1.6, 0.55]} castShadow>
        <sphereGeometry args={[0.14, 26, 26]} />
        <meshStandardMaterial color="#c89aa8" roughness={0.55} />
      </mesh>
      {/* 6本の縦リブ（花びらの境界） */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              position={[0.08, 0.28, 0]}
              scale={[0.15, 1.7, 0.15]}
              castShadow
            >
              <sphereGeometry args={[0.06, 14, 14]} />
              <meshStandardMaterial color="#b87898" roughness={0.55} />
            </mesh>
          </group>
        );
      })}
      {/* 先端 */}
      <mesh position={[0, 0.54, 0]} castShadow>
        <coneGeometry args={[0.05, 0.1, 12]} />
        <meshStandardMaterial color="#a86080" roughness={0.55} />
      </mesh>
    </group>
  );
}

/** ステージ2：先端が6方向に割れ始める */
function Opening() {
  const petal = useMemo(() => lilyPetal(0.5, 0.14), []);
  return (
    <group>
      {/* まだ大部分は閉じている */}
      <mesh position={[0, 0.22, 0]} scale={[0.55, 1.2, 0.55]} castShadow>
        <sphereGeometry args={[0.14, 26, 26]} />
        <meshStandardMaterial color={LILY_PINK} roughness={0.55} />
      </mesh>
      {/* 6枚の花びらが先端で少しだけ開く */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              position={[0.04, 0.42, 0]}
              rotation={[-Math.PI / 2 + 1.1, 0, 0.05]}
              castShadow
            >
              <extrudeGeometry args={[petal, petalExtrude]} />
              <meshStandardMaterial
                color={LILY_WHITE}
                roughness={0.4}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/**
 * ユリの花びらは根元で反り返る。花びらを円筒形に配置するが、
 * 先端が外側に大きく反るように rotation を使って表現する。
 */
function PetalFan({
  count,
  shape,
  tilt,
  recurve,
  yBase = 0.0,
  radialOffset = 0.0,
  angleOffset = 0,
  color,
  emissive,
  emissiveIntensity = 0,
}: {
  count: number;
  shape: import("three").Shape;
  tilt: number;
  recurve: number;
  yBase?: number;
  radialOffset?: number;
  angleOffset?: number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + angleOffset;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            {/* 一段目：tilt（根元の立ち上がり） */}
            <group
              position={[radialOffset, yBase, 0]}
              rotation={[tilt, 0, 0]}
            >
              {/* 二段目：先端で recurve（外側への反り） */}
              <mesh
                position={[0, 0.05, 0]}
                rotation={[-recurve, 0, 0]}
                castShadow
              >
                <extrudeGeometry args={[shape, petalExtrude]} />
                <meshStandardMaterial
                  color={color}
                  emissive={emissive ?? "#000000"}
                  emissiveIntensity={emissiveIntensity}
                  roughness={0.4}
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

/** ユリの花に特徴的な、花びらの内側の斑点 */
function PetalSpots({
  count,
  radius,
  seed = 5,
  color = "#a83050",
}: {
  count: number;
  radius: number;
  seed?: number;
  color?: string;
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
      const ang = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * radius;
      return {
        x: Math.cos(ang) * r,
        z: Math.sin(ang) * r,
        size: 0.01 + rand() * 0.015,
      };
    });
  }, [count, radius, seed]);
  return (
    <>
      {dots.map((d, i) => (
        <mesh key={i} position={[d.x, 0.02, d.z]}>
          <sphereGeometry args={[d.size, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </>
  );
}

/** ステージ3：トランペット開花。6枚の花びらが外反り。6本のおしべ + めしべ */
function Bloom() {
  const petal = useMemo(() => lilyPetal(0.75, 0.22), []);
  return (
    <group>
      <PetalFan
        count={6}
        shape={petal}
        tilt={-0.3}
        recurve={1.0}
        yBase={0}
        color={LILY_WHITE}
      />
      {/* 内側の斑点 */}
      <PetalSpots count={40} radius={0.18} />
      {/* めしべ（中央の柱、先端が3裂） */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.01, 0.4, 10]} />
        <meshStandardMaterial color="#fef0d0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.022, 14, 14]} />
        <meshStandardMaterial color="#c88030" roughness={0.6} />
      </mesh>
      {/* 6本のおしべ */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return (
          <Stamen
            key={i}
            dirAngle={angle}
            tilt={0.5}
            length={0.55}
          />
        );
      })}
    </group>
  );
}

/** ステージ4：豪華。外6枚 + 内6枚の二重、斑点も増える */
function Rich() {
  const outer = useMemo(() => lilyPetal(0.8, 0.24), []);
  const inner = useMemo(() => lilyPetal(0.6, 0.18), []);
  return (
    <group>
      <PetalFan
        count={6}
        shape={outer}
        tilt={-0.15}
        recurve={1.2}
        color={LILY_WHITE}
      />
      <PetalFan
        count={6}
        shape={inner}
        tilt={-0.1}
        recurve={0.7}
        yBase={0.05}
        angleOffset={Math.PI / 6}
        color={LILY_PINK}
      />
      <PetalSpots count={70} radius={0.22} color={LILY_DEEP} />
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.012, 0.44, 10]} />
        <meshStandardMaterial color="#fef0d0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.024, 14, 14]} />
        <meshStandardMaterial color="#c88030" roughness={0.6} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return (
          <Stamen
            key={i}
            dirAngle={angle}
            tilt={0.55}
            length={0.6}
          />
        );
      })}
    </group>
  );
}

/** ステージ5：特別。発光縁・金色おしべ・浮遊花粉 */
function Spectacular() {
  const outer = useMemo(() => lilyPetal(0.88, 0.26), []);
  const inner = useMemo(() => lilyPetal(0.65, 0.2), []);
  const pollen = useMemo(() => {
    let s = 23;
    const rand = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return Array.from({ length: 40 }).map(() => {
      const ang = rand() * Math.PI * 2;
      const r = 0.3 + rand() * 0.5;
      const y = 0.5 + rand() * 0.6;
      return {
        x: Math.cos(ang) * r,
        y,
        z: Math.sin(ang) * r,
        size: 0.008 + rand() * 0.01,
      };
    });
  }, []);

  return (
    <group>
      <PetalFan
        count={6}
        shape={outer}
        tilt={-0.1}
        recurve={1.4}
        color={LILY_WHITE}
        emissive={LILY_PINK}
        emissiveIntensity={0.35}
      />
      <PetalFan
        count={6}
        shape={inner}
        tilt={-0.05}
        recurve={0.9}
        yBase={0.06}
        angleOffset={Math.PI / 6}
        color={LILY_PINK}
        emissive={LILY_DEEP}
        emissiveIntensity={0.4}
      />
      <PetalSpots count={90} radius={0.24} color={LILY_DEEP} />
      {/* めしべ（長く金色に光る） */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.013, 0.5, 12]} />
        <meshStandardMaterial
          color="#ffe8c0"
          emissive="#ffb040"
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.68, 0]} castShadow>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color="#ffd080"
          emissive="#ffaa40"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      {/* 発光するおしべ */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return (
          <Stamen
            key={i}
            dirAngle={angle}
            tilt={0.6}
            length={0.68}
            antherColor="#ffb060"
            tipSize={0.018}
            glow
          />
        );
      })}
      {/* 浮遊する花粉粒（発光） */}
      {pollen.map((p, i) => (
        <mesh key={`p-${i}`} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshStandardMaterial
            color="#fff4c0"
            emissive="#ffd060"
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** 茎に沿って生える細長い葉 */
function StemLeaves({ stemHeight }: { stemHeight: number }) {
  const leaf = useMemo(() => swordLeaf(0.45, 0.07), []);
  const positions = [0.3, 0.55, 0.8];
  return (
    <>
      {positions.map((t, idx) => {
        const y = stemHeight * t;
        const angle = (idx % 2 === 0 ? 0.2 : Math.PI - 0.2);
        return (
          <group key={idx} position={[0, y, 0]} rotation={[0, angle, 0]}>
            <mesh
              rotation={[-Math.PI / 2 - 0.1, 0, -0.1]}
              position={[0.02, 0, 0.02]}
              castShadow
            >
              <extrudeGeometry args={[leaf, leafExtrude]} />
              <meshStandardMaterial
                color="#3e8030"
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

type LilyProps = {
  stage: FlowerStage;
  position?: [number, number, number];
};

const STEM_HEIGHT = 1.8;
const STEM_RADIUS = 0.022;

export function LilyFlower({ stage, position = [0, 0, 0] }: LilyProps) {
  return (
    <group position={position}>
      <StemLeaves stemHeight={STEM_HEIGHT} />
      <mesh position={[0, STEM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[STEM_RADIUS * 0.85, STEM_RADIUS, STEM_HEIGHT, 14]}
        />
        <meshStandardMaterial color="#3e8030" roughness={0.62} />
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
