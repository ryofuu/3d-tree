"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import type { Group, PointLight } from "three";
import { MathUtils } from "three";
import { CherryFlower } from "./CherryFlower";
import { TulipFlower } from "./TulipFlower";
import { GerberaFlower } from "./GerberaFlower";
import { LilyFlower } from "./LilyFlower";
import { RoseFlower } from "./RoseFlower";
import { BlackFlameFlower } from "./BlackFlameFlower";
import { EvilEyeFlower } from "./EvilEyeFlower";
import { CrystalFlower } from "./CrystalFlower";
import { MoonBellFlower } from "./MoonBellFlower";
import { AbyssFlower } from "./AbyssFlower";
import { FlowerPot, POT_TOP_Y } from "./FlowerPot";
import type { FlowerStage } from "./GerberaFlower";
import { playEvolutionSequence, primeAudio } from "./evolutionAudio";

type Variety =
  | "cherry"
  | "tulip"
  | "gerbera"
  | "lily"
  | "rose"
  | "blackflame"
  | "evileye"
  | "crystal"
  | "moonbell"
  | "abyss";
const VARIETY_ORDER: Variety[] = [
  "cherry",
  "tulip",
  "gerbera",
  "lily",
  "rose",
  "blackflame",
  "evileye",
  "crystal",
  "moonbell",
  "abyss",
];
const VARIETY_LABEL: Record<Variety, string> = {
  cherry: "サクラ",
  tulip: "チューリップ",
  gerbera: "ガーベラ",
  lily: "ユリ",
  rose: "バラ",
  blackflame: "黒焔華",
  evileye: "邪眼花",
  crystal: "星霜水晶花",
  moonbell: "月鳴鈴花",
  abyss: "深海渦潮花",
};

const LEVELS: FlowerStage[] = [1, 2, 3, 4, 5];

type FlowerRef = { variety: Variety; level: FlowerStage };

/** 既定の「何へ」：同種レベル +1。L5 は据え置き */
function defaultNext(from: FlowerRef): FlowerRef {
  if (from.level < 5) {
    return { variety: from.variety, level: (from.level + 1) as FlowerStage };
  }
  return { ...from };
}

function refEquals(a: FlowerRef, b: FlowerRef) {
  return a.variety === b.variety && a.level === b.level;
}

type Phase =
  | "idle"
  | "preparing"
  | "cocoon"
  | "flash"
  | "blooming"
  | "afterglow";

const PHASE_DURATION: Record<Exclude<Phase, "idle">, number> = {
  preparing: 0.6,
  cocoon: 1.5,
  flash: 0.25,
  blooming: 2.0,
  afterglow: 1.2,
};

