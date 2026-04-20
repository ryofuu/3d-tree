import { useMemo } from "react";
import { DoubleSide } from "three";
import { cherryPetal, ovateLeaf } from "./petalLibrary";
import { Stamens } from "./Stamens";
import type { FlowerStage } from "./GerberaFlower";

const petalExtrude = {
  depth: 0.014,
  bevelEnabled: true,
  bevelSegments: 2,
  steps: 1,
  bevelSize: 0.008,
  bevelThickness: 0.005,
};

const leafExtrude = {
  depth: 0.01,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.005,
  bevelThickness: 0.003,
};

const PINK_LIGHT = "#ffe4ee";
const PINK = "#ffc1d6";
const PINK_DEEP = "#f48eb1";
const SEPAL = "#a83a52";
const CENTER_RED = "#d24a76";

/** 5枚の赤茶色の萼 */
function Sepals({ openAngle = 0 }: { openAngle?: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh
              position={[0.05, 0.05, 0]}
              rotation={[0, 0, -0.55 - openAngle]}
              scale={[0.4, 1, 0.4]}
              castShadow
            >
              <coneGeometry args={[0.03, 0.14, 8]} />
              <meshStandardMaterial color={SEPAL} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/** ステージ1：縦長の濃ピンクの蕾 */
function Bud() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} scale={[0.7, 1.2, 0.7]} castShadow>
        <sphereGeometry args={[0.08, 18, 18]} />
        <meshStandardMaterial color={PINK_DEEP} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <coneGeometry args={[0.035, 0.05, 8]} />
        <meshStandardMaterial color={PINK_DEEP} roughness={0.55} />
      </mesh>
      <Sepals />
    </group>
  );
}

/** ステージ2：花びらが少し覗くほころび */
function Opening() {
  const petal = useMemo(() => cherryPetal(0.22, 0.16), []);
  return (
    <group>
      <mesh position={[0, 0.1, 0]} scale={[0.78, 1.0, 0.78]} castShadow>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial color={PINK_DEEP} roughness={0.55} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              position={[0, 0.18, 0.012]}
              rotation={[-Math.PI / 2 + 1.05, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[petal, petalExtrude]} />
              <meshStandardMaterial
                color={PINK}
                roughness={0.45}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      <Sepals openAngle={0.18} />
    </group>
  );
}

/** ステージ3：5枚の切れ込み花びら + 黄色の長おしべ（典型的なサクラ） */
function Bloom() {
  const petal = useMemo(() => cherryPetal(0.4, 0.3), []);
  return (
    <group>
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh
              rotation={[-Math.PI / 2 + 0.55, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[petal, petalExtrude]} />
              <meshStandardMaterial
                color={PINK}
                roughness={0.4}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.012, 0]} castShadow>
        <sphereGeometry
          args={[0.05, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]}
        />
        <meshStandardMaterial color={CENTER_RED} roughness={0.65} />
      </mesh>
      <Stamens
        count={28}
        centerR={0.06}
        shape="flat"
        color="#f7c52e"
        colorAlt="#e8a020"
        filamentHeight={0.13}
        filamentColor="#fff0c0"
        tipSize={0.013}
        seed={31}
      />
    </group>
  );
}

