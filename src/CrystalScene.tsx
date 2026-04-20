import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef } from "react";
import type { Group } from "three";

function CrystalFlower() {
  const groupRef = useRef<Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  const rings = [
    { count: 6, radius: 0.55, size: 0.35, tilt: 0.2, color: "#bce7ff" },
    { count: 8, radius: 1.15, size: 0.55, tilt: 0.4, color: "#a5c8ff" },
    { count: 10, radius: 1.85, size: 0.75, tilt: 0.55, color: "#c5baff" },
  ];

  return (
    <group ref={groupRef}>
      {/* 発光コア */}
      <mesh>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#60d0ff"
          emissiveIntensity={4}
          toneMapped={false}
        />
      </mesh>
      {/* クリスタル花びら：多面体 + 物理マテリアル（屈折） */}
      {rings.flatMap((ring, rIdx) =>
        Array.from({ length: ring.count }).map((_, i) => {
          const angle = (i / ring.count) * Math.PI * 2;
          const x = Math.cos(angle) * ring.radius;
          const z = Math.sin(angle) * ring.radius;
          return (
            <mesh
              key={`${rIdx}-${i}`}
              position={[x, 0, z]}
              rotation={[ring.tilt, angle, 0]}
              scale={ring.size}
            >
              <icosahedronGeometry args={[1, 0]} />
              <meshPhysicalMaterial
                color={ring.color}
                transmission={0.88}
                thickness={0.5}
                ior={1.5}
                roughness={0.05}
                clearcoat={1}
                clearcoatRoughness={0.05}
                transparent
                opacity={0.96}
              />
            </mesh>
          );
        }),
      )}
      {/* コアから放射する小さな発光シャード */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={`spike-${i}`}
            position={[Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45]}
            rotation={[0, angle, 0]}
          >
            <coneGeometry args={[0.05, 0.3, 6]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#80e0ff"
              emissiveIntensity={3}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function CrystalScene() {
  return (
    <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }} gl={{ antialias: true }}>
      <color attach="background" args={["#05041a"]} />
      <ambientLight intensity={0.2} />
      <pointLight
        position={[0, 0, 0]}
        intensity={3}
        color="#60c8ff"
        distance={8}
      />
      <directionalLight position={[5, 8, 5]} intensity={0.4} color="#ffffff" />
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
        <CrystalFlower />
      </Float>
      <Sparkles count={250} scale={10} size={2} speed={0.25} color="#80e0ff" />
      <OrbitControls enablePan={false} />
      <EffectComposer>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