function FlowerByVariety({
  variety,
  stage,
}: {
  variety: Variety;
  stage: FlowerStage;
}) {
  switch (variety) {
    case "cherry":
      return <CherryFlower stage={stage} />;
    case "tulip":
      return <TulipFlower stage={stage} />;
    case "gerbera":
      return <GerberaFlower stage={stage} />;
    case "lily":
      return <LilyFlower stage={stage} />;
    case "rose":
      return <RoseFlower stage={stage} />;
    case "blackflame":
      return <BlackFlameFlower stage={stage} />;
    case "evileye":
      return <EvilEyeFlower stage={stage} />;
    case "crystal":
      return <CrystalFlower stage={stage} />;
    case "moonbell":
      return <MoonBellFlower stage={stage} />;
    case "abyss":
      return <AbyssFlower stage={stage} />;
  }
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type SharedState = {
  phase: Phase;
  phaseStart: number;
  /** idle 時に「to」を表示するか（進化完了後は true） */
  showResult: boolean;
};

function Cocoon({
  intensity,
  spin,
}: {
  intensity: number;
  spin: number;
}) {
  const groupRef = useRef<Group>(null);
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y = spin;
  });
  const particles = 28;
  return (
    <group ref={groupRef} position={[0, POT_TOP_Y + 1.4, 0]}>
      <mesh scale={0.12 + intensity * 0.55}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color="#fff8d0"
          emissive="#ffe7a0"
          emissiveIntensity={0.8 + intensity * 4}
          transparent
          opacity={0.45 + intensity * 0.35}
          toneMapped={false}
        />
      </mesh>
      {Array.from({ length: particles }).map((_, i) => {
        const angle = (i / particles) * Math.PI * 2;
        const yOff = ((i * 53) % 13) / 13 - 0.5;
        const r =
          MathUtils.lerp(2.2, 0.18, intensity) +
          Math.sin(i * 1.37 + spin * 3) * 0.08;
        const a = angle + spin * 1.5;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(a) * r,
              yOff * (1 - intensity * 0.7),
              Math.sin(a) * r,
            ]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffe8a0"
              emissiveIntensity={2 + intensity * 3}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Afterglow({ progress }: { progress: number }) {
  const particles = 18;
  return (
    <group position={[0, POT_TOP_Y + 1.4, 0]}>
      {Array.from({ length: particles }).map((_, i) => {
        const angle = (i / particles) * Math.PI * 2 + i * 0.37;
        const r = 0.35 + (i % 4) * 0.12;
        const y = progress * (0.4 + (i % 5) * 0.28);
        const fade = 1 - easeOutCubic(progress);
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}
            scale={0.03 + (i % 3) * 0.01}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffe0b8"
              emissiveIntensity={2.2 * fade}
              transparent
              opacity={fade}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function EvolutionStage({
  from,
  to,
  shared,
}: {
  from: FlowerRef;
  to: FlowerRef;
  shared: React.MutableRefObject<SharedState>;
}) {
  const oldRef = useRef<Group>(null);
  const newRef = useRef<Group>(null);
  const cocoonRef = useRef<Group>(null);
  const afterglowRef = useRef<Group>(null);
  const lightRef = useRef<PointLight>(null);
  const spinRef = useRef(0);

  useFrame((_, dt) => {
    spinRef.current += dt * 2.4;
    const { phase, phaseStart, showResult } = shared.current;
    const elapsed = (performance.now() - phaseStart) / 1000;

    let oldScale = 1;
    let oldShake = 0;
    let newScale = 0;
    let cocoonIntensity = 0;
    let cocoonVisible = false;
    let afterglowProgress = 0;
    let afterglowVisible = false;
    let lightStrength = 0;

    if (phase === "idle") {
      if (showResult) {
        oldScale = 0;
        newScale = 1;
      } else {
        oldScale = 1;
        newScale = 0;
      }
    } else if (phase === "preparing") {
      const t = Math.min(elapsed / PHASE_DURATION.preparing, 1);
      oldScale = 1 - t * 0.25;
      oldShake = Math.sin(elapsed * 42) * 0.03 * (1 - t);
      cocoonVisible = true;
      cocoonIntensity = t * 0.35;
      lightStrength = t * 1.2;
    } else if (phase === "cocoon") {
      const t = Math.min(elapsed / PHASE_DURATION.cocoon, 1);
      oldScale = Math.max(0.75 - t * 0.75, 0);
      cocoonVisible = true;
      cocoonIntensity = 0.35 + t * 0.65;
      lightStrength = 1.2 + t * 4;
    } else if (phase === "flash") {
      oldScale = 0;
      newScale = 0;
      cocoonVisible = true;
      cocoonIntensity = 1;
      lightStrength = 6;
    } else if (phase === "blooming") {
      const t = Math.min(elapsed / PHASE_DURATION.blooming, 1);
      oldScale = 0;
      newScale = Math.max(easeOutBack(t), 0);
      lightStrength = Math.max(3 - t * 3, 0);
    } else if (phase === "afterglow") {
      const t = Math.min(elapsed / PHASE_DURATION.afterglow, 1);
      oldScale = 0;
      newScale = 1 + Math.sin(elapsed * 3) * 0.012;
      afterglowVisible = true;
      afterglowProgress = t;
    }

    if (oldRef.current) {
      oldRef.current.scale.setScalar(oldScale);
      oldRef.current.position.x = oldShake;
    }
    if (newRef.current) {
      newRef.current.scale.setScalar(newScale);
    }
    if (cocoonRef.current) {
      cocoonRef.current.visible = cocoonVisible;
      cocoonRef.current.userData.intensity = cocoonIntensity;
      cocoonRef.current.userData.spin = spinRef.current;
    }
    if (afterglowRef.current) {
      afterglowRef.current.visible = afterglowVisible;
      afterglowRef.current.userData.progress = afterglowProgress;
    }
    if (lightRef.current) {
      lightRef.current.intensity = lightStrength;
    }
  });

  return (
    <group>
      <FlowerPot position={[0, 0, 0]} bodyColor="#c0a080" rimColor="#9c7e5c" />
      <group ref={oldRef} position={[0, POT_TOP_Y, 0]}>
        <FlowerByVariety variety={from.variety} stage={from.level} />
      </group>
      <group ref={newRef} position={[0, POT_TOP_Y, 0]}>
        <FlowerByVariety variety={to.variety} stage={to.level} />
      </group>
      <pointLight
        ref={lightRef}
        position={[0, POT_TOP_Y + 1.4, 0]}
        color="#fff0c0"
        intensity={0}
        distance={8}
        decay={2}
      />
      <group ref={cocoonRef} visible={false}>
        <CocoonAnimated />
      </group>
      <group ref={afterglowRef} visible={false}>
        <AfterglowAnimated />
      </group>
    </group>
  );
}

function CocoonAnimated() {
  const [state, setState] = useState({ intensity: 0, spin: 0 });
  const meRef = useRef<Group>(null);
  useFrame(() => {
    const parent = meRef.current?.parent;
    if (!parent) return;
    const intensity = (parent.userData.intensity as number) ?? 0;
    const spin = (parent.userData.spin as number) ?? 0;
    if (intensity !== state.intensity || spin !== state.spin) {
      setState({ intensity, spin });
    }
  });
  return (
    <group ref={meRef}>
      <Cocoon intensity={state.intensity} spin={state.spin} />
    </group>
  );
}

function AfterglowAnimated() {
  const [progress, setProgress] = useState(0);
  const meRef = useRef<Group>(null);
  useFrame(() => {
    const parent = meRef.current?.parent;
    if (!parent) return;
    const p = (parent.userData.progress as number) ?? 0;
    if (p !== progress) setProgress(p);
  });
  return (
    <group ref={meRef}>
      <Afterglow progress={progress} />
    </group>
  );
}

// ─── styles ────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
};

const flashStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "#ffffff",
  pointerEvents: "none",
  zIndex: 10,
  transition: "opacity 120ms ease-out",
};

const phaseLabelStyle: React.CSSProperties = {
  position: "absolute",
  top: 16,
  left: "50%",
  transform: "translateX(-50%)",
  color: "#fff",
  fontFamily: "system-ui, sans-serif",
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "0.2em",
  textShadow: "0 2px 8px rgba(0,0,0,0.6)",
  pointerEvents: "none",
  zIndex: 15,
};

// ─── picker ────────────────────────────────────────────────────────────

function FlowerPicker({
  value,
  onChange,
  disabled,
}: {
  value: FlowerRef;
  onChange: (v: FlowerRef) => void;
  disabled: boolean;
}) {
  return (
    <div className="evo-picker">
      <select
        value={value.variety}
        onChange={(e) =>
          onChange({ ...value, variety: e.target.value as Variety })
        }
        disabled={disabled}
        className="evo-select"
      >
        {VARIETY_ORDER.map((v) => (
          <option key={v} value={v}>
            {VARIETY_LABEL[v]}
          </option>
        ))}
      </select>
      <div className="evo-levels">
        {LEVELS.map((lv) => (
          <button
            key={lv}
            disabled={disabled}
            className={`evo-level-btn${lv === value.level ? " is-active" : ""}`}
            onClick={() => onChange({ ...value, level: lv })}
          >
            L{lv}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────

export function EvolutionScene() {
  const [from, setFrom] = useState<FlowerRef>({
    variety: "cherry",
    level: 1,
  });
  const [to, setTo] = useState<FlowerRef>(
    defaultNext({ variety: "cherry", level: 1 }),
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [flashOn, setFlashOn] = useState(false);
  const shared = useRef<SharedState>({
    phase: "idle",
    phaseStart: performance.now(),
    showResult: false,
  });
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  /** 「from」が変わったら「to」を既定値で追従させ、結果表示をリセット */
  const updateFrom = (next: FlowerRef) => {
    if (phase !== "idle") return;
    setFrom(next);
    setTo(defaultNext(next));
    shared.current.showResult = false;
  };

  /** 「to」は自由指定。ただし現在と同じなら無視してリセット扱いにする */
  const updateTo = (next: FlowerRef) => {
    if (phase !== "idle") return;
    setTo(next);
    shared.current.showResult = false;
  };

  const setPhaseAndShare = (p: Phase, resultOverride?: boolean) => {
    shared.current = {
      phase: p,
      phaseStart: performance.now(),
      showResult:
        resultOverride !== undefined
          ? resultOverride
          : shared.current.showResult,
    };
    setPhase(p);
  };

  const startEvolution = () => {
    if (phase !== "idle") return;
    primeAudio();
    playEvolutionSequence();

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhaseAndShare("preparing", false);

    const schedule = (delayMs: number, fn: () => void) => {
      const id = window.setTimeout(fn, delayMs);
      timersRef.current.push(id);
    };
    const d = PHASE_DURATION;
    schedule(d.preparing * 1000, () => setPhaseAndShare("cocoon"));
    schedule((d.preparing + d.cocoon) * 1000, () => {
      setPhaseAndShare("flash");
      setFlashOn(true);
    });
    schedule((d.preparing + d.cocoon + d.flash) * 1000, () => {
      setPhaseAndShare("blooming");
      setFlashOn(false);
    });
    schedule(
      (d.preparing + d.cocoon + d.flash + d.blooming) * 1000,
      () => setPhaseAndShare("afterglow"),
    );
    schedule(
      (d.preparing + d.cocoon + d.flash + d.blooming + d.afterglow) * 1000,
      () => setPhaseAndShare("idle", true),
    );
  };

  const phaseText: Record<Phase, string> = {
    idle: "",
    preparing: "PREPARING",
    cocoon: "TRANSFORMING",
    flash: "\u2726 \u2726 \u2726",
    blooming: "BLOOMING",
    afterglow: "",
  };

  const isRunning = phase !== "idle";
  const isSameRef = refEquals(from, to);

  return (
    <div style={containerStyle}>
      <Canvas
        shadows
        camera={{ position: [0, 2.2, 5.2], fov: 50 }}
        style={{
          background: "linear-gradient(180deg, #1a1830 0%, #3a2f5a 100%)",
        }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[6, 10, 6]}
          intensity={0.9}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[-5, 6, -4]}
          intensity={0.25}
          color="#b0c4ff"
        />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[6, 48]} />
          <meshStandardMaterial color="#2d2650" roughness={0.9} />
        </mesh>

        <EvolutionStage from={from} to={to} shared={shared} />

        <OrbitControls
          target={[0, POT_TOP_Y + 1.2, 0]}
          enablePan={false}
          minDistance={3}
          maxDistance={9}
        />

        <EffectComposer>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.7}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      <div
        style={{
          ...flashStyle,
          opacity: flashOn ? 0.95 : 0,
        }}
      />

      {phaseText[phase] && (
        <div style={phaseLabelStyle}>{phaseText[phase]}</div>
      )}

      <div className="evo-hud">
        <div className="evo-column">
          <div className="evo-label">何から</div>
          <FlowerPicker
            value={from}
            onChange={updateFrom}
            disabled={isRunning}
          />
        </div>
        <div className="evo-arrow">→</div>
        <div className="evo-column">
          <div className="evo-label">何へ</div>
          <FlowerPicker value={to} onChange={updateTo} disabled={isRunning} />
        </div>
        <button
          className="evo-btn"
          disabled={isRunning || isSameRef}
          onClick={startEvolution}
          title={isSameRef ? "from と to が同じです" : ""}
        >
          {isRunning ? "進化中…" : "進化する"}
        </button>
      </div>
    </div>
  );
}