/** ステージ4：八重桜。3層の花びら */
function Rich() {
  const outer = useMemo(() => cherryPetal(0.42, 0.32), []);
  const inner = useMemo(() => cherryPetal(0.3, 0.22), []);
  return (
    <group>
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={`o-${i}`} rotation={[0, angle, 0]}>
            <mesh rotation={[-Math.PI / 2 + 0.45, 0, 0]} castShadow>
              <extrudeGeometry args={[outer, petalExtrude]} />
              <meshStandardMaterial
                color={PINK}
                roughness={0.4}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2 + Math.PI / 5;
        return (
          <group key={`m-${i}`} rotation={[0, angle, 0]}>
            <mesh
              position={[0, 0.04, 0]}
              rotation={[-Math.PI / 2 + 0.7, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[outer, petalExtrude]} />
              <meshStandardMaterial
                color={PINK_LIGHT}
                roughness={0.4}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={`i-${i}`} rotation={[0, angle, 0]}>
            <mesh
              position={[0, 0.08, 0]}
              rotation={[-Math.PI / 2 + 1.0, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[inner, petalExtrude]} />
              <meshStandardMaterial
                color={PINK_LIGHT}
                roughness={0.4}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.07, 0]} castShadow>
        <sphereGeometry
          args={[0.04, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2.2]}
        />
        <meshStandardMaterial color={CENTER_RED} roughness={0.65} />
      </mesh>
      <Stamens
        count={36}
        centerR={0.05}
        shape="flat"
        color="#f7c52e"
        colorAlt="#e8a020"
        filamentHeight={0.11}
        filamentColor="#fff0c0"
        tipSize={0.013}
        seed={37}
      />
    </group>
  );
}

/** ステージ5：発光花びらと浮遊花弁 */
function Spectacular() {
  const outer = useMemo(() => cherryPetal(0.46, 0.34), []);
  const mid = useMemo(() => cherryPetal(0.36, 0.27), []);
  const inner = useMemo(() => cherryPetal(0.26, 0.2), []);

  const floating = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const r = 0.5 + (i % 3) * 0.08;
      return {
        x: Math.cos(a) * r,
        y: 0.22 + (i % 4) * 0.08,
        z: Math.sin(a) * r,
        rot: a,
      };
    });
  }, []);

  return (
    <group>
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={`o-${i}`} rotation={[0, angle, 0]}>
            <mesh rotation={[-Math.PI / 2 + 0.35, 0, 0]} castShadow>
              <extrudeGeometry args={[outer, petalExtrude]} />
              <meshStandardMaterial
                color={PINK}
                emissive={PINK}
                emissiveIntensity={0.3}
                roughness={0.35}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2 + Math.PI / 5;
        return (
          <group key={`m-${i}`} rotation={[0, angle, 0]}>
            <mesh
              position={[0, 0.05, 0]}
              rotation={[-Math.PI / 2 + 0.6, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[mid, petalExtrude]} />
              <meshStandardMaterial
                color={PINK_LIGHT}
                emissive={PINK_LIGHT}
                emissiveIntensity={0.3}
                roughness={0.35}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <group key={`i-${i}`} rotation={[0, angle, 0]}>
            <mesh
              position={[0, 0.1, 0]}
              rotation={[-Math.PI / 2 + 0.95, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[inner, petalExtrude]} />
              <meshStandardMaterial
                color="#ffeef4"
                emissive="#ffc6db"
                emissiveIntensity={0.4}
                roughness={0.35}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.1, 0]} castShadow>
        <sphereGeometry
          args={[0.05, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]}
        />
        <meshStandardMaterial
          color="#ff8800"
          emissive="#ffaa20"
          emissiveIntensity={1.4}
          roughness={0.5}
          toneMapped={false}
        />
      </mesh>
      <Stamens
        count={50}
        centerR={0.06}
        shape="flat"
        color="#fff060"
        colorAlt="#ffc040"
        filamentHeight={0.14}
        filamentColor="#fff8d0"
        tipSize={0.016}
        seed={41}
      />
      {floating.map((p, i) => (
        <group
          key={`f-${i}`}
          position={[p.x, p.y, p.z]}
          rotation={[0, p.rot, 0]}
        >
          <mesh rotation={[-Math.PI / 4, 0, 0]}>
            <extrudeGeometry args={[inner, petalExtrude]} />
            <meshStandardMaterial
              color={PINK_LIGHT}
              emissive={PINK_LIGHT}
              emissiveIntensity={0.5}
              roughness={0.4}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const r = 0.32;
        return (
          <mesh
            key={`d-${i}`}
            position={[Math.cos(angle) * r, 0.12, Math.sin(angle) * r]}
          >
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffd0e0"
              emissiveIntensity={2.2}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** 茎の途中につく葉 */
function StemLeaves() {
  const leaf = useMemo(() => ovateLeaf(0.32, 0.13), []);
  return (
    <>
      {Array.from({ length: 2 }).map((_, i) => {
        const angle = (i / 2) * Math.PI;
        const yPos = 0.45 + i * 0.32;
        return (
          <group key={i} position={[0, yPos, 0]} rotation={[0, angle, 0]}>
            <mesh
              rotation={[-Math.PI / 2 + 0.5, 0, 0.4]}
              position={[0.06, 0, 0]}
              castShadow
            >
              <extrudeGeometry args={[leaf, leafExtrude]} />
              <meshStandardMaterial
                color="#5a8b3a"
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

type CherryProps = {
  stage: FlowerStage;
  position?: [number, number, number];
};

const STEM_HEIGHT = 1.4;
const STEM_RADIUS = 0.024;

export function CherryFlower({ stage, position = [0, 0, 0] }: CherryProps) {
  return (
    <group position={position}>
      <StemLeaves />
      {/* 茎は小枝らしく褐色寄り */}
      <mesh position={[0, STEM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[STEM_RADIUS * 0.8, STEM_RADIUS * 1.1, STEM_HEIGHT, 12]}
        />
        <meshStandardMaterial color="#6a4a2a" roughness={0.85} />
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
