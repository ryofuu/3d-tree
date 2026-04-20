import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef } from "react";
import { Color, Object3D } from "three";
import type { InstancedMesh } from "three";

const PETAL_COUNT = 600;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

function FeatherFlower() {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < PETAL_COUNT; i++) {
      const t = i / PETAL_COUNT;
      const angle = i * GOLDEN;
      const r = Math.sqrt(t) * 2.8 + 0.1;
      const domeY = (1 - Math.sqrt(t)) * 1.4;
      const tilt = 0.15 + (1 - t) * 0.6;
      const petalLen = 0.25 + t * 0.35;

      dummy.position.set(Math.cos(angle) * r, domeY, Math.sin(angle) * r);
      dummy.rotation.order = "YZX";
      dummy.rotation.set(0, -angle, tilt);
      dummy.scale.set(petalLen, 0.05, 0.1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // 内側：ホットピンク → 外側：金〜オレンジ
      color.setHSL(0.94 - t * 0.12, 0.85, 0.55 + t * 0.2);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dummy, color]);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    mesh.rotation.y = t * 0.12;
    // 全体のゆっくりした脈動
    const pulse = 1 + Math.sin(t * 1.5) * 0.03;
    mesh.scale.set(pulse, pulse, pulse);
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, PETAL_COUNT] as never}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        roughness={0.3}
        metalness={0.2}
        emissive="#ff2277"
        emissiveIntensity={0.4}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

function CoreGlow() {
  return (
    <mesh position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.35, 24, 24]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffaa55"
        emissiveIntensity={4}
        toneMapped={false}
      />
    </mesh>
  );
}

export function FeatherScene() {
  return (
    <Canvas camera={{ position: [0, 3.5, 6], fov: 50 }}>
      <color attach="background" args={["#130020"]} />
      <ambientLight intensity={0.3} />
      <pointLight
        position={[0, 2, 0]}
        intensity={3}
        color="#ff66aa"
        distance={10}
      />
      <directionalLight position={[5, 8, 3]} intensity={0.8} color="#ffe0d0" />
      <CoreGlow />
      <FeatherFlower />
      <Sparkles
        count={250}
        scale={10}
        size={1.5}
        speed={0.2}
        color="#ffd0e0"
      />
      <OrbitControls />
      <EffectComposer>
        <Bloom
          intensity={1.3}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
