import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";

type BranchProps = {
  depth: number;
  length: number;
  radius: number;
  color: string;
  phase?: number;
};

function EmissiveTip({ radius, color }: { radius: number; color: string }) {
  return (
    <mesh>
      <sphereGeometry args={[radius * 3.0, 14, 14]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3.5}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * L-system 的な再帰分岐。depth=0 で発光チップ、
 * それ以外は幹セグメント + 子枝を生成。
 */
function Branch({ depth, length, radius, color, phase = 0 }: BranchProps) {
  if (depth === 0) {
    return <EmissiveTip radius={radius} color={color} />;
  }
  const childCount = 2;
  return (
    <group>
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[radius * 0.55, radius, length, 10]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.25}
        />
      </mesh>
      <group position={[0, length, 0]}>
        {Array.from({ length: childCount }).map((_, i) => {
          const angleY = (i / childCount) * Math.PI * 2 + phase * 0.6;
          const tiltX = 0.58 - depth * 0.04;
          const childPhase = phase + i * 0.7 + depth * 0.3;
          return (
            <group key={i} rotation={[tiltX, angleY, 0]}>
              <Branch
                depth={depth - 1}
                length={length * 0.68}
                radius={radius * 0.62}
                color={color}
                phase={childPhase}
              />
            </group>
          );
        })}
      </group>
    </group>
  );
}

type FloatPetalProps = {
  position: [number, number, number];
  color: string;
  speed: number;
  phaseOff: number;
};

function FloatingPetal({ position, color, speed, phaseOff }: FloatPetalProps) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    m.position.y = position[1] + Math.sin(t * speed + phaseOff) * 0.25;
    m.position.x = position[0] + Math.cos(t * speed * 0.5 + phaseOff) * 0.15;
    m.rotation.y = t * speed * 0.5;
    m.rotation.x = t * speed * 0.3;
  });
  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[0.12, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        toneMapped={false}
      />
    </mesh>
  );
}

export function CoralScene() {
  const petals = useMemo(() => {
    // 疑似乱数：position/speed を useMemo で固定
    const rand = (() => {
      let s = 17;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    })();
    return Array.from({ length: 18 }).map((_, i) => {
      const angle = (i / 18) * Math.PI * 2 + rand() * 0.4;
      const r = 1.3 + rand() * 2;
      return {
        position: [
          Math.cos(angle) * r,
          0.8 + rand() * 2.5,
          Math.sin(angle) * r,
        ] as [number, number, number],
        color:
          i % 3 === 0 ? "#ff4488" : i % 3 === 1 ? "#aa66ff" : "#55ddff",
        speed: 0.3 + rand() * 0.35,
        phaseOff: rand() * Math.PI * 2,
      };
    });
  }, []);

  return (
    <Canvas camera={{ position: [4, 3, 5], fov: 55 }}>
      <color attach="background" args={["#050215"]} />
      <ambientLight intensity={0.15} />
      <pointLight
        position={[0, 2, 0]}
        intensity={1.5}
        color="#ff55aa"
        distance={10}
      />
      <pointLight
        position={[2, 1, 2]}
        intensity={0.7}
        color="#55ccff"
        distance={8}
      />

      {/* 3 本の珊瑚 */}
      <Branch depth={4} length={0.9} radius={0.13} color="#ff4488" />
      <group position={[-1.7, 0, 0.4]} rotation={[0, 1.1, 0]} scale={0.85}>
        <Branch
          depth={4}
          length={0.85}
          radius={0.12}
          color="#aa55ff"
          phase={1.5}
        />
      </group>
      <group position={[1.5, 0, -0.5]} rotation={[0, 2.3, 0]} scale={0.9}>
        <Branch
          depth={4}
          length={0.82}
          radius={0.12}
          color="#55ddff"
          phase={0.8}
        />
      </group>

      {petals.map((p, i) => (
        <FloatingPetal key={i} {...p} />
      ))}

      <Sparkles
        count={400}
        scale={10}
        size={1.5}
        speed={0.3}
        color="#ff88cc"
      />

      <OrbitControls />
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.35}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
