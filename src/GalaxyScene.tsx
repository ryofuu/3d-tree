import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import { DoubleSide } from "three";
import type { Points, ShaderMaterial } from "three";

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const galaxyFragment = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv - 0.5;
  float r = length(uv) * 2.0;
  float ang = atan(uv.y, uv.x);

  // バラ曲線ライクな花びら輪郭
  float petalR = 0.55 + 0.35 * abs(cos(ang * 3.0 + uTime * 0.05));
  if (r > petalR) discard;

  // 渦巻き（半径が大きくなるほど角度が付く）
  float swirl = ang + log(r * 4.0 + 1.0) * 4.0 + uTime * 0.25;
  float arms = sin(swirl * 3.0) * 0.5 + 0.5;
  float n = fbm(vec2(r * 5.0 - uTime * 0.1, swirl * 1.2));

  vec3 core = vec3(0.02, 0.0, 0.08);
  vec3 arm = vec3(0.9, 0.4, 1.0);
  vec3 hot = vec3(1.0, 0.75, 0.3);

  vec3 col = mix(core, arm, arms * n * 1.3);
  col = mix(col, hot, smoothstep(0.3, 0.05, r) * 0.9);
  col *= smoothstep(0.0, 0.1, r);                 // ブラックホール中心
  col += arm * arms * 0.5 * smoothstep(0.3, 0.7, r);
  col *= smoothstep(petalR, petalR * 0.85, r);    // 花びら輪郭のフェード
  col += hot * 0.6 * exp(-r * r * 18.0);          // 中心の発光

  gl_FragColor = vec4(col, 1.0);
}
`;

function GalaxyDisc() {
  const matRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });
  return (
    <mesh rotation={[-Math.PI / 2.5, 0, 0]}>
      <circleGeometry args={[2.8, 128]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={galaxyFragment}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function StarRing() {
  const pointsRef = useRef<Points>(null);
  const positions = useMemo(() => {
    const N = 2500;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 3.2 + Math.random() * 2.5;
      const y = (Math.random() - 0.5) * 0.4 + Math.sin(angle * 3) * 0.12;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, []);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#ffffff"
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}

export function GalaxyScene() {
  return (
    <Canvas camera={{ position: [0, 3, 7], fov: 50 }}>
      <color attach="background" args={["#000005"]} />
      <GalaxyDisc />
      <StarRing />
      <OrbitControls />
      <EffectComposer>
        <Bloom
          intensity={2.0}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
