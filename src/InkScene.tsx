import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector2 } from "three";
import type { ShaderMaterial } from "three";

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec2 uAspect;
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

float petal(vec2 p, float angle, float len, float w) {
  float c = cos(angle);
  float s = sin(angle);
  vec2 rp = vec2(c * p.x + s * p.y, -s * p.x + c * p.y);
  rp.y -= len * 0.5;
  return length(vec2(rp.x / w, rp.y / (len * 0.5)));
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.0 * uAspect;

  // 墨流し的なドメイン歪み
  vec2 warpP = uv * 2.0 + vec2(uTime * 0.05);
  vec2 warp = vec2(
    fbm(warpP),
    fbm(warpP + vec2(17.3, 42.1))
  ) - 0.5;
  vec2 p = uv + warp * 0.18;

  // 7枚の花びらを回転させて重ねる
  float minD = 1e9;
  float rot = uTime * 0.06;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float a = fi * 6.283185 / 7.0 + rot;
    float len = 0.75 + sin(uTime * 0.3 + fi * 1.2) * 0.08;
    float d = petal(p, a, len, 0.2);
    minD = min(minD, d);
  }

  // 中央の墨玉
  float center = length(p) / 0.18;
  minD = min(minD, center);

  // 墨の濃度
  float ink = smoothstep(1.15, 0.7, minD);
  ink *= 0.65 + 0.35 * fbm(uv * 8.0 + uTime * 0.04);
  ink = max(ink, smoothstep(0.22, 0.0, length(p)));

  // 色相サイクル
  vec3 col1 = vec3(0.08, 0.03, 0.25);
  vec3 col2 = vec3(0.45, 0.05, 0.3);
  vec3 col3 = vec3(0.2, 0.15, 0.45);
  float phase = uTime * 0.15;
  vec3 inkCol = mix(col1, col2, 0.5 + 0.5 * sin(phase));
  inkCol = mix(inkCol, col3, 0.5 + 0.5 * sin(phase + 2.0));

  // 和紙風の背景
  vec3 bg = vec3(0.96, 0.93, 0.82);
  bg -= fbm(uv * 6.0) * 0.05;

  vec3 finalCol = mix(bg, inkCol, clamp(ink, 0.0, 1.0));
  gl_FragColor = vec4(finalCol, 1.0);
}
`;

function InkQuad() {
  const matRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: new Vector2(1, 1) },
    }),
    [],
  );
  useFrame((state) => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    const { width, height } = state.size;
    const aspect = width / height;
    if (aspect > 1) {
      mat.uniforms.uAspect.value.set(aspect, 1);
    } else {
      mat.uniforms.uAspect.value.set(1, 1 / aspect);
    }
  });
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export function InkScene() {
  return (
    <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
      <InkQuad />
    </Canvas>
  );
}
