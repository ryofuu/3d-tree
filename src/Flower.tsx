import { FLOWER_STAGES, type FlowerStage } from "./flowerStages";
import { FlowerBloom } from "./FlowerBloom";
import { FlowerBud } from "./FlowerBud";
import { FlowerStem } from "./FlowerStem";

type FlowerProps = {
  stage?: FlowerStage;
  position?: [number, number, number];
};

/** 発芽前の種と、湿った土塊 */
function Seed() {
  return (
    <group>
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.03, 20]} />
        <meshStandardMaterial color="#3a2614" roughness={1} />
      </mesh>
      {/* 種本体 */}
      <mesh
        position={[0, 0.05, 0]}
        rotation={[0.4, 0.3, 0]}
        scale={[0.5, 1, 0.7]}
        castShadow
      >
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
      </mesh>
      {/* 副の種（複数粒感） */}
      <mesh
        position={[0.08, 0.025, -0.05]}
        rotation={[0, 0.5, 0.3]}
        scale={[0.45, 0.8, 0.6]}
        castShadow
      >
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#3a2415" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** 発芽したての双葉 */
function Sprout() {
  return (
    <group>
      {/* 土 */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.02, 16]} />
        <meshStandardMaterial color="#3a2614" roughness={1} />
      </mesh>
      {/* 小さな茎 */}
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.012, 0.16, 12]} />
        <meshStandardMaterial color="#6fa84d" roughness={0.6} />
      </mesh>
      {/* 双葉（丸く平たい葉を左右に） */}
      {[-1, 1].map((dir) => (
        <mesh
          key={dir}
          position={[dir * 0.055, 0.17, 0]}
          rotation={[0, 0, dir * 0.35]}
          scale={[1.1, 0.35, 0.9]}
          castShadow
        >
          <sphereGeometry args={[0.065, 20, 20]} />
          <meshStandardMaterial color="#8ccf5f" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function Flower({ stage = "bloom", position = [0, 0, 0] }: FlowerProps) {
  const cfg = FLOWER_STAGES[stage];

  return (
    <group position={position}>
      {cfg.topPart === "seed" && <Seed />}
      {cfg.topPart === "cotyledons" && <Sprout />}

      {(cfg.topPart === "none" ||
        cfg.topPart === "bud" ||
        cfg.topPart === "bloom") && (
        <FlowerStem
          height={cfg.stemHeight}
          radius={cfg.stemRadius}
          leafCount={cfg.leafCount}
          leafStartRatio={cfg.leafStartRatio}
        />
      )}

      {cfg.topPart === "bud" && (
        <group position={[0, cfg.stemHeight, 0]}>
          <FlowerBud />
        </group>
      )}

      {cfg.topPart === "bloom" && (
        <group position={[0, cfg.stemHeight, 0]}>
          <FlowerBloom colors={cfg.petalColors} />
        </group>
      )}
    </group>
  );
}
